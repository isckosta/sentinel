# 🚀 Getting Started - Primeiros Passos

Bem-vindo ao **Sentinel**! Este guia vai te ajudar a começar em menos de 5 minutos.

## 📦 Passo 1: Instalar Dependências

Como o projeto já está criado, você precisa instalar as dependências:

```bash
cd z:\home\isckosta\projects\mhsolutions\sentinel
npm install
```

Isso instalará todas as dependências necessárias listadas no `package.json`.

## 🔨 Passo 2: Compilar o Projeto

Compile o TypeScript para JavaScript:

```bash
npm run build
```

Isso criará o diretório `dist/` com o código compilado.

## ✅ Passo 3: Testar o CLI

### Opção A: Usar diretamente

```bash
node dist/index.js --help
```

### Opção B: Criar link global

```bash
npm link
```

Agora você pode usar `sentinel` de qualquer lugar:

```bash
sentinel --help
```

## 🎯 Passo 4: Primeiro Comando

Teste com um comando simples e seguro:

```bash
sentinel echo "Hello, Sentinel!"
```

Você deve ver:
```
🛡️  SENTINEL
O guardião entre você e o caos

⚡ Executando comando...

Hello, Sentinel!

✅ Comando executado com sucesso
```

## 📊 Passo 5: Ver Estatísticas

```bash
sentinel stats
```

Você verá um relatório colorido com suas estatísticas.

## ⚠️ Passo 6: Testar Comando de Risco

Teste um comando que o Sentinel considera arriscado:

```bash
sentinel git push --force
```

O Sentinel deve exibir um alerta amarelo e pedir confirmação.

## 🧪 Passo 7: Rodar os Testes

Verifique se tudo está funcionando:

```bash
npm test
```

Todos os testes devem passar! ✅

## 🔧 Desenvolvimento

### Modo de Desenvolvimento

Para desenvolvimento com TypeScript direto:

```bash
npm run dev -- echo "Test"
```

### Watch Mode para Testes

```bash
npm run test:watch
```

### Lint

```bash
npm run lint
```

## 📝 Configuração Personalizada

### Criar seu sentinel.yml

Crie um arquivo `sentinel.yml` na raiz do projeto (ou use o que já existe em `config/`):

```yaml
rules:
  - pattern: "*seu-comando-perigoso*"
    level: critical
    message: "Sua mensagem customizada"

plugins: []
```

### Testar sua Configuração

```bash
sentinel seu-comando-perigoso
```

## 🔌 Criar um Plugin

### 1. Crie o arquivo do plugin

```bash
# Windows
type nul > plugins/meu-plugin.js

# Linux/Mac
touch plugins/meu-plugin.js
```

### 2. Implemente o plugin

```javascript
module.exports = {
  name: 'meu-plugin',
  evaluate: (command, currentScore) => {
    // Sua lógica aqui
    return currentScore + 10;
  }
};
```

### 3. Adicione ao sentinel.yml

```yaml
plugins:
  - "./plugins/meu-plugin.js"
```

### 4. Teste

```bash
sentinel echo "test"
```

## 📚 Próximos Passos

### Documentação

- 📖 [README.md](README.md) - Documentação completa
- 🏗️ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura do sistema
- 🔌 [PLUGIN_GUIDE.md](docs/PLUGIN_GUIDE.md) - Guia de plugins
- 📝 [EXAMPLES.md](docs/EXAMPLES.md) - Exemplos práticos
- 🤝 [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Como contribuir

### Integração

Integre o Sentinel com seus projetos:

```json
{
  "scripts": {
    "deploy": "sentinel npm run deploy:prod",
    "db:reset": "sentinel prisma migrate reset",
    "db:push": "sentinel prisma db push"
  }
}
```

### Comandos Úteis

```bash
# Ver ajuda
sentinel --help

# Ver versão
sentinel --version

# Ver estatísticas
sentinel stats

# Executar comando
sentinel <seu-comando>

# Auto-aprovar comandos seguros
sentinel -y npm test

# Usar config customizado
sentinel -c ./custom-config.yml <comando>
```

## 🐛 Problemas Comuns

### "Cannot find module"

```bash
npm install
```

### "sentinel: command not found"

```bash
npm link
# ou use: node dist/index.js
```

### "Permission denied"

```bash
# Linux/Mac
chmod +x dist/index.js

# Windows: Execute como Administrador
```

### Testes falham

```bash
# Verifique a versão do Node.js
node -v  # Deve ser >= 20.0.0
```

## 🎓 Exemplos Rápidos

### Proteger Deploys

```bash
sentinel npm run deploy:production
sentinel kubectl apply -f production/
```

### Proteger Banco de Dados

```bash
sentinel prisma migrate reset
sentinel psql -c "DROP DATABASE mydb"
```

### Proteger Git

```bash
sentinel git push --force
sentinel git reset --hard HEAD~10
```

## 🎯 Checklist de Início

- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto compilado (`npm run build`)
- [ ] Link global criado (`npm link`)
- [ ] Primeiro comando testado (`sentinel echo "test"`)
- [ ] Estatísticas visualizadas (`sentinel stats`)
- [ ] Testes rodados (`npm test`)
- [ ] Documentação lida ([README.md](README.md))

## 💡 Dicas

1. **Use alias** para comandos frequentes:
   ```bash
   alias deploy='sentinel npm run deploy'
   ```

2. **Integre com Git hooks** para proteção automática:
   ```bash
   # .git/hooks/pre-push
   sentinel git push "$@"
   ```

3. **Monitore regularmente** suas estatísticas:
   ```bash
   sentinel stats
   ```

4. **Customize as regras** para seu workflow:
   ```yaml
   # sentinel.yml
   rules:
     - pattern: "*seu-padrão*"
       level: warning
       message: "Sua mensagem"
   ```

## 🆘 Precisa de Ajuda?

- 📖 Leia a [documentação completa](README.md)
- 🐛 Reporte bugs nas [Issues](https://github.com/mhsolutions/sentinel/issues)
- 💬 Faça perguntas nas [Discussions](https://github.com/mhsolutions/sentinel/discussions)
- 📧 Entre em contato: support@mhsolutions.com

## 🎉 Pronto!

Você está pronto para usar o Sentinel! 🛡️

Comece protegendo seus comandos mais perigosos e veja como o Sentinel pode salvar seu dia (e sua carreira) de desastres DevOps.

**Lembre-se**: Sentinel não é apenas um bloqueador — é um mentor técnico com personalidade.

---

**Sentinel** — O guardião entre você e o caos 🛡️
