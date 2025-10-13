import inquirer from 'inquirer';
import { InitWizard } from '../src/core/init-wizard';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

// Mock o módulo inquirer
jest.mock('inquirer');
jest.mock('fs');

// Faz o cast do inquirer para seu tipo mockado para ter o autocomplete e a segurança de tipos
const mockedInquirer = inquirer as jest.Mocked<typeof inquirer>;
const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockedReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockedWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockedMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;

describe('InitWizard', () => {
  let wizard: InitWizard;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  const originalShell = process.env.SHELL;

  beforeEach(() => {
    wizard = new InitWizard();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedInquirer.prompt.mockClear();

    // Mock fs functions
    mockedExistsSync.mockReturnValue(false); // Default: file does not exist
    mockedReadFileSync.mockReturnValue(''); // Default: empty file content
    mockedWriteFileSync.mockClear();
    mockedMkdirSync.mockClear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env.SHELL = originalShell;
    jest.restoreAllMocks(); // Restore all mocks after each test
  });

  test('should detect zsh and proceed when user confirms', async () => {
    process.env.SHELL = '/bin/zsh';
    mockedInquirer.prompt
      .mockResolvedValueOnce({ confirmShell: true })
      .mockResolvedValueOnce({ autoIntegrate: true });
    mockedExistsSync.mockReturnValue(true); // Simulate config file exists for backup
    mockedReadFileSync.mockReturnValue('existing content'); // Simulate existing content

    await wizard.run();

    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Integração do Sentinel adicionada com sucesso'));
    expect(mockedWriteFileSync).toHaveBeenCalled(); // Ensure writeFileSync was called
  });

  test('should detect bash and proceed when user confirms', async () => {
    process.env.SHELL = '/bin/bash';
    mockedInquirer.prompt
      .mockResolvedValueOnce({ confirmShell: true })
      .mockResolvedValueOnce({ autoIntegrate: true });
    mockedExistsSync.mockReturnValue(true); // Simulate config file exists for backup
    mockedReadFileSync.mockReturnValue('existing content'); // Simulate existing content

    await wizard.run();

    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Integração do Sentinel adicionada com sucesso'));
    expect(mockedWriteFileSync).toHaveBeenCalled(); // Ensure writeFileSync was called
  });

  test('should exit gracefully when user rejects shell confirmation', async () => {
    process.env.SHELL = '/bin/zsh';
    mockedInquirer.prompt.mockResolvedValueOnce({ confirmShell: false }); // Only one prompt
    mockedExistsSync.mockReturnValue(false); // Ensure no existing integration

    await wizard.run();

    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('pulando a integração'));
    expect(mockedWriteFileSync).not.toHaveBeenCalled(); // Ensure no file was written
  });

  test('should show error if shell is not detected', async () => {
    process.env.SHELL = '/bin/csh'; // Shell não suportado

    await wizard.run();

    expect(mockedInquirer.prompt).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Não foi possível detectar seu shell'));
  });
});
