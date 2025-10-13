import { ParsedCommand } from '../types';
import { getCurrentBranch } from '../utils/git-helper';

/**
 * @class CommandParser
 * @description Parses raw command arguments and extracts relevant context for risk assessment.
 */
export class CommandParser {
  /**
   * Parses an array of command arguments into a structured ParsedCommand object.
   * It extracts the binary, arguments, full command string, current Git branch, current directory, and detected environment.
   * @param commandArgs An array of strings representing the command and its arguments.
   * @returns A ParsedCommand object containing structured information about the command.
   */
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

  /**
   * Detects the current execution environment based on environment variables (NODE_ENV, ENVIRONMENT) and current working directory.
   * @returns A string representing the detected environment (e.g., 'production', 'staging', 'development', or 'unknown').
   */
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
