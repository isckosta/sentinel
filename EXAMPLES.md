# Exemplos de Uso do Sentinel

Este documento contém exemplos práticos de como usar o Sentinel em diferentes cenários.

## 🎯 Cenários Comuns

### 1. Migrações de Banco de Dados

#### Prisma Migrate Reset

```bash
$ sentinel prisma migrate reset --force

🚨 ALERTA CRÍTICO - COMANDO PERIGOSO DETECTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: prisma migrate reset --force
Score de Risco: 95/100
Branch: main
Ambiente: production

Motivos para bloqueio:
  • Esse comando parece suicida. Quer pensar de novo?
  • Flag --force detectada. Cuidado com o que deseja.
  • Operação na branch principal detectada
  • Ambiente de produção detectado
  • Comando destrutivo detectado
  • Migração de banco detectada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Sentinel recomenda:
  • Revisar o comando cuidadosamente
  • Verificar se está no ambiente correto
  • Considerar fazer backup antes de prosseguir
  • Consultar a equipe se houver dúvidas

? Você REALMENTE entende as consequências deste comando? No
✅ Decisão sábia. Comando bloqueado.
```

#### Alternativa Segura

```bash
# Em branch de desenvolvimento
$ git checkout develop
$ sentinel prisma migrate reset --force

⚠️  ALERTA DE RISCO MODERADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: prisma migrate reset --force
Score de Risco: 55/100

Motivos:
  • Flag --force detectada. Cuidado com o que deseja.
  • Comando destrutivo detectado
  • Migração de banco detectada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? Deseja prosseguir mesmo assim? Yes

⚡ Executando comando...
[Prisma output...]
✅ Comando executado com sucesso
```

### 2. Operações Git

#### Force Push

```bash
$ sentinel git push --force origin main

🚨 ALERTA CRÍTICO - COMANDO PERIGOSO DETECTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: git push --force origin main
Score de Risco: 70/100
Branch: main

Motivos para bloqueio:
  • Force push pode reescrever história. Equipe está ciente?
  • Flag --force detectada. Cuidado com o que deseja.
  • Operação na branch principal detectada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Push Normal (Seguro)

```bash
$ sentinel git push origin feature/new-feature

⚡ Executando comando...
[Git output...]
✅ Comando executado com sucesso
```

### 3. Deploys

#### Deploy em Produção

```bash
$ sentinel npm run deploy:production

⚠️  ALERTA DE RISCO MODERADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: npm run deploy:production
Score de Risco: 50/100

Motivos:
  • Deploy em produção. Todos os testes passaram?
  • Ambiente de produção detectado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? Deseja prosseguir mesmo assim? Yes
```

#### Deploy Noturno

```bash
$ sentinel npm run deploy:production
# Executado às 23h

⚠️  ALERTA DE RISCO MODERADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: npm run deploy:production
Score de Risco: 65/100

Motivos:
  • Deploy em produção. Todos os testes passaram?
  • Ambiente de produção detectado
  • Nada de bom acontece depois das 22h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Docker Operations

#### System Prune

```bash
$ sentinel docker system prune -a

⚠️  ALERTA DE RISCO MODERADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: docker system prune -a
Score de Risco: 40/100

Motivos:
  • Isso vai remover todos os containers, imagens e volumes não usados.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? Deseja prosseguir mesmo assim?
```

### 5. Kubernetes

#### Delete em Produção

```bash
$ sentinel kubectl delete deployment api --namespace=production

🚨 ALERTA CRÍTICO - COMANDO PERIGOSO DETECTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comando: kubectl delete deployment api --namespace=production
Score de Risco: 75/100
Ambiente: production

Motivos para bloqueio:
  • Deletar recursos em produção? Isso vai doer.
  • Comando destrutivo detectado
  • Ambiente de produção detectado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📊 Visualizando Estatísticas

### Comando Stats

```bash
$ sentinel stats

╔════════════════════════════════════════════════════════════════╗
║                    🛡️  SENTINEL STATS                         ║
╚════════════════════════════════════════════════════════════════╝

📊 Visão Geral
────────────────────────────────────────────────────────────────
  Total de comandos avaliados:  45
  Comandos executados:          38 (84.4%)
  Comandos bloqueados:          7 (15.6%)

⚠️  Distribuição de Risco
────────────────────────────────────────────────────────────────
  ✓ Safe:     ████████████████████████████░░ 30 (66.7%)
  ⚠ Warning:  ████████░░░░░░░░░░░░░░░░░░░░ 10 (22.2%)
  ✖ Critical: ██░░░░░░░░░░░░░░░░░░░░░░░░░░ 5 (11.1%)

🚨 Informações de Incidentes
────────────────────────────────────────────────────────────────
  Último incidente:             10 de out, 15:30
  Dias sem autossabotagem:      0 😬 (Foi hoje mesmo...)

📜 Eventos Recentes
────────────────────────────────────────────────────────────────
  ✗ ✖ out 10, 15:30 critical prisma migrate reset --force
  ✓ ✓ out 10, 14:20 safe     npm test
  ✓ ⚠ out 10, 13:15 warning  git push --force
  ✓ ✓ out 10, 11:00 safe     npm run build
  ✓ ✓ out 10, 09:30 safe     git commit -m "fix"

────────────────────────────────────────────────────────────────
  ⚠️  Muitos comandos críticos detectados. Prudência é a chave.
────────────────────────────────────────────────────────────────
```

## 🔧 Uso com Flags

### Auto-approve Comandos Seguros

```bash
# Sem flag -y
$ sentinel npm test
⚡ Executando comando...
[Test output...]
✅ Comando executado com sucesso

# Com flag -y (mesma coisa, mas sem delay)
$ sentinel -y npm test
⚡ Executando comando...
[Test output...]
✅ Comando executado com sucesso
```

### Config Customizado

```bash
$ sentinel -c ./custom-sentinel.yml prisma migrate reset

# Usa regras do arquivo custom-sentinel.yml
```

## 🔌 Integrando com Scripts

### package.json

```json
{
  "scripts": {
    "deploy:prod": "sentinel npm run deploy:production",
    "db:reset": "sentinel prisma migrate reset",
    "db:push": "sentinel prisma db push"
  }
}
```

### Makefile

```makefile
.PHONY: deploy
deploy:
	sentinel kubectl apply -f k8s/production/

.PHONY: db-reset
db-reset:
	sentinel prisma migrate reset --force

.PHONY: clean
clean:
	sentinel docker system prune -a
```

### Shell Alias

```bash
# .bashrc ou .zshrc
alias deploy='sentinel npm run deploy'
alias k='sentinel kubectl'
alias docker='sentinel docker'
```

## 🎭 Cenários de Workflow

### Workflow de Deploy Seguro

```bash
# 1. Verificar branch
$ git branch
* feature/new-api

# 2. Rodar testes
$ sentinel npm test
✅ Comando executado com sucesso

# 3. Build
$ sentinel npm run build
✅ Comando executado com sucesso

# 4. Merge para main (via PR)
# [GitHub PR process...]

# 5. Deploy em staging
$ git checkout staging
$ sentinel npm run deploy:staging
⚠️  ALERTA DE RISCO MODERADO
? Deseja prosseguir mesmo assim? Yes
✅ Comando executado com sucesso

# 6. Verificar staging
# [Manual testing...]

# 7. Deploy em produção
$ git checkout main
$ sentinel npm run deploy:production
⚠️  ALERTA DE RISCO MODERADO
? Deseja prosseguir mesmo assim? Yes
✅ Comando executado com sucesso

# 8. Verificar estatísticas
$ sentinel stats
```

### Workflow de Migração de Banco

```bash
# 1. Criar migração em dev
$ git checkout develop
$ sentinel prisma migrate dev --name add_users_table
✅ Comando executado com sucesso

# 2. Testar localmente
$ sentinel npm test
✅ Comando executado com sucesso

# 3. Aplicar em staging
$ git checkout staging
$ sentinel prisma migrate deploy
⚠️  ALERTA DE RISCO MODERADO
? Deseja prosseguir mesmo assim? Yes
✅ Comando executado com sucesso

# 4. Backup de produção
$ pg_dump production > backup.sql

# 5. Aplicar em produção
$ git checkout main
$ sentinel prisma migrate deploy
⚠️  ALERTA DE RISCO MODERADO
? Deseja prosseguir mesmo assim? Yes
✅ Comando executado com sucesso
```

## 🚫 Comandos que Sentinel Bloqueia

### Extremamente Perigosos

```bash
# Sistema de arquivos
$ sentinel rm -rf /
🚨 ALERTA CRÍTICO
Isso vai destruir o sistema. PARE IMEDIATAMENTE.

# Banco de dados
$ sentinel psql -c "DROP DATABASE production"
🚨 ALERTA CRÍTICO
DROP DATABASE? Sério? Respire fundo antes de continuar.

# Kubernetes
$ sentinel kubectl delete --all --all-namespaces
🚨 ALERTA CRÍTICO
Delete all? Espero que saiba o que está fazendo.
```

## 💡 Dicas e Truques

### 1. Testar Configuração

```bash
# Ver o que Sentinel faria sem executar
$ sentinel --dry-run prisma migrate reset
# (Feature futura)
```

### 2. Modo Verbose

```bash
$ LOG_LEVEL=debug sentinel npm run deploy
# Mostra logs detalhados de avaliação
```

### 3. Desabilitar Temporariamente

```bash
# Executar comando diretamente sem Sentinel
$ npm run deploy:production

# Ou criar alias
alias unsafe='command'
$ unsafe rm -rf node_modules
```

### 4. Integração com CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Deploy with Sentinel
  run: |
    npm install -g @mhsolutions/sentinel
    sentinel -y npm run deploy:production
```

## 📚 Recursos Adicionais

- [README.md](../README.md) - Documentação principal
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) - Criando plugins
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir

## 🆘 Problemas Comuns

### Sentinel não detecta branch

```bash
# Certifique-se de estar em um repositório Git
$ git status

# Se não for um repo Git, Sentinel não pode detectar branch
$ git init
```

### Comando sempre bloqueado

```bash
# Verifique as regras em sentinel.yml
$ cat sentinel.yml

# Ajuste o pattern ou level conforme necessário
```

### Estatísticas não aparecem

```bash
# Verifique se o diretório existe
$ ls ~/.sentinel/

# Se não existir, execute um comando primeiro
$ sentinel echo "test"
```

---

Para mais exemplos e casos de uso, visite a [documentação completa](../README.md).
