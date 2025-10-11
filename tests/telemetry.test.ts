import { Telemetry } from '../src/core/telemetry';
import { ParsedCommand, RiskAssessment, DecisionResult } from '../src/types';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

describe('Telemetry', () => {
  let telemetry: Telemetry;
  const statsFile = join(homedir(), '.sentinel', 'stats.json');
  const eventsFile = join(homedir(), '.sentinel', 'events.json');

  beforeEach(() => {
    telemetry = new Telemetry();
    
    // Clean up test files
    if (existsSync(statsFile)) {
      unlinkSync(statsFile);
    }
    if (existsSync(eventsFile)) {
      unlinkSync(eventsFile);
    }
  });

  test('should initialize with zero stats', () => {
    const stats = telemetry.loadStats();

    expect(stats.totalCommands).toBe(0);
    expect(stats.blockedCommands).toBe(0);
    expect(stats.executedCommands).toBe(0);
    expect(stats.lastIncident).toBeNull();
    expect(stats.daysWithoutIncident).toBe(0);
  });

  test('should record command event', () => {
    const command: ParsedCommand = {
      binary: 'ls',
      args: ['-la'],
      fullCommand: 'ls -la',
      currentBranch: null,
      currentDirectory: '/test',
      environment: 'development',
    };

    const assessment: RiskAssessment = {
      score: 10,
      level: 'safe',
      matchedRules: [],
      reasons: [],
    };

    const decision: DecisionResult = {
      action: 'allow',
      executed: true,
      timestamp: new Date(),
    };

    telemetry.recordEvent(command, assessment, decision);

    const stats = telemetry.loadStats();
    expect(stats.totalCommands).toBe(1);
    expect(stats.executedCommands).toBe(1);
    expect(stats.riskDistribution.safe).toBe(1);
  });

  test('should track blocked commands', () => {
    const command: ParsedCommand = {
      binary: 'rm',
      args: ['-rf', '/'],
      fullCommand: 'rm -rf /',
      currentBranch: null,
      currentDirectory: '/test',
      environment: 'production',
    };

    const assessment: RiskAssessment = {
      score: 100,
      level: 'critical',
      matchedRules: [],
      reasons: ['Comando extremamente perigoso'],
    };

    const decision: DecisionResult = {
      action: 'block',
      executed: false,
      timestamp: new Date(),
    };

    telemetry.recordEvent(command, assessment, decision);

    const stats = telemetry.loadStats();
    expect(stats.totalCommands).toBe(1);
    expect(stats.blockedCommands).toBe(1);
    expect(stats.executedCommands).toBe(0);
    expect(stats.riskDistribution.critical).toBe(1);
  });

  test('should update last incident for critical executed commands', () => {
    const command: ParsedCommand = {
      binary: 'migrate',
      args: ['reset'],
      fullCommand: 'migrate reset',
      currentBranch: 'main',
      currentDirectory: '/test',
      environment: 'production',
    };

    const assessment: RiskAssessment = {
      score: 90,
      level: 'critical',
      matchedRules: [],
      reasons: [],
    };

    const decision: DecisionResult = {
      action: 'confirm',
      executed: true,
      userConfirmed: true,
      timestamp: new Date(),
    };

    telemetry.recordEvent(command, assessment, decision);

    const stats = telemetry.loadStats();
    expect(stats.lastIncident).not.toBeNull();
    expect(stats.daysWithoutIncident).toBe(0);
  });

  test('should retrieve recent events', () => {
    // Record multiple events
    for (let i = 0; i < 5; i++) {
      const command: ParsedCommand = {
        binary: 'test',
        args: [String(i)],
        fullCommand: `test ${i}`,
        currentBranch: null,
        currentDirectory: '/test',
        environment: 'development',
      };

      const assessment: RiskAssessment = {
        score: 10,
        level: 'safe',
        matchedRules: [],
        reasons: [],
      };

      const decision: DecisionResult = {
        action: 'allow',
        executed: true,
        timestamp: new Date(),
      };

      telemetry.recordEvent(command, assessment, decision);
    }

    const recentEvents = telemetry.getRecentEvents(3);
    expect(recentEvents.length).toBe(3);
    expect(recentEvents[0]!.command).toBe('test 4'); // Most recent first
  });
});
