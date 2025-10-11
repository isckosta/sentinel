# Arquitetura do Sentinel

## Visão Geral

Sentinel é construído com uma arquitetura modular que separa claramente as responsabilidades. Ele pode operar em dois modos: **manual** (onde é invocado explicitamente) e **automático** (integrado ao shell do usuário).

## Arquitetura de Integração com o Shell (Modo Automático)

Para permitir a interceptação automática de comandos, o Sentinel se integra ao shell do usuário (Bash, Zsh) através de um sistema de hooks.

**Fluxo de Execução:**

```
1. User types any command (e.g., 'git push --force')
   ↓
2. Shell Hook (preexec/DEBUG) intercepts the command string
   ↓
3. Hook executes: sentinel analyze "git push --force"
   (A interatividade é preservada redirecionando para /dev/tty)
   ↓
4. Sentinel Core (Risk & Decision Engines) analisa o comando
   ↓
5. Sentinel sai com um código de status:
   - 0: Comando aprovado
   - 1: Comando bloqueado
   ↓
6. Shell Hook inspeciona o código de status
   ↓
7. Se 0, o hook termina e permite que o shell execute o comando original.
   Se 1, o hook retorna um erro, cancelando a execução do comando original.
```

**Componentes Chave:**

- **`sentinel init <shell>`**: Comando que gera o script de hook apropriado para o shell do usuário.
- **`sentinel analyze <comando...>`**: Um modo de operação que executa todo o fluxo de análise de risco e decisão, mas, em vez de executar o comando, ele se comunica com o processo pai (o hook) através do seu código de saída.
- **Hooks de Shell**: Scripts leves que são registrados nas funções `preexec` (Zsh) ou `trap DEBUG` (Bash) para inspecionar cada comando antes de sua execução.

## Arquitetura Principal (Modo Manual)

Este modo é usado quando se chama `sentinel exec <comando...>`.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI (index.ts)                       │
│                    Commander.js Interface                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Command Parser                           │
│  • Extrai binário, args, branch, ambiente                   │
│  • Detecta contexto de execução                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Risk Engine                             │
│  • Aplica regras do config YAML                             │
│  • Executa heurísticas de risco                             │
│  • Calcula score 0-100                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Plugin Manager                            │
│  • Carrega plugins customizados                             │
│  • Ajusta score baseado em lógica externa                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Decision Engine                            │
│  • safe: executa automaticamente                            │
│  • warning: pede confirmação                                │
│  • critical: requer confirmação consciente                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Telemetry                               │
│  • Registra evento em logs                                  │
│  • Atualiza estatísticas                                    │
│  • Notifica plugins                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Command Execution                          │
│  • Executa comando se aprovado                              │
│  • Bloqueia se rejeitado                                    │
└─────────────────────────────────────────────────────────────┘
```

## Módulos Principais

### 1. Command Parser (`core/command-parser.ts`)

**Responsabilidade**: Extrair informações contextuais do comando.

**Entradas**: Array de argumentos do comando

**Saídas**: `ParsedCommand` com `binary`, `args`, `fullCommand`, `currentBranch`, `currentDirectory`, `environment`.

### 2. Risk Engine (`core/risk-engine.ts`)

**Responsabilidade**: Calcular score de risco do comando.

**Processo**:
1. **Matching de Regras**: Itera sobre regras do `sentinel.yml`, verifica condições e aplica score.
2. **Heurísticas**: Aplica scores adicionais para padrões de risco conhecidos (ex: `--force`, `main` branch, etc.).
3. **Normalização**: Garante que o score final esteja entre 0-100 e o classifica em `safe`, `warning` ou `critical`.

### 3. Decision Engine (`core/decision-engine.ts`)

**Responsabilidade**: Decidir a ação (`allow`/`block`) baseada no risco, interagindo com o usuário através de prompts se necessário.

### 4. Telemetry (`core/telemetry.ts`)

**Responsabilidade**: Registrar e agregar eventos em `~/.sentinel/`.

### 5. Plugin Manager (`core/plugin-manager.ts`)

**Responsabilidade**: Carregar e executar plugins customizados para estender a lógica de avaliação de risco.

## Padrões de Design

- **Single Responsibility Principle**: Cada módulo tem uma responsabilidade clara.
- **Dependency Injection**: Componentes recebem dependências via construtor (ex: `new RiskEngine(config)`).
- **Strategy Pattern**: Plugins implementam estratégias customizadas de avaliação.
- **Observer Pattern**: Plugins podem observar eventos via `onEvent()`.

## Extensibilidade

A extensibilidade é um pilar do Sentinel, permitindo que os usuários adaptem a ferramenta às suas necessidades específicas.

### Adicionar Nova Heurística
1. Edite `core/risk-engine.ts`
2. Adicione lógica em `applyHeuristics()`
3. Adicione testes em `tests/risk-engine.test.ts`

### Criar Novo Plugin
1. Crie um arquivo `.js` na pasta `plugins/`
2. Exporte um objeto com a interface `Plugin` (`name`, `evaluate`, `onEvent`)
3. Adicione o caminho do plugin no seu `sentinel.yml`

## Segurança

- **Execução de Plugins**: Plugins são código arbitrário e devem vir de fontes confiáveis.
- **Logs**: Logs são armazenados no diretório do usuário (`~/.sentinel/`) e não devem conter dados sensíveis como senhas.
- **Execução de Comandos**: No modo `exec`, o Sentinel executa comandos com as mesmas permissões do usuário.

