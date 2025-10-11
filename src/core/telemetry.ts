import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { TelemetryEvent, TelemetryStats, RiskAssessment, DecisionResult, ParsedCommand } from '../types';
import { logger } from '../utils/logger';
import { getDaysSince } from '../utils/time-helper';

export class Telemetry {
  private sentinelDir: string;
  private statsFile: string;
  private eventsFile: string;

  constructor() {
    this.sentinelDir = join(homedir(), '.sentinel');
    this.statsFile = join(this.sentinelDir, 'stats.json');
    this.eventsFile = join(this.sentinelDir, 'events.json');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!existsSync(this.sentinelDir)) {
      mkdirSync(this.sentinelDir, { recursive: true });
    }
  }

  recordEvent(
    command: ParsedCommand,
    assessment: RiskAssessment,
    decision: DecisionResult
  ): void {
    const event: TelemetryEvent = {
      timestamp: decision.timestamp,
      command: command.fullCommand,
      riskScore: assessment.score,
      riskLevel: assessment.level,
      decision: decision.executed ? 'allowed' : 'blocked',
      executed: decision.executed,
    };

    // Log to file
    logger.info({
      event: 'command_evaluated',
      ...event,
      branch: command.currentBranch,
      environment: command.environment,
      reasons: assessment.reasons,
    });

    // Append to events file
    this.appendEvent(event);

    // Update stats
    this.updateStats(event);
  }

  private appendEvent(event: TelemetryEvent): void {
    try {
      const events = this.loadEvents();
      events.push(event);
      
      // Keep only last 1000 events
      const recentEvents = events.slice(-1000);
      
      writeFileSync(this.eventsFile, JSON.stringify(recentEvents, null, 2));
    } catch (error) {
      logger.error({ error }, 'Failed to append event');
    }
  }

  private loadEvents(): TelemetryEvent[] {
    try {
      if (existsSync(this.eventsFile)) {
        const data = readFileSync(this.eventsFile, 'utf-8');
        const events = JSON.parse(data);
        // Convert timestamp strings back to Date objects
        return events.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (error) {
      logger.error({ error }, 'Failed to load events');
    }
    return [];
  }

  private updateStats(event: TelemetryEvent): void {
    const stats = this.loadStats();

    stats.totalCommands++;
    
    if (event.decision === 'blocked') {
      stats.blockedCommands++;
    }
    
    if (event.executed) {
      stats.executedCommands++;
    }

    // Update risk distribution
    stats.riskDistribution[event.riskLevel]++;

    // Update last incident
    if (event.riskLevel === 'critical' && event.executed) {
      stats.lastIncident = event.timestamp;
      stats.daysWithoutIncident = 0;
    } else if (stats.lastIncident) {
      stats.daysWithoutIncident = getDaysSince(stats.lastIncident);
    }

    this.saveStats(stats);
  }

  loadStats(): TelemetryStats {
    try {
      if (existsSync(this.statsFile)) {
        const data = readFileSync(this.statsFile, 'utf-8');
        const stats = JSON.parse(data);
        // Convert lastIncident string back to Date
        if (stats.lastIncident) {
          stats.lastIncident = new Date(stats.lastIncident);
        }
        return stats;
      }
    } catch (error) {
      logger.error({ error }, 'Failed to load stats');
    }

    return {
      totalCommands: 0,
      blockedCommands: 0,
      executedCommands: 0,
      lastIncident: null,
      daysWithoutIncident: 0,
      riskDistribution: {
        safe: 0,
        warning: 0,
        critical: 0,
      },
    };
  }

  private saveStats(stats: TelemetryStats): void {
    try {
      writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      logger.error({ error }, 'Failed to save stats');
    }
  }

  getRecentEvents(limit: number = 10): TelemetryEvent[] {
    const events = this.loadEvents();
    return events.slice(-limit).reverse();
  }
}
