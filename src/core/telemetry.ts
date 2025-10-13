import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { TelemetryEvent, TelemetryStats, RiskAssessment, DecisionResult, ParsedCommand } from '../types';
import { getLogger } from '../utils/logger';
import { getDaysSince } from '../utils/time-helper';

const logger = getLogger();

/**
 * @class Telemetry
 * @description Manages the recording and retrieval of command execution events and statistics.
 * It stores data in a hidden .sentinel directory in the user's home folder.
 */
export class Telemetry {
  private sentinelDir: string;
  private statsFile: string;
  private eventsFile: string;

  /**
   * Creates an instance of Telemetry and ensures the necessary directories exist.
   */
  constructor() {
    this.sentinelDir = join(homedir(), '.sentinel');
    this.statsFile = join(this.sentinelDir, 'stats.json');
    this.eventsFile = join(this.sentinelDir, 'events.json');
    this.ensureDirectoryExists();
  }

  /**
   * Ensures that the .sentinel directory exists in the user's home directory.
   * If it doesn't exist, it creates it recursively.
   */
  private ensureDirectoryExists(): void {
    if (!existsSync(this.sentinelDir)) {
      mkdirSync(this.sentinelDir, { recursive: true });
    }
  }

  /**
   * Records a command execution event, including its parsed details, risk assessment, and decision.
   * The event is logged, appended to an events file, and used to update statistics.
   * @param command The parsed command object.
   * @param assessment The risk assessment result for the command.
   * @param decision The decision result (e.g., allowed, blocked, confirmed).
   */
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

  /**
   * Appends a telemetry event to the events file, keeping only the most recent 1000 events.
   * @param event The telemetry event to append.
   */
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

  /**
   * Loads telemetry events from the events file.
   * Converts timestamp strings back to Date objects.
   * @returns An array of TelemetryEvent objects, or an empty array if the file doesn't exist or an error occurs.
   */
  private loadEvents(): TelemetryEvent[] {
    try {
      if (!existsSync(this.eventsFile)) {
        return [];
      }
      const data = readFileSync(this.eventsFile, 'utf-8');
      const events = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return events.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to load events');
      return [];
    }
  }

  /**
   * Updates the telemetry statistics based on a new event.
   * Increments command counts, updates risk distribution, and tracks the last critical incident.
   * @param event The telemetry event used to update statistics.
   */
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

  /**
   * Loads telemetry statistics from the stats file.
   * Converts the lastIncident timestamp string back to a Date object.
   * @returns The loaded TelemetryStats object, or a default empty stats object if the file doesn't exist or an error occurs.
   */
  loadStats(): TelemetryStats {
    try {
      if (!existsSync(this.statsFile)) {
        return this.getDefaultStats();
      }
      const data = readFileSync(this.statsFile, 'utf-8');
      const stats = JSON.parse(data);
      // Convert lastIncident string back to Date object
      if (stats.lastIncident) {
        stats.lastIncident = new Date(stats.lastIncident);
      }
      return stats;
    } catch (error) {
      logger.error({ error }, 'Failed to load stats');
      return this.getDefaultStats();
    }
  }

  /**
   * Returns a default empty statistics object.
   * @returns A TelemetryStats object with all counters initialized to zero.
   */
  private getDefaultStats(): TelemetryStats {
    return {
      totalCommands: 0,
      blockedCommands: 0,
      executedCommands: 0,
      riskDistribution: {
        safe: 0,
        warning: 0,
        critical: 0,
      },
      lastIncident: null,
      daysWithoutIncident: 0,
    };
  }

  /**
   * Saves the current telemetry statistics to the stats file.
   * @param stats The TelemetryStats object to save.
   */
  private saveStats(stats: TelemetryStats): void {
    try {
      writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      logger.error({ error }, 'Failed to save stats');
    }
  }

  /**
   * Retrieves a specified number of the most recent telemetry events.
   * @param limit The maximum number of recent events to retrieve (defaults to 10).
   * @returns An array of the most recent TelemetryEvent objects, ordered from newest to oldest.
   */
  getRecentEvents(limit: number = 10): TelemetryEvent[] {
    const events = this.loadEvents();
    return events.slice(-limit).reverse();
  }
}
