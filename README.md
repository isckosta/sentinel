# 🛡️ Sentinel

> **O guardião entre você e o caos**

Sentinel é um firewall cognitivo para DevOps — um CLI inteligente que intercepta comandos perigosos antes que eles causem desastres, respondendo com humor, consciência contextual e educação técnica.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)](https://www.typescriptlang.org/)

## 🎯 Filosofia

Sentinel não é apenas um validador de comandos — é um **mentor técnico com personalidade**. Ele:

- 🧠 **Educa antes de impedir**: Provoca reflexão técnica ao invés de simplesmente bloquear
- 🎭 **Tem personalidade**: Usa humor inteligente e sarcasmo leve para tornar a segurança memorável
- 🔍 **É contextual**: Analisa branch Git, ambiente, horário e padrões de risco
- 📊 **Aprende com você**: Mantém estatísticas e histórico de decisões
- 🔌 **É extensível**: Sistema de plugins permite customização total

## 🚀 Instalação

```bash
npm install -g @mhsolutions/sentinel
```

## ⚡ Integração Automática com o Shell

Para a melhor experiência, o Sentinel pode se integrar diretamente ao seu terminal para analisar **todos** os comandos que você executa, sem a necessidade de digitar `sentinel exec`.

Execute o comando abaixo para o seu shell (Bash ou Zsh):

```bash
# Para Zsh (recomendado)
sentinel init zsh

# Para Bash
sentinel init bash
```

O comando irá gerar um script. Para ativá-lo, adicione a seguinte linha ao final do seu arquivo de configuração do shell (`~/.zshrc` para Zsh, `~/.bashrc` para Bash):

```bash
# Adicione esta linha ao seu ~/.zshrc ou ~/.bashrc
eval "$(sentinel init zsh)" # ou bash
```

Após reiniciar seu terminal, o Sentinel estará ativo e vigiando todos os seus comandos.

## 📖 Uso Manual (Alternativo)

Se preferir não usar a integração automática, você pode invocar o Sentinel manualmente para cada comando.

### Análise de Comandos

Execute qualquer comando através do `sentinel exec`:

```bash
sentinel exec prisma migrate reset --force
```

Ou, como atalho, simplesmente passe o comando diretamente:

```bash
sentinel prisma migrate reset --force
```

## 📊 Comandos Disponíveis

- `sentinel stats`: Exibe um relatório colorido com estatísticas de uso.
- `sentinel exec <comando...>`: Executa um comando sob a supervisão do Sentinel.
- `sentinel analyze <comando...>`: Analisa um comando e retorna um código de status (0 para seguro, 1 para bloqueado) sem executá-lo. Usado principalmente pela integração com o shell.
- `sentinel init <bash|zsh>`: Gera o script de integração para o shell especificado.

### Flags Globais

- `-y, --yes`: Auto-aprova comandos de baixo risco (`safe`).
- `-c, --config <path>`: Usa um arquivo de configuração `sentinel.yml` customizado.

## 🎨 Exemplos

### Comando Crítico Bloqueado

```bash
$ rm -rf /

🚨 ALERTA CRÍTICO - COMANDO PERIGOSO DETECTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: rm -rf /
Score de Risco: 100/100

Motivos para bloqueio:
  • Isso vai destruir o sistema. PARE IMEDIATAMENTE.
  • Remoção recursiva forçada. Verifique o caminho duas vezes.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Sentinel recomenda:
  • Não executar este comando. Nunca.
  • Tomar um café e repensar suas escolhas.

? Você REALMENTE entende as consequências deste comando? (y/N)
```

### Comando com Aviso

```bash
$ git push --force

⚠️  ALERTA DE RISCO MODERADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: git push --force
Score de Risco: 45/100

Motivos:
  • Force push pode reescrever história. Equipe está ciente?
  • Flag --force detectada. Cuidado com o que deseja.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? Deseja prosseguir mesmo assim? (y/N)
```

### Estatísticas

```bash
$ sentinel stats

╔════════════════════════════════════════════════════════════════╗
║                    🛡️  SENTINEL STATS                         ║
╚════════════════════════════════════════════════════════════════╝

📊 Visão Geral
────────────────────────────────────────────────────────────────
  Total de comandos avaliados:  127
  Comandos executados:          115 (90.6%)
  Comandos bloqueados:          12 (9.4%)

⚠️  Distribuição de Risco
────────────────────────────────────────────────────────────────
  ✓ Safe:     ████████████████████████░░░░░░ 98 (77.2%)
  ⚠ Warning:  ████░░░░░░░░░░░░░░░░░░░░░░░░░░ 17 (13.4%)
  ✖ Critical: ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 12 (9.4%)

🚨 Informações de Incidentes
────────────────────────────────────────────────────────────────
  Último incidente:             15 de out, 14:23
  Dias sem autossabotagem:      7 👍 (Melhorando)

📜 Eventos Recentes
────────────────────────────────────────────────────────────────
  ✓ ✓ out 15, 15:20 safe     npm test
  ✓ ⚠ out 15, 14:45 warning  git push --force
  ✗ ✖ out 15, 14:23 critical prisma migrate reset --force
  ✓ ✓ out 15, 10:30 safe     npm run build
  ✓ ✓ out 14, 18:15 safe     git commit -m "fix"

────────────────────────────────────────────────────────────────
  🛡️  Sentinel está de olho. Continue operando com consciência.
────────────────────────────────────────────────────────────────
```

## ⚙️ Configuração

Crie um arquivo `sentinel.yml` na raiz do seu projeto:

```yaml
rules:
  - pattern: "*migrate reset*"
    level: critical
    message: "Esse comando parece suicida. Quer pensar de novo?"
    conditions:
      branch: "!main"
      env: "!production"

  - pattern: "*deploy*main*"
    level: critical
    message: "Deploy sem review? Tá apostando contra o universo?"

  - pattern: "*--force*"
    level: warning
    message: "Flag --force detectada. Cuidado com o que deseja."

plugins:
  - "./plugins/custom-branch-check.js"
```

### Níveis de Risco

- **safe** (0-39): Comando seguro, executa automaticamente
- **warning** (40-69): Pede confirmação do usuário
- **critical** (70-100): Requer confirmação consciente e digitação do comando

### Condições

- `branch`: Verifica a branch Git atual (use `!` para negar)
- `env`: Verifica o ambiente (production, staging, development)
- `time`: Verifica horário (implementação futura)

## 🔌 Sistema de Plugins

Crie plugins customizados para estender o comportamento do Sentinel:

```javascript
// plugins/custom-check.js
module.exports = {
  name: 'custom-check',
  
  evaluate: (command, currentScore) => {
    // Ajusta o score baseado em lógica customizada
    if (command.currentBranch === 'main') {
      return currentScore + 15;
    }
    return currentScore;
  },
  
  onEvent: (event) => {
    // Reage a eventos (opcional)
    if (event.riskLevel === 'critical' && event.executed) {
      console.log('ALERTA: Comando crítico executado!');
    }
  }
};
```

## 🧪 Heurísticas de Risco

Sentinel aplica múltiplas heurísticas para calcular o score de risco:

- **Branch principal** (+20): Operações em `main` ou `master`
- **Ambiente de produção** (+25): Comandos em produção
- **Flag --force** (+30): Uso de flags de força
- **Comandos destrutivos** (+25): `delete`, `drop`, `reset`, `destroy`, etc.
- **Horário noturno** (+15): Comandos após 22h ou antes de 6h
- **Deploy no fim de semana** (+20): Deploys em sábado ou domingo
- **Migrações de banco** (+15): Comandos `migrate`

## 📊 Telemetria

Todos os eventos são registrados em `~/.sentinel/`:

- `telemetry.log`: Log detalhado de todos os comandos
- `stats.json`: Estatísticas agregadas
- `events.json`: Histórico dos últimos 1000 eventos

## 🛠️ Desenvolvimento

### Requisitos

- Node.js 20+
- TypeScript 5.9+

### Setup

```bash
# Clone o repositório
git clone https://github.com/mhsolutions/sentinel.git
cd sentinel

# Instale dependências
npm install

# Build
npm run build

# Testes
npm test

# Desenvolvimento
npm run dev
```

### Scripts

- `npm run build`: Compila TypeScript
- `npm run start`: Executa versão compilada
- `npm run dev`: Executa com ts-node
- `npm test`: Roda testes com Jest
- `npm run lint`: Verifica código com ESLint
- `npm run release`: Cria nova versão e publica

## 🧪 Testes

```bash
npm test
```

Cobertura de testes inclui:
- Parsing de comandos
- Cálculo de risco
- Sistema de plugins
- Telemetria e estatísticas

## 📝 Roadmap

- [ ] Integração com Slack/Discord para alertas
- [ ] Machine learning para detecção de padrões
- [ ] Modo de aprendizado (observa sem bloquear)
- [ ] Dashboard web para visualização de métricas
- [ ] Integração com CI/CD pipelines
- [ ] Suporte a múltiplos times/projetos
- [ ] Análise de impacto baseada em histórico

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing`)
5. Abra um Pull Request

## 📄 Licença

MIT © MH Solutions

## 🎭 Frases do Sentinel

Algumas das mensagens que você pode encontrar:

- *"Esse comando parece suicida. Quer pensar de novo?"*
- *"Deploy sem review? Tá apostando contra o universo?"*
- *"Nada de bom acontece depois das 22h."*
- *"Deploy no fim de semana? Seus planos merecem mais que isso."*
- *"Force push pode reescrever história. Equipe está ciente?"*
- *"DROP DATABASE? Sério? Respire fundo antes de continuar."*

## 💬 Epílogo

Sentinel é mais que um CLI — é um **guardião da sanidade DevOps**. Um software que transforma descuido em aprendizado e impede desastres antes que virem chamados de suporte.

**Slogan**: *Sentinel — o guardião entre você e o caos.*

---

Feito com 🛡️ e ☕ por [MH Solutions](https://github.com/mhsolutions)
