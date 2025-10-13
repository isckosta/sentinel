import { execSync } from 'child_process';
import chalk from 'chalk';
import { CommandParser } from './command-parser';
import { RiskEngine } from './risk-engine';
import { DecisionEngine } from './decision-engine';
import { Telemetry } from './telemetry';
import { PluginManager } from './plugin-manager';
import { ConfigLoader } from '../utils/config-loader';
import { getLogger } from '../utils/logger';

/**
 * Calculates the risk level based on a given score.
 * @param score The risk score (0-100).
 * @returns The corresponding RiskLevel ('safe', 'warning', or 'critical').
 */
function calculateLevel(score: number): 'safe' | 'warning' | 'critical' {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'warning';
  return 'safe';
}

/**
 * Executes a command with Sentinel's risk analysis and decision-making process.
 * This function orchestrates the loading of configuration, parsing of the command, risk assessment,
 * user interaction for risky commands, plugin application, telemetry recording, and eventual command execution.
 * @param commandArgs An array of strings representing the command and its arguments.
 * @param options An object containing execution options, such as a custom config path or the '--yes' flag.
 * @param executionOptions An object specifying execution behavior, like 'analyzeOnly'.
 */
export async function executeWithSentinel(
  commandArgs: string[],
  options: { config?: string; yes?: boolean },
  executionOptions: { analyzeOnly: boolean }
): Promise<void> {
  const logger = getLogger();
  try {
    const config = ConfigLoader.load(options.config);

    const parser = new CommandParser();
    const riskEngine = new RiskEngine(config);
    const decisionEngine = new DecisionEngine();
    const telemetry = new Telemetry();
    const pluginManager = new PluginManager();

    if (config.plugins && config.plugins.length > 0) {
      await pluginManager.loadPlugins(config.plugins);
      const loadedPlugins = pluginManager.getLoadedPlugins();
      if (loadedPlugins.length > 0) {
        logger.info({ plugins: loadedPlugins }, 'Plugins loaded');
      }
    }

    const parsedCommand = parser.parse(commandArgs);
    logger.info({ command: parsedCommand.fullCommand }, 'Command received');

    let assessment = riskEngine.assess(parsedCommand);

    const adjustedScore = pluginManager.applyPlugins(parsedCommand, assessment.score);
    if (adjustedScore !== assessment.score) {
      assessment = {
        ...assessment,
        score: adjustedScore,
        level: calculateLevel(adjustedScore),
      };
    }

    logger.info(
      {
        score: assessment.score,
        level: assessment.level,
        reasons: assessment.reasons,
      },
      'Risk assessment completed'
    );

    let decision;
    
    if (assessment.level === 'safe') {
      decision = {
        action: 'allow' as const,
        executed: true,
        timestamp: new Date(),
      };
    } else if (options.yes) {
      decision = {
        action: 'allow' as const,
        executed: true,
        timestamp: new Date(),
      };
    } else {
      decision = await decisionEngine.decide(parsedCommand, assessment);
    }

    if (config.telemetryEnabled !== false) {
      telemetry.recordEvent(parsedCommand, assessment, decision);
      
      const event = {
        timestamp: decision.timestamp,
        command: parsedCommand.fullCommand,
        riskScore: assessment.score,
        riskLevel: assessment.level,
        decision: decision.executed ? ('allowed' as const) : ('blocked' as const),
        executed: decision.executed,
      };
      pluginManager.notifyEvent(event);
    }

    if (executionOptions.analyzeOnly) {
      process.exit(decision.executed ? 0 : 1);
    } else {
      if (decision.executed) {
        console.log(chalk.cyan('\n⚡ Executando comando...\n'));
        
        try {
          execSync(parsedCommand.fullCommand, {
            stdio: 'inherit',
          });
          
          console.log(chalk.green('\n✅ Comando executado com sucesso\n'));
        } catch (error) {
          console.log(chalk.red('\n❌ Comando falhou\n'));
          const exitCode = error && typeof error === 'object' && 'status' in error 
            ? (error.status as number) 
            : 1;
          process.exit(exitCode);
        }
      } else {
        console.log(chalk.green('\n🛡️  Sentinel bloqueou o comando por segurança\n'));
        process.exit(1);
      }
    }
  } catch (error) {
    logger.error({ error }, 'Unexpected error');
    console.error(chalk.red('\n❌ Erro inesperado:'), error);
    process.exit(1);
  }
}
