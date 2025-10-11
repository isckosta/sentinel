# 🔄 GitHub Actions Workflows

Este diretório contém todos os workflows automatizados do Sentinel.

## 📋 Workflows Disponíveis

### 1. **ci.yml** - CI/CD Pipeline ✅
**Trigger**: Push e PR em `master` e `develop`

Executa:
- Lint (ESLint)
- Testes (Jest) em Node 20 e 22
- Build (TypeScript)
- Publicação no NPM (apenas em push para master)

**Status**: Essencial - Roda em todo commit

---

### 2. **release.yml** - Release Automation 🚀
**Trigger**: Push de tags `v*` (ex: `v1.0.0`)

Executa:
- Build e testes
- Criação de release no GitHub
- Publicação no NPM
- Geração de release notes

**Como usar**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

### 3. **coverage.yml** - Code Coverage 📊
**Trigger**: Push e PR em `master` e `develop`

Executa:
- Testes com cobertura
- Upload para Codecov
- Comentário em PR com resultados
- Geração de badges

**Requer**: Token do Codecov em secrets

---

### 4. **security.yml** - Security Audit 🔒
**Trigger**: Push, PR, diariamente às 00:00 UTC

Executa:
- `npm audit` para vulnerabilidades
- Scan com Snyk (se configurado)
- Criação de issue em caso de vulnerabilidades
- Relatório de segurança

**Requer**: Token do Snyk em secrets (opcional)

---

### 5. **dependency-update.yml** - Dependency Update 🔄
**Trigger**: Semanalmente (segundas às 00:00 UTC) ou manual

Executa:
- Verifica pacotes desatualizados
- Atualiza dependências
- Roda testes
- Cria PR automático

**Resultado**: PR com atualizações de dependências

---

### 6. **docs.yml** - Documentation 📚
**Trigger**: Push em `master` que modifica docs ou código

Executa:
- Geração de TypeDoc
- Conversão de Markdown para HTML
- Deploy para GitHub Pages

**Resultado**: Documentação em `https://[username].github.io/sentinel`

---

### 7. **benchmark.yml** - Performance Benchmark ⚡
**Trigger**: Push, PR ou manual

Executa:
- Testes de performance
- Benchmark de parsing
- Benchmark de risk assessment
- Análise de memória

**Resultado**: Relatório de performance em comentário do PR

---

### 8. **stale.yml** - Stale Issues/PRs 🗑️
**Trigger**: Diariamente às 00:00 UTC

Executa:
- Marca issues inativas (60 dias) como stale
- Marca PRs inativos (30 dias) como stale
- Fecha automaticamente após 7 dias

**Configuração**: Ajuste os dias em `stale.yml`

---

### 9. **label.yml** - Auto Label 🏷️
**Trigger**: Abertura ou atualização de PR

Executa:
- Adiciona labels baseado em arquivos modificados
- Usa configuração em `.github/labeler.yml`

**Labels automáticos**:
- `documentation` - Mudanças em docs
- `core` - Mudanças no core
- `tests` - Mudanças em testes
- `dependencies` - Mudanças em package.json
- etc.

---

### 10. **nightly.yml** - Nightly Build 🌙
**Trigger**: Diariamente às 02:00 UTC ou manual

Executa:
- Build completo
- Todos os testes
- Testes de integração
- Verificação de tamanho do pacote
- Cria issue se falhar

**Propósito**: Detectar problemas cedo

---

### 11. **pr-checks.yml** - PR Validation ✓
**Trigger**: Abertura ou atualização de PR

Executa:
- Valida título do PR (Conventional Commits)
- Verifica tamanho do PR
- Detecta breaking changes
- Verifica se há testes
- Verifica se há documentação
- Mensagem de boas-vindas para novos contribuidores

**Resultado**: Feedback automático no PR

---

### 12. **notifications.yml** - Notifications 📬
**Trigger**: Issues, PRs, releases, falhas de CI

Executa:
- Notificações em issues
- Alertas de segurança
- Notificações de release
- Alertas de falha de CI
- Resumo semanal (opcional)

**Extensível**: Adicione webhooks para Slack/Discord

---

## 🔧 Configuração Necessária

### Secrets do GitHub

Para todos os workflows funcionarem, configure estes secrets:

1. **NPM_TOKEN** (obrigatório para publicação)
   - Obtenha em: https://www.npmjs.com/settings/[username]/tokens
   - Tipo: Automation token
   - Adicione em: Settings → Secrets → Actions

2. **CODECOV_TOKEN** (opcional, para coverage)
   - Obtenha em: https://codecov.io/
   - Adicione em: Settings → Secrets → Actions

3. **SNYK_TOKEN** (opcional, para security scan)
   - Obtenha em: https://snyk.io/
   - Adicione em: Settings → Secrets → Actions

### Permissions

Alguns workflows precisam de permissões especiais:

- **GitHub Pages**: Settings → Pages → Source: GitHub Actions
- **Issues/PRs**: Já habilitado por padrão
- **Packages**: Settings → Actions → General → Workflow permissions

## 📊 Status dos Workflows

Adicione badges no README.md:

```markdown
![CI](https://github.com/[username]/sentinel/workflows/CI%2FCD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/[username]/sentinel/branch/master/graph/badge.svg)
![Security](https://github.com/[username]/sentinel/workflows/Security%20Audit/badge.svg)
```

## 🎯 Workflows por Prioridade

### Alta Prioridade (Sempre ativos)
- ✅ CI/CD Pipeline
- ✅ Security Audit
- ✅ PR Checks

### Média Prioridade (Úteis)
- 📊 Code Coverage
- 🚀 Release Automation
- 🔄 Dependency Update

### Baixa Prioridade (Opcionais)
- 📚 Documentation
- ⚡ Benchmark
- 🗑️ Stale
- 🏷️ Auto Label
- 🌙 Nightly
- 📬 Notifications

## 🚀 Como Usar

### Executar Workflow Manualmente

1. Vá para Actions no GitHub
2. Selecione o workflow
3. Clique em "Run workflow"
4. Escolha a branch
5. Clique em "Run workflow"

### Desabilitar Workflow

1. Vá para Actions no GitHub
2. Selecione o workflow
3. Clique nos três pontos (...)
4. Clique em "Disable workflow"

### Modificar Schedule

Edite o arquivo do workflow e ajuste o cron:

```yaml
on:
  schedule:
    - cron: '0 0 * * *' # Diariamente à meia-noite
    # Formato: minuto hora dia mês dia-da-semana
```

Exemplos:
- `'0 0 * * *'` - Diariamente à meia-noite
- `'0 0 * * 1'` - Toda segunda-feira
- `'0 */6 * * *'` - A cada 6 horas
- `'0 0 1 * *'` - Primeiro dia de cada mês

## 📝 Manutenção

### Atualizar Actions

Periodicamente, atualize as versões das actions:

```yaml
# Antes
- uses: actions/checkout@v3

# Depois
- uses: actions/checkout@v4
```

### Monitorar Uso

- Settings → Billing → Actions
- Limite gratuito: 2000 minutos/mês (público ilimitado)

### Debug

Adicione ao workflow para debug:

```yaml
- name: Debug
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "Actor: ${{ github.actor }}"
```

## 🤝 Contribuindo

Para adicionar novos workflows:

1. Crie arquivo em `.github/workflows/`
2. Teste localmente com [act](https://github.com/nektos/act)
3. Documente aqui no README
4. Abra PR com descrição clara

---

**Sentinel** — Workflows automatizados para máxima produtividade 🛡️
