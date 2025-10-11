import { RiskEngine } from '../src/core/risk-engine';
import { SentinelConfig, ParsedCommand } from '../src/types';

describe('RiskEngine', () => {
  let engine: RiskEngine;
  let config: SentinelConfig;

  beforeEach(() => {
    config = {
      rules: [
        {
          pattern: '*migrate reset*',
          level: 'critical',
          message: 'Esse comando parece suicida.',
        },
        {
          pattern: '*--force*',
          level: 'warning',
          message: 'Flag --force detectada.',
        },
        {
          pattern: '*deploy*main*',
          level: 'critical',
          message: 'Deploy sem review?',
          conditions: {
            branch: 'main',
          },
        },
      ],
    };
    engine = new RiskEngine(config);
  });

  test('should assess safe command as safe', () => {
    const command: ParsedCommand = {
      binary: 'ls',
      args: ['-la'],
      fullCommand: 'ls -la',
      currentBranch: 'feature/test',
      currentDirectory: '/test',
      environment: 'development',
    };

    const assessment = engine.assess(command);

    expect(assessment.level).toBe('safe');
    expect(assessment.score).toBeLessThan(40);
  });

  test('should detect critical command', () => {
    const command: ParsedCommand = {
      binary: 'prisma',
      args: ['migrate', 'reset', '--force'],
      fullCommand: 'prisma migrate reset --force',
      currentBranch: 'main',
      currentDirectory: '/test',
      environment: 'production',
    };

    const assessment = engine.assess(command);

    expect(assessment.level).toBe('critical');
    expect(assessment.score).toBeGreaterThanOrEqual(70);
    expect(assessment.matchedRules.length).toBeGreaterThan(0);
  });

  test('should detect force flag', () => {
    const command: ParsedCommand = {
      binary: 'git',
      args: ['push', '--force'],
      fullCommand: 'git push --force',
      currentBranch: 'feature/test',
      currentDirectory: '/test',
      environment: 'development',
    };

    const assessment = engine.assess(command);

    expect(assessment.reasons).toContain('Flag --force detectada. Cuidado com o que deseja.');
    expect(assessment.score).toBeGreaterThan(0);
  });

  test('should increase score for main branch operations', () => {
    const commandOnFeature: ParsedCommand = {
      binary: 'git',
      args: ['push'],
      fullCommand: 'git push',
      currentBranch: 'feature/test',
      currentDirectory: '/test',
      environment: 'development',
    };

    const commandOnMain: ParsedCommand = {
      ...commandOnFeature,
      currentBranch: 'main',
    };

    const assessmentFeature = engine.assess(commandOnFeature);
    const assessmentMain = engine.assess(commandOnMain);

    expect(assessmentMain.score).toBeGreaterThan(assessmentFeature.score);
  });

  test('should increase score for production environment', () => {
    const commandDev: ParsedCommand = {
      binary: 'npm',
      args: ['start'],
      fullCommand: 'npm start',
      currentBranch: 'main',
      currentDirectory: '/test',
      environment: 'development',
    };

    const commandProd: ParsedCommand = {
      ...commandDev,
      environment: 'production',
    };

    const assessmentDev = engine.assess(commandDev);
    const assessmentProd = engine.assess(commandProd);

    expect(assessmentProd.score).toBeGreaterThan(assessmentDev.score);
  });

  test('should respect rule conditions', () => {
    const command: ParsedCommand = {
      binary: 'deploy',
      args: ['main'],
      fullCommand: 'deploy main',
      currentBranch: 'main',
      currentDirectory: '/test',
      environment: 'development',
    };

    const assessment = engine.assess(command);

    expect(assessment.matchedRules.some(r => r.message === 'Deploy sem review?')).toBe(true);
  });

  test('should intercept command globally when globalIntercept is true and no other rules match', () => {
    config.globalIntercept = true;
    engine = new RiskEngine(config);

    const command: ParsedCommand = {
      binary: 'ls',
      args: ['-la'],
      fullCommand: 'ls -la',
      currentBranch: 'feature/test',
      currentDirectory: '/test',
      environment: 'development',
    };

    const assessment = engine.assess(command);

    expect(assessment.level).toBe('warning');
    expect(assessment.score).toBe(40);
    expect(assessment.reasons).toContain('Interceptação global ativada: comando monitorado.');
  });
});
