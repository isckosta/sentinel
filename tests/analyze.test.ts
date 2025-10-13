import { execSync } from 'child_process';
import { DecisionEngine } from '../src/core/decision-engine';
import { RiskEngine } from '../src/core/risk-engine';
import { CommandParser } from '../src/core/command-parser';
import { executeWithSentinel } from '../src/core/execution-engine';
import { ParsedCommand, RiskAssessment } from '../src/types';

// Mocking core components and node modules
jest.mock('child_process');
jest.mock('../src/core/decision-engine');
jest.mock('../src/core/risk-engine');
jest.mock('../src/core/command-parser');
jest.mock('../src/utils/logger', () => ({
  getLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));
jest.mock('../src/core/telemetry', () => {
  return {
    Telemetry: jest.fn().mockImplementation(() => {
      return { recordEvent: jest.fn() };
    }),
  };
});

describe('Sentinel Analyze Command', () => {
  let mockExit: jest.SpyInstance;
  let mockDecide: jest.SpyInstance;
  let mockAssess: jest.SpyInstance;

  const mockCommand: ParsedCommand = {
    binary: 'test',
    args: [],
    fullCommand: 'test',
    currentBranch: 'main',
    currentDirectory: '/test',
    environment: 'development',
  };

  beforeEach(() => {
    // Mock process.exit para evitar que os testes parem
    mockExit = jest.spyOn(process, 'exit').mockImplementation((() => {}) as (code?: number | string | null) => never);
    
    // Mock os métodos dos componentes
    jest.spyOn(CommandParser.prototype, 'parse').mockReturnValue(mockCommand);
    mockAssess = jest.spyOn(RiskEngine.prototype, 'assess');
    mockDecide = jest.spyOn(DecisionEngine.prototype, 'decide');

    // Limpa mocks antes de cada teste
    (execSync as jest.Mock).mockClear();
    mockExit.mockClear();
    mockDecide.mockClear();
    mockAssess.mockClear();
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  test('should exit with code 0 for a safe command', async () => {
    const safeAssessment: RiskAssessment = { score: 10, level: 'safe', reasons: [], matchedRules: [] };
    mockAssess.mockReturnValue(safeAssessment);

    await executeWithSentinel(['echo', 'hello'], {}, { analyzeOnly: true });

    expect(mockAssess).toHaveBeenCalled();
    expect(mockDecide).not.toHaveBeenCalled(); // Não deve pedir decisão para comando seguro
    expect(mockExit).toHaveBeenCalledWith(0);
    expect(execSync).not.toHaveBeenCalled();
  });

  test('should exit with code 0 when a warning is approved', async () => {
    const warningAssessment: RiskAssessment = { score: 50, level: 'warning', reasons: [], matchedRules: [] };
    mockAssess.mockReturnValue(warningAssessment);
    mockDecide.mockResolvedValue({ executed: true, timestamp: new Date() });

    await executeWithSentinel(['git', 'push', '--force'], {}, { analyzeOnly: true });

    expect(mockAssess).toHaveBeenCalled();
    expect(mockDecide).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(0);
    expect(execSync).not.toHaveBeenCalled();
  });

  test('should exit with code 1 when a warning is rejected', async () => {
    const warningAssessment: RiskAssessment = { score: 50, level: 'warning', reasons: [], matchedRules: [] };
    mockAssess.mockReturnValue(warningAssessment);
    mockDecide.mockResolvedValue({ executed: false, timestamp: new Date() });

    await executeWithSentinel(['git', 'push', '--force'], {}, { analyzeOnly: true });

    expect(mockAssess).toHaveBeenCalled();
    expect(mockDecide).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(execSync).not.toHaveBeenCalled();
  });

  test('should exit with code 1 when a critical command is rejected', async () => {
    const criticalAssessment: RiskAssessment = { score: 90, level: 'critical', reasons: [], matchedRules: [] };
    mockAssess.mockReturnValue(criticalAssessment);
    mockDecide.mockResolvedValue({ executed: false, timestamp: new Date() });

    await executeWithSentinel(['rm', '-rf', '/'], {}, { analyzeOnly: true });

    expect(mockAssess).toHaveBeenCalled();
    expect(mockDecide).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(execSync).not.toHaveBeenCalled();
  });
});