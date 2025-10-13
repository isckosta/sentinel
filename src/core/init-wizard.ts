import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { homedir } from 'os';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

/**
 * @class InitWizard
 * @description Guides the user through the initial setup and shell integration of Sentinel.
 * It detects the user's shell, generates integration scripts, and offers to automatically add them to the shell configuration file.
 */
export class InitWizard {

  /**
   * Runs the initialization wizard, guiding the user through shell integration.
   * If a shell argument is provided, it generates and prints the script directly.
   * Otherwise, it interactively detects the shell and prompts for integration.
   * @param shellArg Optional. The shell type (e.g., 'bash', 'zsh') to generate the script for directly.
   */
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

    const shellConfigPath = this.getShellConfigPath(shell);
    if (!shellConfigPath) {
      console.error(chalk.red(`Não foi possível encontrar o arquivo de configuração para o shell '${shell}'.`));
      return;
    }

    const integrationScript = this.generateShellScript(shell);
    if (!integrationScript) {
      console.error(chalk.red(`Não foi possível gerar o script de integração para o shell '${shell}'.`));
      return;
    }

    if (this.checkIfAlreadyIntegrated(shellConfigPath, integrationScript)) {
      console.log(chalk.yellow(`
O Sentinel já parece estar integrado ao seu ${shell} shell. Nenhuma ação necessária.
`));
      return;
    }

    const { autoIntegrate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'autoIntegrate',
        message: `Deseja que o Sentinel adicione automaticamente a integração ao seu arquivo '${shellConfigPath}'? (Recomendado)`, 
        default: true,
      },
    ]);

    if (autoIntegrate) {
      try {
        if (integrationScript) { // Ensure integrationScript is not null
          await this.addIntegrationToShell(shellConfigPath, integrationScript as string);
          console.log(chalk.green(`
✅ Integração do Sentinel adicionada com sucesso ao '${shellConfigPath}'.
Por favor, abra um novo terminal ou execute 'source ${shellConfigPath}' para aplicar as mudanças.
`));
        }
      } catch (error: any) { // Explicitly type error as any for now
        console.error(chalk.red(`
❌ Erro ao adicionar integração ao '${shellConfigPath}': ${error.message}
`));
        console.log(chalk.yellow(`
Por favor, adicione a seguinte linha ao seu arquivo '${shellConfigPath}' manualmente:
`));
        console.log(chalk.gray(integrationScript));
      }
    } else {
      console.log(chalk.yellow(`
Ok, por favor, adicione a seguinte linha ao seu arquivo '${shellConfigPath}' manualmente:
`));
      console.log(chalk.gray(integrationScript));
    }
  }

  /**
   * Generates the shell integration script for a given shell type.
   * @param shell The type of shell (e.g., 'bash', 'zsh').
   * @returns The integration script as a string, or null if the shell is not supported.
   */
  private generateShellScript(shell: string): string | null {
    const sentinelPath = path.resolve(process.argv[1] as string, '..', '..', 'dist', 'index.js');
    const commandPrefix = `/usr/bin/env node ${sentinelPath}`;

    switch (shell) {
      case 'zsh':
        return `
# Sentinel Shell Integration for Zsh
_sentinel_preexec() {
  local cmd="$1"
  if [[ "$cmd" != "sentinel "* ]]; then
    if ${commandPrefix} analyze "$cmd"; then
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
    if ${commandPrefix} analyze "$cmd"; then
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

  /**
   * Detects the user's current shell based on the SHELL environment variable.
   * @returns The name of the detected shell (e.g., 'bash', 'zsh') or null if not recognized.
   */
  private detectShell(): string | null {
    const shellPath = process.env.SHELL;
    if (!shellPath) return null;

    const shellName = path.basename(shellPath);
    if (['bash', 'zsh', 'fish'].includes(shellName)) {
      return shellName;
    }

    return null;
  }

  /**
   * Determines the configuration file path for a given shell.
   * @param shell The name of the shell.
   * @returns The absolute path to the shell's configuration file, or null if not supported.
   */
  private getShellConfigPath(shell: string): string | null {
    switch (shell) {
      case 'zsh':
        return path.join(homedir(), '.zshrc');
      case 'bash':
        return path.join(homedir(), '.bashrc');
      default:
        return null;
    }
  }

  /**
   * Adds the Sentinel integration script to the specified shell configuration file.
   * Creates a backup of the original file before modification.
   * @param shellConfigPath The absolute path to the shell's configuration file.
   * @param script The integration script to add.
   * @throws Error if the integration script is null.
   */
  private async addIntegrationToShell(shellConfigPath: string, script: string | null): Promise<void> {
    if (!script) {
      throw new Error('Integration script cannot be null.');
    }
    const backupPath = await this.backupFile(shellConfigPath);
    console.log(chalk.gray(`Backup do arquivo de configuração do shell criado em: ${backupPath}`));

    let content = existsSync(shellConfigPath) ? readFileSync(shellConfigPath, 'utf-8') : '';

    if (content.length > 0 && !content.endsWith('\n')) {
      content += '\n';
    }

    content += `\n# Sentinel Integration Start\n`;
    content += `eval \"$(${script})\"`;
    content += `\n# Sentinel Integration End\n`;

    writeFileSync(shellConfigPath, content);
  }

  /**
   * Creates a timestamped backup of a given file.
   * @param filePath The path to the file to be backed up.
   * @returns The path to the created backup file.
   */
  private async backupFile(filePath: string): Promise<string> {
    const backupDir = path.join(homedir(), '.sentinel', 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${path.basename(filePath)}.bak-${timestamp}`);
    if (existsSync(filePath)) {
      writeFileSync(backupPath, readFileSync(filePath));
    }
    return backupPath;
  }

  /**
   * Checks if the Sentinel integration script is already present in the shell configuration file.
   * @param shellConfigPath The absolute path to the shell's configuration file.
   * @param script The integration script to check for.
   * @returns True if the script is found in the file, false otherwise.
   */
  private checkIfAlreadyIntegrated(shellConfigPath: string, script: string): boolean {
    if (!existsSync(shellConfigPath)) {
      return false;
    }
    const content = readFileSync(shellConfigPath, 'utf-8');
    return content.includes(script);
  }
}
