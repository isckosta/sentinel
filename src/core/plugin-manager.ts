import { resolve } from 'path';
import { existsSync } from 'fs';
import { Plugin, ParsedCommand, TelemetryEvent } from '../types';
import { logger } from '../utils/logger';

export class PluginManager {
  private plugins: Plugin[] = [];

  async loadPlugins(pluginPaths: string[]): Promise<void> {
    for (const pluginPath of pluginPaths) {
      try {
        await this.loadPlugin(pluginPath);
      } catch (error) {
        logger.error({ error, pluginPath }, 'Failed to load plugin');
      }
    }
  }

  private async loadPlugin(pluginPath: string): Promise<void> {
    // Resolve path relative to current working directory
    const resolvedPath = resolve(process.cwd(), pluginPath);
    
    if (!existsSync(resolvedPath)) {
      logger.warn({ pluginPath, resolvedPath }, 'Plugin file not found');
      return;
    }

    try {
      // Dynamic import for ES modules or require for CommonJS
      let pluginModule;
      
      if (pluginPath.endsWith('.ts')) {
        // For TypeScript files, we need ts-node or compiled version
        logger.warn({ pluginPath }, 'TypeScript plugins should be compiled first');
        return;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      pluginModule = require(resolvedPath);
      
      const plugin: Plugin = pluginModule.default || pluginModule;

      if (!this.isValidPlugin(plugin)) {
        logger.error({ pluginPath }, 'Invalid plugin structure');
        return;
      }

      this.plugins.push(plugin);
      logger.info({ pluginName: plugin.name }, 'Plugin loaded successfully');
    } catch (error) {
      logger.error({ error, pluginPath }, 'Error loading plugin');
    }
  }

  private isValidPlugin(plugin: unknown): plugin is Plugin {
    return (
      !!plugin &&
      typeof plugin === 'object' &&
      'name' in plugin &&
      'evaluate' in plugin &&
      typeof plugin.name === 'string' &&
      typeof plugin.evaluate === 'function'
    );
  }

  applyPlugins(command: ParsedCommand, baseScore: number): number {
    let score = baseScore;

    for (const plugin of this.plugins) {
      try {
        const newScore = plugin.evaluate(command, score);
        logger.debug(
          { pluginName: plugin.name, oldScore: score, newScore },
          'Plugin evaluation'
        );
        score = newScore;
      } catch (error) {
        logger.error(
          { error, pluginName: plugin.name },
          'Error executing plugin'
        );
      }
    }

    return score;
  }

  notifyEvent(event: TelemetryEvent): void {
    for (const plugin of this.plugins) {
      if (plugin.onEvent) {
        try {
          plugin.onEvent(event);
        } catch (error) {
          logger.error(
            { error, pluginName: plugin.name },
            'Error in plugin event handler'
          );
        }
      }
    }
  }

  getLoadedPlugins(): string[] {
    return this.plugins.map(p => p.name);
  }
}
