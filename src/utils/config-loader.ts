import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { SentinelConfig } from '../types';
import { logger } from './logger';

export class ConfigLoader {
  private static DEFAULT_CONFIG_PATHS = [
    join(process.cwd(), 'sentinel.yml'),
    join(process.cwd(), '.sentinel.yml'),
    join(process.cwd(), 'config', 'sentinel.yml'),
    join(__dirname, '..', '..', 'config', 'sentinel.yml'),
  ];

  static load(customPath?: string): SentinelConfig {
    const configPath = customPath || this.findConfigFile();

    if (!configPath) {
      logger.warn('No config file found, using default rules');
      return this.getDefaultConfig();
    }

    try {
      const fileContents = readFileSync(configPath, 'utf-8');
      const config = yaml.load(fileContents) as SentinelConfig;
      
      logger.info({ configPath }, 'Configuration loaded');
      return this.validateConfig(config);
    } catch (error) {
      logger.error({ error, configPath }, 'Failed to load config');
      return this.getDefaultConfig();
    }
  }

  private static findConfigFile(): string | null {
    for (const path of this.DEFAULT_CONFIG_PATHS) {
      if (existsSync(path)) {
        return path;
      }
    }
    return null;
  }

  private static validateConfig(config: SentinelConfig): SentinelConfig {
    if (!config.rules || !Array.isArray(config.rules)) {
      logger.warn('Invalid rules in config, using defaults');
      config.rules = this.getDefaultConfig().rules;
    }

    // Set defaults
    config.telemetryEnabled = config.telemetryEnabled ?? true;
    config.strictMode = config.strictMode ?? false;

    return config;
  }

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
    };
  }
}
