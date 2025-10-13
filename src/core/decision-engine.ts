import inquirer from 'inquirer';
import chalk from 'chalk';
import { RiskAssessment, DecisionResult, ParsedCommand } from '../types';

/**
 * @class DecisionEngine
 * @description Responsible for making decisions based on the risk assessment of a command, interacting with the user for confirmation when necessary.
 */
export class DecisionEngine {
  /**
   * Makes a decision based on the command's risk assessment.
   * For 'safe' commands, it allows execution. For 'warning' and 'critical' commands, it prompts the user for confirmation.
   * @param command The parsed command object.
   * @param assessment The risk assessment result for the command.
   * @returns A DecisionResult object indicating the action taken (allow, block, confirm) and whether the command was executed.
   */
  async decide(
    command: ParsedCommand,
    assessment: RiskAssessment
  ): Promise<DecisionResult> {
    const timestamp = new Date();

    switch (assessment.level) {
      case 'safe':
        return {
          action: 'allow',
          executed: true,
          timestamp,
        };

      case 'warning':
        return await this.handleWarning(command, assessment, timestamp);

      case 'critical':
        return await this.handleCritical(command, assessment, timestamp);
    }
  }

  /**
   * Handles commands with a 'warning' risk level.
   * Prompts the user for confirmation before proceeding with execution.
   * @param command The parsed command object.
   * @param assessment The risk assessment result.
   * @param timestamp The timestamp of the decision.
   * @returns A DecisionResult object based on user confirmation.
   */
  private async handleWarning(
    command: ParsedCommand,
    assessment: RiskAssessment,
    timestamp: Date
  ): Promise<DecisionResult> {
    console.log(chalk.yellow('\n⚠️  ALERTA DE RISCO MODERADO'));
    console.log(chalk.yellow('━'.repeat(50)));
    console.log(chalk.white(`Comando: ${chalk.bold(command.fullCommand)}`));
    console.log(chalk.yellow(`Score de Risco: ${assessment.score}/100`));
    
    if (assessment.reasons.length > 0) {
      console.log(chalk.yellow('\nMotivos:'));
      assessment.reasons.forEach(reason => {
        console.log(chalk.yellow(`  • ${reason}`));
      });
    }

    console.log(chalk.yellow('━'.repeat(50)));

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Deseja prosseguir mesmo assim?',
        default: false,
      },
    ]);

    return {
      action: 'confirm',
      executed: proceed,
      userConfirmed: proceed,
      timestamp,
    };
  }

  /**
   * Handles commands with a 'critical' risk level.
   * Requires explicit user confirmation and re-typing the command to proceed, acting as a strong safeguard.
   * @param command The parsed command object.
   * @param assessment The risk assessment result.
   * @param timestamp The timestamp of the decision.
   * @returns A DecisionResult object based on user confirmation, potentially blocking the command.
   */
  private async handleCritical(
    command: ParsedCommand,
    assessment: RiskAssessment,
    timestamp: Date
  ): Promise<DecisionResult> {
    console.log(chalk.red('\n🚨 ALERTA CRÍTICO - COMANDO PERIGOSO DETECTADO'));
    console.log(chalk.red('━'.repeat(50)));
    console.log(chalk.white(`Comando: ${chalk.bold.red(command.fullCommand)}`));
    console.log(chalk.red(`Score de Risco: ${chalk.bold(assessment.score)}/100`));
    
    if (command.currentBranch) {
      console.log(chalk.white(`Branch: ${chalk.bold(command.currentBranch)}`));
    }
    
    if (command.environment !== 'unknown') {
      console.log(chalk.white(`Ambiente: ${chalk.bold(command.environment)}`));
    }

    if (assessment.reasons.length > 0) {
      console.log(chalk.red('\nMotivos para bloqueio:'));
      assessment.reasons.forEach(reason => {
        console.log(chalk.red(`  • ${reason}`));
      });
    }

    console.log(chalk.red('━'.repeat(50)));
    console.log(chalk.yellow('\n💡 Sentinel recomenda:'));
    console.log(chalk.white('  • Revisar o comando cuidadosamente'));
    console.log(chalk.white('  • Verificar se está no ambiente correto'));
    console.log(chalk.white('  • Considerar fazer backup antes de prosseguir'));
    console.log(chalk.white('  • Consultar a equipe se houver dúvidas\n'));

    const { understand } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'understand',
        message: chalk.red('Você REALMENTE entende as consequências deste comando?'),
        default: false,
      },
    ]);

    if (!understand) {
      console.log(chalk.green('\n✅ Decisão sábia. Comando bloqueado.\n'));
      return {
        action: 'block',
        executed: false,
        userConfirmed: false,
        timestamp,
      };
    }

    const { confirmCommand } = await inquirer.prompt([
      {
        type: 'input',
        name: 'confirmCommand',
        message: `Digite o comando completo para confirmar: "${command.fullCommand}"`,
      },
    ]);

    if (confirmCommand.trim() !== command.fullCommand.trim()) {
      console.log(chalk.red('\n❌ Comando não confere. Bloqueado por segurança.\n'));
      return {
        action: 'block',
        executed: false,
        userConfirmed: false,
        timestamp,
      };
    }

    console.log(chalk.yellow('\n⚠️  Prosseguindo sob sua responsabilidade...\n'));
    return {
      action: 'confirm',
      executed: true,
      userConfirmed: true,
      timestamp,
    };
  }
}
