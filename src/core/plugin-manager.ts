import { resolve } from 'path';
import { existsSync } from 'fs';
import { Plugin, ParsedCommand, TelemetryEvent } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * @class PluginManager
 * @description Manages the loading, application, and event notification of Sentinel plugins.
 * Plugins can modify the risk score of a command and react to telemetry events.
 */
export class PluginManager {
  private plugins: Plugin[] = [];

  /**
   * Loads multiple plugins from the specified file paths.
   * Each plugin is loaded asynchronously, and errors during loading are logged but do not stop the process.
   * @param pluginPaths An array of file paths to the plugin modules.
   */
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
    const resolvedPath = resolve(process.cwd(), pluginPath);
    
    if (!existsSync(resolvedPath)) {
      logger.warn({ pluginPath, resolvedPath }, 'Plugin file not found');
      return;
    }

    try {
      let pluginModule;
      
      if (pluginPath.endsWith('.ts')) {
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

  /**
   * Validates if an object conforms to the Plugin interface.
   * A valid plugin must have a 'name' (string) and an 'evaluate' (function) property.
   * @param plugin The object to validate.
   * @returns True if the object is a valid plugin, false otherwise.
   */
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

  /**
   * Applies all loaded plugins to potentially modify the base risk score of a command.
   * Each plugin's 'evaluate' method is called with the parsed command and the current score.
   * @param command The parsed command object.
   * @param baseScore The initial risk score before plugin application.
   * @returns The adjusted risk score after all plugins have been applied.
   */
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

  /**
   * Notifies all loaded plugins about a telemetry event.
   * Plugins with an 'onEvent' method will have it called with the event data.
   * @param event The telemetry event object.
   */
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

  /**
   * Returns a list of names of all currently loaded plugins.
   * @returns An array of strings, where each string is the name of a loaded plugin.
   */
  getLoadedPlugins(): string[] {
    return this.plugins.map(p => p.name);
  }
}
