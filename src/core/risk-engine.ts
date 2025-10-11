import { ParsedCommand, RiskAssessment, RiskLevel, RiskRule, SentinelConfig } from '../types';
import { isLateNight, isWeekend } from '../utils/time-helper';

export class RiskEngine {
  private config: SentinelConfig;

  constructor(config: SentinelConfig) {
    this.config = config;
  }

  assess(command: ParsedCommand): RiskAssessment {
    let score = 0;
    const matchedRules: RiskRule[] = [];
    const reasons: string[] = [];

    // Check against configured rules
    for (const rule of this.config.rules) {
      if (this.matchesPattern(command.fullCommand, rule.pattern)) {
        if (this.checkConditions(command, rule)) {
          matchedRules.push(rule);
          score += this.getRuleScore(rule.level);
          reasons.push(rule.message);
        }
      }
    }

    // Apply heuristics
    score += this.applyHeuristics(command, reasons);

    // Normalize score to 0-100
    score = Math.min(100, Math.max(0, score));

    return {
      score,
      level: this.calculateLevel(score),
      matchedRules,
      reasons,
    };
  }

  private matchesPattern(command: string, pattern: string): boolean {
    // Convert glob-like pattern to regex
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(regexPattern, 'i');
    return regex.test(command);
  }

  private checkConditions(command: ParsedCommand, rule: RiskRule): boolean {
    if (!rule.conditions) return true;

    // Check branch condition
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

    // Check environment condition
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

  private applyHeuristics(command: ParsedCommand, reasons: string[]): number {
    let heuristicScore = 0;

    // Main branch operations
    if (command.currentBranch === 'main' || command.currentBranch === 'master') {
      heuristicScore += 20;
      reasons.push('Operação na branch principal detectada');
    }

    // Production environment
    if (command.environment === 'production') {
      heuristicScore += 25;
      reasons.push('Ambiente de produção detectado');
    }

    // Force flags
    if (command.args.some(arg => arg.includes('--force') || arg.includes('-f'))) {
      heuristicScore += 30;
      reasons.push('Flag --force detectada. Cuidado com o que deseja.');
    }

    // Destructive keywords
    const destructiveKeywords = ['delete', 'drop', 'remove', 'reset', 'destroy', 'purge', 'truncate'];
    if (destructiveKeywords.some(keyword => command.fullCommand.toLowerCase().includes(keyword))) {
      heuristicScore += 25;
      reasons.push('Comando destrutivo detectado');
    }

    // Late night operations
    if (isLateNight()) {
      heuristicScore += 15;
      reasons.push('Nada de bom acontece depois das 22h');
    }

    // Weekend deployments
    if (isWeekend() && command.fullCommand.toLowerCase().includes('deploy')) {
      heuristicScore += 20;
      reasons.push('Deploy no fim de semana? Seus planos merecem mais que isso.');
    }

    // Database migrations
    if (command.fullCommand.toLowerCase().includes('migrate')) {
      heuristicScore += 15;
      reasons.push('Migração de banco detectada');
    }

    return heuristicScore;
  }

  private calculateLevel(score: number): RiskLevel {
    if (score >= 70) return 'critical';
    if (score >= 40) return 'warning';
    return 'safe';
  }
}
