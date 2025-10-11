import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';

export class InitWizard {

  public async run(shellArg?: string): Promise<void> {
    if (shellArg) {
      const script = this.generateShellScript(shellArg);
      if (script) {
        console.log(script);
        return;
      } else {
        console.error(chalk.red(`Shell '${shellArg}' não suportado.`));
        process.exit(1);
      }
    }

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

  private generateShellScript(shell: string): string | null {
    switch (shell) {
      case 'zsh':
        return `
# Sentinel Shell Integration for Zsh
_sentinel_preexec() {
  local cmd="$1"
  if [[ "$cmd" != "sentinel "* ]]; then
    if sentinel analyze "$cmd"; then
      # Command is safe, proceed
      :
    else
      # Command is risky, cancel execution
      return 1
    fi
  fi
}
autoload -Uz add-zsh-hook
add-zsh-hook preexec _sentinel_preexec
`;
      case 'bash':
        return `
# Sentinel Shell Integration for Bash
_sentinel_trap_debug() {
  local cmd="$BASH_COMMAND"
  if [[ "$cmd" != "sentinel "* ]]; then
    if sentinel analyze "$cmd"; then
      # Command is safe, proceed
      :
    else
      # Command is risky, cancel execution
      return 1
    fi
  fi
}
trap '_sentinel_trap_debug' DEBUG
`;
      default:
        return null;
    }
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
