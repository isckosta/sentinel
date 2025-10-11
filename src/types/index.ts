export type RiskLevel = 'safe' | 'warning' | 'critical';

export interface ParsedCommand {
  binary: string;
  args: string[];
  fullCommand: string;
  currentBranch: string | null;
  currentDirectory: string;
  environment: string;
}

export interface RiskRule {
  pattern: string;
  level: RiskLevel;
  message: string;
  conditions?: {
    branch?: string;
    env?: string;
    time?: string;
  };
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  matchedRules: RiskRule[];
  reasons: string[];
}

export interface DecisionResult {
  action: 'allow' | 'block' | 'confirm';
  executed: boolean;
  userConfirmed?: boolean;
  timestamp: Date;
}

export interface TelemetryEvent {
  timestamp: Date;
  command: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: 'allowed' | 'blocked' | 'confirmed';
  executed: boolean;
}

export interface TelemetryStats {
  totalCommands: number;
  blockedCommands: number;
  executedCommands: number;
  lastIncident: Date | null;
  daysWithoutIncident: number;
  riskDistribution: {
    safe: number;
    warning: number;
    critical: number;
  };
}

export interface SentinelConfig {
  globalIntercept?: boolean;
  rules: RiskRule[];
  plugins?: string[];
  telemetryEnabled?: boolean;
  strictMode?: boolean;
}

export interface Plugin {
  name: string;
  evaluate: (command: ParsedCommand, currentScore: number) => number;
  onEvent?: (event: TelemetryEvent) => void;
}
