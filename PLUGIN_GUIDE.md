# Guia de Desenvolvimento de Plugins

## Visão Geral

Plugins permitem estender o comportamento do Sentinel com lógica customizada de avaliação de risco e reação a eventos.

## Estrutura Básica

Um plugin é um módulo JavaScript/TypeScript que exporta um objeto com a seguinte estrutura:

```javascript
module.exports = {
  name: 'my-plugin',
  
  evaluate: (command, currentScore) => {
    // Lógica de avaliação
    return adjustedScore;
  },
  
  onEvent: (event) => {
    // Reação a eventos (opcional)
  }
};
```

## Interface do Plugin

### `name: string`

Nome único do plugin. Usado para logging e debugging.

### `evaluate(command, currentScore): number`

Função principal que avalia o comando e retorna um score ajustado.

**Parâmetros**:

- `command: ParsedCommand`
  ```typescript
  {
    binary: string;          // Ex: 'git', 'npm', 'docker'
    args: string[];          // Ex: ['push', '--force']
    fullCommand: string;     // Ex: 'git push --force'
    currentBranch: string | null;  // Ex: 'main', 'feature/xyz'
    currentDirectory: string;      // Ex: '/home/user/project'
    environment: string;           // Ex: 'production', 'development'
  }
  ```

- `currentScore: number` - Score atual (0-100)

**Retorno**: Novo score (0-100)

### `onEvent(event): void` (opcional)

Função chamada após cada decisão, permitindo reação a eventos.

**Parâmetros**:

- `event: TelemetryEvent`
  ```typescript
  {
    timestamp: Date;
    command: string;
    riskScore: number;
    riskLevel: 'safe' | 'warning' | 'critical';
    decision: 'allowed' | 'blocked' | 'confirmed';
    executed: boolean;
  }
  ```

## Exemplos

### 1. Plugin Simples - Verificação de Branch

```javascript
// plugins/branch-protection.js
module.exports = {
  name: 'branch-protection',
  
  evaluate: (command, currentScore) => {
    // Aumenta score para operações em branches protegidas
    const protectedBranches = ['main', 'master', 'production'];
    
    if (protectedBranches.includes(command.currentBranch)) {
      console.log(`[${this.name}] Protected branch detected: ${command.currentBranch}`);
      return currentScore + 20;
    }
    
    return currentScore;
  }
};
```

### 2. Plugin com Palavras-Chave

```javascript
// plugins/keyword-detector.js
module.exports = {
  name: 'keyword-detector',
  
  evaluate: (command, currentScore) => {
    const dangerousKeywords = {
      'production': 15,
      'delete': 20,
      'drop': 25,
      'truncate': 20,
      'force': 15
    };
    
    let score = currentScore;
    
    for (const [keyword, penalty] of Object.entries(dangerousKeywords)) {
      if (command.fullCommand.toLowerCase().includes(keyword)) {
        console.log(`[${this.name}] Dangerous keyword detected: ${keyword} (+${penalty})`);
        score += penalty;
      }
    }
    
    return score;
  }
};
```

### 3. Plugin com Análise de Horário

```javascript
// plugins/time-guardian.js
module.exports = {
  name: 'time-guardian',
  
  evaluate: (command, currentScore) => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    let score = currentScore;
    
    // Horário de trabalho (9h-18h)
    const isWorkingHours = hour >= 9 && hour < 18;
    
    // Fim de semana
    const isWeekend = day === 0 || day === 6;
    
    // Operações críticas fora do horário
    if (!isWorkingHours && command.environment === 'production') {
      console.log(`[${this.name}] Production operation outside working hours (+25)`);
      score += 25;
    }
    
    // Deploys no fim de semana
    if (isWeekend && command.fullCommand.includes('deploy')) {
      console.log(`[${this.name}] Weekend deployment detected (+20)`);
      score += 20;
    }
    
    return score;
  }
};
```

### 4. Plugin com Notificações

```javascript
// plugins/slack-notifier.js
const https = require('https');

module.exports = {
  name: 'slack-notifier',
  
  evaluate: (command, currentScore) => {
    // Não modifica o score, apenas observa
    return currentScore;
  },
  
  onEvent: (event) => {
    // Notifica Slack apenas para comandos críticos executados
    if (event.riskLevel === 'critical' && event.executed) {
      sendSlackNotification({
        text: `🚨 ALERTA: Comando crítico executado!`,
        fields: [
          { title: 'Comando', value: event.command },
          { title: 'Score', value: event.riskScore },
          { title: 'Timestamp', value: event.timestamp.toISOString() }
        ]
      });
    }
  }
};

function sendSlackNotification(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  const data = JSON.stringify(message);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  const req = https.request(webhookUrl, options);
  req.write(data);
  req.end();
}
```

### 5. Plugin com Análise de Contexto

```javascript
// plugins/context-analyzer.js
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'context-analyzer',
  
  evaluate: (command, currentScore) => {
    let score = currentScore;
    
    // Verifica se existe arquivo de configuração de produção
    const prodConfigExists = fs.existsSync(
      path.join(command.currentDirectory, '.env.production')
    );
    
    if (prodConfigExists && command.environment === 'production') {
      console.log(`[${this.name}] Production config detected (+10)`);
      score += 10;
    }
    
    // Verifica se está em diretório de infraestrutura
    if (command.currentDirectory.includes('infrastructure') ||
        command.currentDirectory.includes('terraform')) {
      console.log(`[${this.name}] Infrastructure directory detected (+15)`);
      score += 15;
    }
    
    // Verifica se há mudanças não commitadas
    try {
      const { execSync } = require('child_process');
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      
      if (status.trim().length > 0) {
        console.log(`[${this.name}] Uncommitted changes detected (+5)`);
        score += 5;
      }
    } catch (error) {
      // Não é um repositório git ou erro ao executar
    }
    
    return score;
  }
};
```

### 6. Plugin TypeScript

```typescript
// plugins/advanced-analyzer.ts
import { Plugin, ParsedCommand, TelemetryEvent } from '@mhsolutions/sentinel';

interface AnalysisResult {
  score: number;
  reasons: string[];
}

class AdvancedAnalyzer implements Plugin {
  name = 'advanced-analyzer';
  
  private patterns = new Map<RegExp, number>([
    [/rm\s+-rf\s+\//, 100],
    [/drop\s+database/, 80],
    [/kubectl\s+delete/, 60],
  ]);
  
  evaluate(command: ParsedCommand, currentScore: number): number {
    const result = this.analyzeCommand(command);
    return currentScore + result.score;
  }
  
  private analyzeCommand(command: ParsedCommand): AnalysisResult {
    const reasons: string[] = [];
    let score = 0;
    
    for (const [pattern, penalty] of this.patterns) {
      if (pattern.test(command.fullCommand)) {
        score += penalty;
        reasons.push(`Matched dangerous pattern: ${pattern.source}`);
      }
    }
    
    return { score, reasons };
  }
  
  onEvent(event: TelemetryEvent): void {
    if (event.riskLevel === 'critical') {
      this.logToExternalSystem(event);
    }
  }
  
  private logToExternalSystem(event: TelemetryEvent): void {
    // Implementar integração com sistema externo
    console.log(`[${this.name}] Logging to external system:`, event);
  }
}

export = new AdvancedAnalyzer();
```

## Configuração

Adicione o plugin ao arquivo `sentinel.yml`:

```yaml
plugins:
  - "./plugins/branch-protection.js"
  - "./plugins/keyword-detector.js"
  - "./plugins/time-guardian.js"
  - "./plugins/slack-notifier.js"
```

## Boas Práticas

### 1. Retorne Sempre um Número

```javascript
// ✅ Correto
evaluate: (command, currentScore) => {
  return currentScore + 10;
}

// ❌ Errado
evaluate: (command, currentScore) => {
  currentScore + 10; // Sem return
}
```

### 2. Não Modifique o Objeto Command

```javascript
// ✅ Correto
evaluate: (command, currentScore) => {
  const branch = command.currentBranch;
  return currentScore;
}

// ❌ Errado
evaluate: (command, currentScore) => {
  command.currentBranch = 'modified'; // Não modifique
  return currentScore;
}
```

### 3. Trate Erros Graciosamente

```javascript
evaluate: (command, currentScore) => {
  try {
    // Lógica que pode falhar
    const result = riskyOperation();
    return currentScore + result;
  } catch (error) {
    console.error(`[${this.name}] Error:`, error);
    return currentScore; // Retorna score original
  }
}
```

### 4. Use Logging para Debug

```javascript
evaluate: (command, currentScore) => {
  console.log(`[${this.name}] Evaluating: ${command.fullCommand}`);
  console.log(`[${this.name}] Current score: ${currentScore}`);
  
  const newScore = currentScore + 10;
  
  console.log(`[${this.name}] New score: ${newScore}`);
  return newScore;
}
```

### 5. Documente Seu Plugin

```javascript
/**
 * Branch Protection Plugin
 * 
 * Increases risk score for operations on protected branches.
 * 
 * Protected branches: main, master, production
 * Penalty: +20 points
 * 
 * @example
 * // Command on main branch
 * git push origin main
 * // Score increased by 20
 */
module.exports = {
  name: 'branch-protection',
  evaluate: (command, currentScore) => {
    // ...
  }
};
```

## Testing de Plugins

Crie testes para seus plugins:

```javascript
// plugins/__tests__/branch-protection.test.js
const plugin = require('../branch-protection');

describe('Branch Protection Plugin', () => {
  test('should increase score for main branch', () => {
    const command = {
      binary: 'git',
      args: ['push'],
      fullCommand: 'git push',
      currentBranch: 'main',
      currentDirectory: '/test',
      environment: 'development'
    };
    
    const result = plugin.evaluate(command, 50);
    expect(result).toBe(70); // 50 + 20
  });
  
  test('should not change score for feature branch', () => {
    const command = {
      binary: 'git',
      args: ['push'],
      fullCommand: 'git push',
      currentBranch: 'feature/test',
      currentDirectory: '/test',
      environment: 'development'
    };
    
    const result = plugin.evaluate(command, 50);
    expect(result).toBe(50);
  });
});
```

## Distribuição

### Como Pacote NPM

1. Crie um pacote separado:
```json
{
  "name": "sentinel-plugin-mybranch",
  "version": "1.0.0",
  "main": "index.js",
  "peerDependencies": {
    "@mhsolutions/sentinel": "^0.1.0"
  }
}
```

2. Publique no NPM:
```bash
npm publish
```

3. Usuários instalam:
```bash
npm install sentinel-plugin-mybranch
```

4. Configure:
```yaml
plugins:
  - "node_modules/sentinel-plugin-mybranch"
```

## Recursos Avançados

### Acesso a Variáveis de Ambiente

```javascript
evaluate: (command, currentScore) => {
  const apiKey = process.env.MY_PLUGIN_API_KEY;
  if (!apiKey) {
    console.warn(`[${this.name}] API key not configured`);
    return currentScore;
  }
  // Usar API key...
}
```

### Persistência de Estado

```javascript
const fs = require('fs');
const path = require('path');

const stateFile = path.join(process.env.HOME, '.sentinel', 'my-plugin-state.json');

function loadState() {
  if (fs.existsSync(stateFile)) {
    return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  }
  return {};
}

function saveState(state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

module.exports = {
  name: 'stateful-plugin',
  
  evaluate: (command, currentScore) => {
    const state = loadState();
    state.commandCount = (state.commandCount || 0) + 1;
    saveState(state);
    
    return currentScore;
  }
};
```

## Troubleshooting

### Plugin Não Carrega

- Verifique o path no `sentinel.yml`
- Confirme que o arquivo existe
- Verifique erros de sintaxe no plugin

### Plugin Não Afeta Score

- Confirme que está retornando um número
- Verifique logs com `console.log`
- Teste isoladamente

### Erros em Produção

- Sempre use try/catch
- Retorne score original em caso de erro
- Log erros para debugging

## Exemplos da Comunidade

Veja mais exemplos em:
- [Sentinel Plugins Repository](https://github.com/mhsolutions/sentinel-plugins)
- [Community Plugins](https://github.com/topics/sentinel-plugin)

## Contribuindo

Compartilhe seus plugins com a comunidade:
1. Publique no NPM com prefixo `sentinel-plugin-`
2. Adicione tag `sentinel-plugin` no GitHub
3. Abra PR para adicionar à lista de plugins recomendados
