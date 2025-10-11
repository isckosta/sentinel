#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { StatsDisplay } from './ui/stats-display';
import { Telemetry } from './core/telemetry';
import { executeWithSentinel } from './core/execution-engine';

const program = new Command();

program
  .name('sentinel')
  .description('🛡️  O guardião entre você e o caos - Firewall cognitivo para DevOps')
  .version('0.1.0');

program
  .command('stats')
  .description('Exibe estatísticas e histórico de comandos')
  .action(() => {
    const telemetry = new Telemetry();
    const display = new StatsDisplay(telemetry);
    display.display();
  });

program
  .command('exec <command...>')
  .description('Executa um comando com análise de risco do Sentinel')
  .option('-c, --config <path>', 'Caminho para arquivo de configuração customizado')
  .option('-y, --yes', 'Aceita automaticamente comandos de baixo risco')
  .action(async (commandArgs: string[], options) => {
    await executeWithSentinel(commandArgs, options, { analyzeOnly: false });
  });

program
  .command('analyze <command...>')
  .description('Analisa um comando e retorna o status de risco, sem executar')
  .option('-c, --config <path>', 'Caminho para arquivo de configuração customizado')
  .option('-y, --yes', 'Aceita automaticamente comandos de baixo risco')
  .action(async (commandArgs: string[], options) => {
    await executeWithSentinel(commandArgs, options, { analyzeOnly: true });
  });

import { InitWizard } from './core/init-wizard';

program
  .command('init [shell]')
  .description('Gera o script de integração para o shell especificado (bash, zsh, fish) ou inicia um assistente interativo.')
  .action(async (shell: string | undefined) => {
    const wizard = new InitWizard();
    await wizard.run(shell);
  });

// Default action when no command is specified
program.action(async (options, command) => {
  const args = command.args;
  
  if (args.length === 0) {
    program.help();
    return;
  }

  await executeWithSentinel(args, options, { analyzeOnly: false });
});

const isAnalyzeOrInit = process.argv.includes('analyze') || process.argv.includes('init');

// Show banner on direct execution, but not for analyze/init, which are used in scripts
if (require.main === module && !isAnalyzeOrInit) {
  console.log(chalk.cyan.bold('\n🛡️  SENTINEL'));
  console.log(chalk.gray('O guardião entre você e o caos\n'));
}

program.parse(process.argv);
