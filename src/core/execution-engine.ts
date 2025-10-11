import { execSync } from 'child_process';
import chalk from 'chalk';
import { CommandParser } from './command-parser';
import { RiskEngine } from './risk-engine';
import { DecisionEngine } from './decision-engine';
import { Telemetry } from './telemetry';
import { PluginManager } from './plugin-manager';
import { ConfigLoader } from '../utils/config-loader';
import { logger } from '../utils/logger';

function calculateLevel(score: number): 'safe' | 'warning' | 'critical' {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'warning';
  return 'safe';
}

export async function executeWithSentinel(
  commandArgs: string[],
  options: { config?: string; yes?: boolean },
  executionOptions: { analyzeOnly: boolean }
): Promise<void> {
  try {
    // Load configuration
    const config = ConfigLoader.load(options.config);

    // Initialize components
    const parser = new CommandParser();
    const riskEngine = new RiskEngine(config);
    const decisionEngine = new DecisionEngine();
    const telemetry = new Telemetry();
    const pluginManager = new PluginManager();

    // Load plugins if configured
    if (config.plugins && config.plugins.length > 0) {
      await pluginManager.loadPlugins(config.plugins);
      const loadedPlugins = pluginManager.getLoadedPlugins();
      if (loadedPlugins.length > 0) {
        logger.info({ plugins: loadedPlugins }, 'Plugins loaded');
      }
    }

    // Parse command
    const parsedCommand = parser.parse(commandArgs);
    logger.info({ command: parsedCommand.fullCommand }, 'Command received');

    // Assess risk
    let assessment = riskEngine.assess(parsedCommand);

    // Apply plugins to adjust risk score
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

    // Make decision
    let decision;
    
    if (assessment.level === 'safe') {
      // Comandos seguros são sempre aprovados
      decision = {
        action: 'allow' as const,
        executed: true,
        timestamp: new Date(),
      };
    } else if (options.yes) {
      // Com a flag -y, comandos de warning/critical são auto-aprovados (com base na lógica anterior)
      // Nota: Isso pode ser revisto, mas mantém o comportamento implícito
      decision = {
        action: 'allow' as const,
        executed: true,
        timestamp: new Date(),
      };
    } else {
      // Apenas chame a decisão interativa para 'warning' e 'critical' sem a flag -y
      decision = await decisionEngine.decide(parsedCommand, assessment);
    }

    // Record telemetry
    if (config.telemetryEnabled !== false) {
      telemetry.recordEvent(parsedCommand, assessment, decision);
      
      // Notify plugins
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

    // --- MODIFIED LOGIC ---
    if (executionOptions.analyzeOnly) {
      // In analyze-only mode, exit with status code, do not execute
      process.exit(decision.executed ? 0 : 1);
    } else {
      // In exec mode, execute command if allowed
      if (decision.executed) {
        console.log(chalk.cyan('\n⚡ Executando comando...\n'));
        
        try {
          execSync(parsedCommand.fullCommand, {
            stdio: 'inherit',
          });
          
          console.log(chalk.green('\n✅ Comando executado com sucesso\n'));
        } catch (error: any) {
          console.log(chalk.red('\n❌ Comando falhou\n'));
          process.exit(error.status || 1);
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
