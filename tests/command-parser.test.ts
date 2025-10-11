import { CommandParser } from '../src/core/command-parser';

describe('CommandParser', () => {
  let parser: CommandParser;

  beforeEach(() => {
    parser = new CommandParser();
  });

  test('should parse simple command', () => {
    const result = parser.parse(['ls', '-la']);
    
    expect(result.binary).toBe('ls');
    expect(result.args).toEqual(['-la']);
    expect(result.fullCommand).toBe('ls -la');
    expect(result.currentDirectory).toBeDefined();
  });

  test('should parse complex command with multiple args', () => {
    const result = parser.parse(['prisma', 'migrate', 'reset', '--force']);
    
    expect(result.binary).toBe('prisma');
    expect(result.args).toEqual(['migrate', 'reset', '--force']);
    expect(result.fullCommand).toBe('prisma migrate reset --force');
  });

  test('should detect environment from NODE_ENV', () => {
    process.env.NODE_ENV = 'production';
    const result = parser.parse(['npm', 'start']);
    
    expect(result.environment).toBe('production');
    
    delete process.env.NODE_ENV;
  });

  test('should handle empty command', () => {
    const result = parser.parse([]);
    
    expect(result.binary).toBe('');
    expect(result.args).toEqual([]);
    expect(result.fullCommand).toBe('');
  });

  test('should parse git branch if in git repository', () => {
    const result = parser.parse(['git', 'status']);
    
    // Branch will be null if not in a git repo, or a string if it is
    expect(result.currentBranch === null || typeof result.currentBranch === 'string').toBe(true);
  });
});
