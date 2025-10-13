import { ParsedCommand, RiskAssessment, RiskLevel, RiskRule, SentinelConfig } from '../types';
import { isLateNight, isWeekend } from '../utils/time-helper';

/**
 * @class RiskEngine
 * @description Evaluates the risk level of a given command based on configured rules and heuristics.
 */
export class RiskEngine {
  private config: SentinelConfig;

  /**
   * Creates an instance of RiskEngine.
   * @param config The Sentinel configuration object containing rules and settings.
   */
  constructor(config: SentinelConfig) {
    this.config = config;
  }

  /**
   * Assesses the risk of a parsed command.
   * It checks against configured rules and applies heuristics to calculate a risk score and level.
   * @param command The parsed command object.
   * @returns A RiskAssessment object containing the score, level, matched rules, and reasons.
   */
  assess(command: ParsedCommand): RiskAssessment {
    let score = 0;
    const matchedRules: RiskRule[] = [];
    const reasons: string[] = [];

    for (const rule of this.config.rules) {
      if (this.matchesPattern(command.fullCommand, rule.pattern)) {
        if (this.checkConditions(command, rule)) {
          matchedRules.push(rule);
          score += this.getRuleScore(rule.level);
          reasons.push(rule.message);
        }
      }
    }

    score += this.applyHeuristics(command, reasons);

    score = Math.min(100, Math.max(0, score));

    if (this.config.globalIntercept && this.calculateLevel(score) === 'safe') {
      score = 40;
      reasons.push('Interceptação global ativada: comando monitorado.');
    }

    return {
      score,
      level: this.calculateLevel(score),
      matchedRules,
      reasons,
    };
  }

  /**
   * Checks if a command string matches a given pattern.
   * Supports glob-like patterns (e.g., `*`, `?`).
   * @param command The full command string to test.
   * @param pattern The glob-like pattern to match against.
   * @returns True if the command matches the pattern, false otherwise.
   */
  private matchesPattern(command: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(regexPattern, 'i');
    return regex.test(command);
  }

  /**
   * Checks if the conditions specified in a risk rule are met by the parsed command.
   * Conditions can include specific Git branches or environment variables.
   * @param command The parsed command object.
   * @param rule The risk rule containing the conditions.
   * @returns True if all conditions are met or no conditions are specified, false otherwise.
   */
  private checkConditions(command: ParsedCommand, rule: RiskRule): boolean {
    if (!rule.conditions) return true;

    if (rule.conditions.branch) {
      const branchPattern = rule.conditions.branch;
      const isNegated = branchPattern.startsWith('!');
      const targetBranch = isNegated ? branchPattern.slice(1) : branchPattern;
      
      if (command.currentBranch) {
        const matches = command.currentBranch === targetBranch;
        if (isNegated ? matches : !matches) {
          return false;
        }
      }
    }

    if (rule.conditions.env) {
      const envPattern = rule.conditions.env;
      const isNegated = envPattern.startsWith('!');
      const targetEnv = isNegated ? envPattern.slice(1) : envPattern;
      
      const matches = command.environment === targetEnv;
      if (isNegated ? matches : !matches) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns the base score for a given risk level.
   * @param level The risk level ('safe', 'warning', 'critical').
   * @returns The corresponding score.
   */
  private getRuleScore(level: RiskLevel): number {
    switch (level) {
      case 'safe':
        return 0;
      case 'warning':
        return 40;
      case 'critical':
        return 80;
    }
  }

  /**
   * Applies various heuristics to adjust the risk score based on command characteristics and context.
   * @param command The parsed command object.
   * @param reasons An array to which reasons for score adjustments will be added.
   * @returns The heuristic-based score adjustment.
   */
  private applyHeuristics(command: ParsedCommand, reasons: string[]): number {
    let heuristicScore = 0;

    if (command.currentBranch === 'main' || command.currentBranch === 'master') {
      heuristicScore += 20;
      reasons.push('Operação na branch principal detectada');
    }

    if (command.environment === 'production') {
      heuristicScore += 25;
      reasons.push('Ambiente de produção detectado');
    }

    if (command.args.some(arg => arg.includes('--force') || arg.includes('-f'))) {
      heuristicScore += 30;
      reasons.push('Flag --force detectada. Cuidado com o que deseja.');
    }

    const destructiveKeywords = ['delete', 'drop', 'remove', 'reset', 'destroy', 'purge', 'truncate'];
    if (destructiveKeywords.some(keyword => command.fullCommand.toLowerCase().includes(keyword))) {
      heuristicScore += 25;
      reasons.push('Comando destrutivo detectado');
    }

    if (isLateNight()) {
      heuristicScore += 15;
      reasons.push('Nada de bom acontece depois das 22h');
    }

    if (isWeekend() && command.fullCommand.toLowerCase().includes('deploy')) {
      heuristicScore += 20;
      reasons.push('Deploy no fim de semana? Seus planos merecem mais que isso.');
    }

    if (command.fullCommand.toLowerCase().includes('migrate')) {
      heuristicScore += 15;
      reasons.push('Migração de banco detectada');
    }

    return heuristicScore;
  }

  /**
   * Determines the risk level based on a numerical score.
   * @param score The calculated risk score.
   * @returns The corresponding RiskLevel ('safe', 'warning', or 'critical').
   */
  private calculateLevel(score: number): RiskLevel {
    if (score >= 70) return 'critical';
    if (score >= 40) return 'warning';
    return 'safe';
  }
}
