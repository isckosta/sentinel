import chalk from 'chalk';
import { Telemetry } from '../core/telemetry';
import { TelemetryStats, TelemetryEvent } from '../types';

export class StatsDisplay {
  private telemetry: Telemetry;

  constructor(telemetry: Telemetry) {
    this.telemetry = telemetry;
  }

  display(): void {
    const stats = this.telemetry.loadStats();
    const recentEvents = this.telemetry.getRecentEvents(5);

    console.log('\n');
    this.displayHeader();
    this.displayOverview(stats);
    this.displayRiskDistribution(stats);
    this.displayIncidentInfo(stats);
    this.displayRecentEvents(recentEvents);
    this.displayFooter(stats);
    console.log('\n');
  }

  private displayHeader(): void {
    console.log(chalk.cyan('╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold.white('                    🛡️  SENTINEL STATS                         ') + chalk.cyan('║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝'));
    console.log();
  }

  private displayOverview(stats: TelemetryStats): void {
    console.log(chalk.bold.white('📊 Visão Geral'));
    console.log(chalk.gray('─'.repeat(64)));
    
    const executionRate = stats.totalCommands > 0
      ? ((stats.executedCommands / stats.totalCommands) * 100).toFixed(1)
      : '0.0';
    
    const blockRate = stats.totalCommands > 0
      ? ((stats.blockedCommands / stats.totalCommands) * 100).toFixed(1)
      : '0.0';

    console.log(chalk.white(`  Total de comandos avaliados:  ${chalk.bold.cyan(stats.totalCommands)}`));
    console.log(chalk.white(`  Comandos executados:          ${chalk.bold.green(stats.executedCommands)} (${executionRate}%)`));
    console.log(chalk.white(`  Comandos bloqueados:          ${chalk.bold.red(stats.blockedCommands)} (${blockRate}%)`));
    console.log();
  }

  private displayRiskDistribution(stats: TelemetryStats): void {
    console.log(chalk.bold.white('⚠️  Distribuição de Risco'));
    console.log(chalk.gray('─'.repeat(64)));

    const total = stats.totalCommands || 1;
    const safePercent = ((stats.riskDistribution.safe / total) * 100).toFixed(1);
    const warningPercent = ((stats.riskDistribution.warning / total) * 100).toFixed(1);
    const criticalPercent = ((stats.riskDistribution.critical / total) * 100).toFixed(1);

    console.log(chalk.green(`  ✓ Safe:     ${this.createBar(stats.riskDistribution.safe, total, 30)} ${stats.riskDistribution.safe} (${safePercent}%)`));
    console.log(chalk.yellow(`  ⚠ Warning:  ${this.createBar(stats.riskDistribution.warning, total, 30)} ${stats.riskDistribution.warning} (${warningPercent}%)`));
    console.log(chalk.red(`  ✖ Critical: ${this.createBar(stats.riskDistribution.critical, total, 30)} ${stats.riskDistribution.critical} (${criticalPercent}%)`));
    console.log();
  }

  private createBar(value: number, total: number, maxLength: number): string {
    const percentage = total > 0 ? value / total : 0;
    const filledLength = Math.round(percentage * maxLength);
    const emptyLength = maxLength - filledLength;
    return '█'.repeat(filledLength) + '░'.repeat(emptyLength);
  }

  private displayIncidentInfo(stats: TelemetryStats): void {
    console.log(chalk.bold.white('🚨 Informações de Incidentes'));
    console.log(chalk.gray('─'.repeat(64)));

    if (stats.lastIncident) {
      const lastIncidentDate = new Date(stats.lastIncident).toLocaleString('pt-BR');
      console.log(chalk.white(`  Último incidente:             ${chalk.yellow(lastIncidentDate)}`));
      console.log(chalk.white(`  Dias sem autossabotagem:      ${this.getDaysMessage(stats.daysWithoutIncident)}`));
    } else {
      console.log(chalk.green(`  🎉 Nenhum incidente crítico registrado!`));
      console.log(chalk.white(`  Continue assim, você está indo bem.`));
    }
    console.log();
  }

  private getDaysMessage(days: number): string {
    if (days === 0) {
      return chalk.red.bold('0 😬 (Foi hoje mesmo...)');
    } else if (days === 1) {
      return chalk.yellow.bold('1 🤞 (Ontem foi tenso)');
    } else if (days < 7) {
      return chalk.yellow(`${days} 👍 (Melhorando)`);
    } else if (days < 30) {
      return chalk.green(`${days} 🎯 (Boa sequência!)`);
    } else {
      return chalk.green.bold(`${days} 🏆 (Lendário!)`);
    }
  }

  private displayRecentEvents(events: TelemetryEvent[]): void {
    if (events.length === 0) {
      return;
    }

    console.log(chalk.bold.white('📜 Eventos Recentes'));
    console.log(chalk.gray('─'.repeat(64)));

    events.forEach((event) => {
      const icon = this.getRiskIcon(event.riskLevel);
      const color = this.getRiskColor(event.riskLevel);
      const status = event.executed ? chalk.green('✓') : chalk.red('✗');
      const time = new Date(event.timestamp).toLocaleString('pt-BR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      console.log(
        `  ${status} ${color(icon)} ${chalk.gray(time)} ${color(event.riskLevel.padEnd(8))} ${chalk.white(this.truncate(event.command, 35))}`
      );
    });
    console.log();
  }

  private getRiskIcon(level: string): string {
    switch (level) {
      case 'safe':
        return '✓';
      case 'warning':
        return '⚠';
      case 'critical':
        return '✖';
      default:
        return '?';
    }
  }

  private getRiskColor(level: string): typeof chalk.green {
    switch (level) {
      case 'safe':
        return chalk.green;
      case 'warning':
        return chalk.yellow;
      case 'critical':
        return chalk.red;
      default:
        return chalk.white;
    }
  }

  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  private displayFooter(stats: TelemetryStats): void {
    console.log(chalk.gray('─'.repeat(64)));
    
    if (stats.blockedCommands > stats.executedCommands * 0.5) {
      console.log(chalk.yellow('  💡 Sentinel salvou você várias vezes. Considere revisar seus workflows.'));
    } else if (stats.riskDistribution.critical > 5) {
      console.log(chalk.yellow('  ⚠️  Muitos comandos críticos detectados. Prudência é a chave.'));
    } else if (stats.daysWithoutIncident > 30) {
      console.log(chalk.green('  🌟 Excelente! Você está dominando a arte da cautela técnica.'));
    } else {
      console.log(chalk.cyan('  🛡️  Sentinel está de olho. Continue operando com consciência.'));
    }
    
    console.log(chalk.gray('─'.repeat(64)));
  }
}
