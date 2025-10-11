# 🛡️ Sentinel - Project Overview

## 📁 Estrutura do Projeto

```
sentinel/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Pipeline CI/CD
├── config/
│   └── sentinel.yml               # Configuração padrão de regras
├── docs/
│   ├── ARCHITECTURE.md            # Documentação de arquitetura
│   ├── CONTRIBUTING.md            # Guia de contribuição
│   ├── EXAMPLES.md                # Exemplos de uso
│   ├── PLUGIN_GUIDE.md            # Guia de desenvolvimento de plugins
│   └── QUICK_START.md             # Guia de início rápido
├── plugins/
│   └── custom-branch-check.js     # Plugin exemplo
├── scripts/
│   ├── dev-setup.sh               # Script de setup do ambiente
│   └── test-commands.sh           # Script de teste manual
├── src/
│   ├── core/                      # Lógica principal
│   └── index.ts                   # CLI principal
├── tests/                         # Testes unitários
└── ... (outros arquivos de configuração)
```

## 🎯 Componentes Principais

### 1. CLI (`src/index.ts`)
- **Comandos**:
  - `exec`: Executa um comando com análise.
  - `analyze`: Analisa um comando e retorna um código de status (usado pela integração com o shell).
  - `init`: Gera scripts de integração para `bash` e `zsh`.
  - `stats`: Exibe estatísticas de uso.

### 2. Command Parser (`src/core/command-parser.ts`)
- **Função**: Extrai informações contextuais do comando (binário, args, branch, etc.).

### 3. Risk Engine (`src/core/risk-engine.ts`)
- **Função**: Calcula score de risco (0-100) baseado em regras YAML, heurísticas e plugins.

### 4. Decision Engine (`src/core/decision-engine.ts`)
- **Função**: Decide a ação (`allow`, `block`) com base no score de risco, interagindo com o usuário se necessário.

### 5. Telemetry (`src/core/telemetry.ts`)
- **Função**: Registra todos os eventos e mantém estatísticas agregadas.

### 6. Plugin Manager (`src/core/plugin-manager.ts`)
- **Função**: Carrega e executa plugins customizados para estender a lógica de risco.

## 📊 Fluxos de Execução

### Modo Manual (`sentinel exec ...`)

```
1. User executes: sentinel exec <command>
   ↓
2. CLI (index.ts) receives command
   ↓
3. RiskEngine calculates risk score
   ↓
4. DecisionEngine decides action (prompts user if needed)
   ↓
5. Telemetry records event
   ↓
6. CLI executes command (if approved) or blocks
```

### Modo de Integração Automática (Shell Hook)

```
1. User types any command (e.g., 'git push --force')
   ↓
2. Shell Hook (preexec/DEBUG) intercepts the command
   ↓
3. Hook calls: sentinel analyze "git push --force"
   ↓
4. Sentinel analyzes risk and prompts user if needed
   ↓
5. Sentinel exits with code 0 (approved) or 1 (blocked)
   ↓
6. Shell Hook checks exit code
   ↓
7. Hook allows original command to run (if code=0) or cancels it (if code=1)
```

## 🔧 Stack Tecnológica

- **Core**: Node.js, TypeScript, Commander, Inquirer, Chalk, Pino, js-yaml
- **Development**: Jest, ESLint, Prettier, ts-node
- **CI/CD**: GitHub Actions

## 🔌 Extensibilidade

- **Regras**: Adicione novas regras de risco no arquivo `config/sentinel.yml`.
- **Plugins**: Crie plugins JavaScript para lógicas de risco customizadas.

## 📝 Documentação

- **User Docs**: `README.md`, `QUICK_START.md`
- **Developer Docs**: `ARCHITECTURE.md`, `PLUGIN_GUIDE.md`, `CONTRIBUTING.md`
