import { ParsedCommand } from '../types';
import { getCurrentBranch } from '../utils/git-helper';

export class CommandParser {
  parse(commandArgs: string[]): ParsedCommand {
    const fullCommand = commandArgs.join(' ');
    const binary = commandArgs[0] || '';
    const args = commandArgs.slice(1);

    return {
      binary,
      args,
      fullCommand,
      currentBranch: getCurrentBranch(),
      currentDirectory: process.cwd(),
      environment: this.detectEnvironment(),
    };
  }

  private detectEnvironment(): string {
    const env = process.env.NODE_ENV || process.env.ENVIRONMENT || '';
    
    // Check common environment indicators
    if (env.toLowerCase().includes('prod')) return 'production';
    if (env.toLowerCase().includes('stag')) return 'staging';
    if (env.toLowerCase().includes('dev')) return 'development';
    
    // Check directory path for clues
    const cwd = process.cwd().toLowerCase();
    if (cwd.includes('prod')) return 'production';
    if (cwd.includes('stag')) return 'staging';
    
    return 'unknown';
  }
}
