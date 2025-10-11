import inquirer from 'inquirer';
import { InitWizard } from '../src/core/init-wizard';

// Mock o módulo inquirer
jest.mock('inquirer');

// Faz o cast do inquirer para seu tipo mockado para ter o autocomplete e a segurança de tipos
const mockedInquirer = inquirer as jest.Mocked<typeof inquirer>;

describe('InitWizard', () => {
  let wizard: InitWizard;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  const originalShell = process.env.SHELL;

  beforeEach(() => {
    wizard = new InitWizard();
    // Mock para console para manter a saída do teste limpa
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Limpa os mocks
    mockedInquirer.prompt.mockClear();
  });

  afterEach(() => {
    // Restaura os mocks e variáveis de ambiente
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env.SHELL = originalShell;
  });

  test('should detect zsh and proceed when user confirms', async () => {
    process.env.SHELL = '/bin/zsh';
    mockedInquirer.prompt.mockResolvedValue({ confirmShell: true });

    await wizard.run();

    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Configurando para zsh...'));
  });

  test('should detect bash and proceed when user confirms', async () => {
    process.env.SHELL = '/bin/bash';
    mockedInquirer.prompt.mockResolvedValue({ confirmShell: true });

    await wizard.run();

    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Configurando para bash...'));
  });

  test('should exit gracefully when user rejects shell confirmation', async () => {
    process.env.SHELL = '/bin/zsh';
    mockedInquirer.prompt.mockResolvedValue({ confirmShell: false });

    await wizard.run();

    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('pulando a integração'));
  });

  test('should show error if shell is not detected', async () => {
    process.env.SHELL = '/bin/csh'; // Shell não suportado

    await wizard.run();

    expect(mockedInquirer.prompt).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Não foi possível detectar seu shell'));
  });
});
