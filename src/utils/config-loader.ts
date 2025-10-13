import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { SentinelConfig } from '../types';
import { getLogger } from './logger';

/**
 * @class ConfigLoader
 * @description Handles loading, finding, validating, and providing default configurations for Sentinel.
 */
export class ConfigLoader {
  private static _logger = getLogger();

  private static DEFAULT_CONFIG_PATHS = [
    join(process.cwd(), 'sentinel.yml'),
    join(process.cwd(), '.sentinel.yml'),
    join(process.cwd(), 'config', 'sentinel.yml'),
    join(__dirname, '..', '..', 'config', 'sentinel.yml'),
  ];

  /**
   * Loads the Sentinel configuration from a specified path or by searching default locations.
   * If no configuration file is found or an error occurs, a default configuration is returned.
   * @param customPath Optional. A custom path to the configuration file.
   * @returns The loaded or default Sentinel configuration.
   */
  static load(customPath?: string): SentinelConfig {
    const configPath = customPath || this.findConfigFile();

    if (!configPath) {
      ConfigLoader._logger.warn('No config file found, using default rules');
      return this.getDefaultConfig();
    }

    try {
      const fileContents = readFileSync(configPath, 'utf-8');
      const config = yaml.load(fileContents) as SentinelConfig;
      
      ConfigLoader._logger.info({ configPath }, 'Configuration loaded');
      return this.validateConfig(config);
    } catch (error) {
      ConfigLoader._logger.error({ error, configPath }, 'Failed to load config');
      return this.getDefaultConfig();
    }
  }

  /**
   * Searches for a Sentinel configuration file in predefined default paths.
   * @returns The absolute path to the configuration file if found, otherwise null.
   */
  private static findConfigFile(): string | null {
    for (const path of this.DEFAULT_CONFIG_PATHS) {
      if (existsSync(path)) {
        return path;
      }
    }
    return null;
  }

  /**
   * Validates the loaded configuration and applies default values for missing properties.
   * Also sets the LOG_LEVEL environment variable based on the configuration.
   * @param config The Sentinel configuration object to validate.
   * @returns The validated Sentinel configuration.
   */
  private static validateConfig(config: SentinelConfig): SentinelConfig {
    if (!config.rules || !Array.isArray(config.rules)) {
      ConfigLoader._logger.warn('Invalid rules in config, using defaults');
      config.rules = this.getDefaultConfig().rules;
    }

    // Set defaults
    config.telemetryEnabled = config.telemetryEnabled ?? true;
    config.strictMode = config.strictMode ?? false;
    config.logLevel = config.logLevel ?? 'info'; // Default to info

    // Set LOG_LEVEL environment variable for pino
    process.env.LOG_LEVEL = config.logLevel;

    return config;
  }

  /**
   * Provides a default Sentinel configuration with predefined rules and settings.
   * This is used when no configuration file is found or loaded successfully.
   * @returns A default Sentinel configuration object.
   */
  private static getDefaultConfig(): SentinelConfig {
    return {
      rules: [
        {
          pattern: '*migrate reset*',
          level: 'critical',
          message: 'Esse comando parece suicida. Quer pensar de novo?',
        },
        {
          pattern: '*deploy*main*',
          level: 'critical',
          message: 'Deploy sem review? Tá apostando contra o universo?',
        },
        {
          pattern: '*--force*',
          level: 'warning',
          message: 'Flag --force detectada. Cuidado com o que deseja.',
        },
      ],
      telemetryEnabled: true,
      strictMode: false,
      logLevel: 'info',
    };
  }
}
