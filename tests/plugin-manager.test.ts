import { PluginManager } from '../src/core/plugin-manager';
import { ParsedCommand, TelemetryEvent } from '../src/types';

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  test('should initialize with no plugins', () => {
    const plugins = pluginManager.getLoadedPlugins();
    expect(plugins).toEqual([]);
  });

  test('should apply plugins to adjust score', () => {
    // Create a mock plugin inline
    const mockPlugin = {
      name: 'test-plugin',
      evaluate: (_command: ParsedCommand, score: number) => {
        return score + 10;
      },
    };

    // Manually add plugin for testing
    (pluginManager as any).plugins.push(mockPlugin);

    const command: ParsedCommand = {
      binary: 'test',
      args: [],
      fullCommand: 'test',
      currentBranch: null,
      currentDirectory: '/test',
      environment: 'development',
    };

    const adjustedScore = pluginManager.applyPlugins(command, 50);
    expect(adjustedScore).toBe(60);
  });

  test('should handle plugin errors gracefully', () => {
    const faultyPlugin = {
      name: 'faulty-plugin',
      evaluate: () => {
        throw new Error('Plugin error');
      },
    };

    (pluginManager as any).plugins.push(faultyPlugin);

    const command: ParsedCommand = {
      binary: 'test',
      args: [],
      fullCommand: 'test',
      currentBranch: null,
      currentDirectory: '/test',
      environment: 'development',
    };

    // Should not throw, should handle error gracefully
    expect(() => pluginManager.applyPlugins(command, 50)).not.toThrow();
  });

  test('should notify plugins of events', () => {
    let eventReceived = false;

    const mockPlugin = {
      name: 'event-plugin',
      evaluate: (_command: ParsedCommand, score: number) => score,
      onEvent: (_event: TelemetryEvent) => {
        eventReceived = true;
      },
    };

    (pluginManager as any).plugins.push(mockPlugin);

    const event: TelemetryEvent = {
      timestamp: new Date(),
      command: 'test',
      riskScore: 50,
      riskLevel: 'warning',
      decision: 'allowed',
      executed: true,
    };

    pluginManager.notifyEvent(event);
    expect(eventReceived).toBe(true);
  });

  test('should get list of loaded plugins', () => {
    const plugin1 = {
      name: 'plugin-1',
      evaluate: (_command: ParsedCommand, score: number) => score,
    };

    const plugin2 = {
      name: 'plugin-2',
      evaluate: (_command: ParsedCommand, score: number) => score,
    };

    (pluginManager as any).plugins.push(plugin1, plugin2);

    const pluginNames = pluginManager.getLoadedPlugins();
    expect(pluginNames).toEqual(['plugin-1', 'plugin-2']);
  });
});
