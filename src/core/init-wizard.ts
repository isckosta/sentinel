import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';

export class InitWizard {

  public async run(): Promise<void> {
    console.log(chalk.cyan.bold('\nBem-vindo ao assistente de configuração do Sentinel!\n'));

    const shell = this.detectShell();
    if (!shell) {
      console.error(chalk.red('Não foi possível detectar seu shell. Saindo.'));
      return;
    }

    const { confirmShell } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmShell',
        message: `Detectamos que você usa o shell '${chalk.green(shell)}'. Deseja configurar a integração automática para ele?`,
        default: true,
      },
    ]);

    if (!confirmShell) {
      console.log(chalk.yellow('Ok, pulando a integração com o shell.'));
      return;
    }

    // Próximos passos serão adicionados aqui
    console.log(chalk.blue(`\nConfigurando para ${shell}...`));
  }

  private detectShell(): string | null {
    const shellPath = process.env.SHELL;
    if (!shellPath) return null;

    const shellName = path.basename(shellPath);
    if (['bash', 'zsh', 'fish'].includes(shellName)) {
      return shellName;
    }

    return null;
  }

}
