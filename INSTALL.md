# 📦 Guia de Instalação e Build

## Requisitos

- **Node.js**: 20.0.0 ou superior
- **npm**: 9.0.0 ou superior
- **Git**: Para clonar o repositório (desenvolvimento)

## Instalação para Usuários

### Via NPM (Global)

```bash
npm install -g @mhsolutions/sentinel
```

Após a instalação, o comando `sentinel` estará disponível globalmente.

### Via NPM (Local)

```bash
npm install --save-dev @mhsolutions/sentinel
```

Use via `npx sentinel` ou adicione aos scripts do `package.json`.

### Via npx (Sem Instalação)

```bash
npx @mhsolutions/sentinel exec <comando>
```

## Instalação para Desenvolvimento

### 1. Clone o Repositório

```bash
git clone https://github.com/mhsolutions/sentinel.git
cd sentinel
```

### 2. Instale as Dependências

```bash
npm install
```

Isso instalará todas as dependências listadas em `package.json`:
- **Produção**: chalk, commander, inquirer, js-yaml, ora, pino
- **Desenvolvimento**: TypeScript, Jest, ESLint, tipos, etc.

### 3. Build do Projeto

```bash
npm run build
```

Isso compila o TypeScript para JavaScript no diretório `dist/`.

### 4. Link Global (Opcional)

Para usar o comando `sentinel` globalmente durante o desenvolvimento:

```bash
npm link
```

Agora você pode executar `sentinel` de qualquer lugar no sistema.

### 5. Verifique a Instalação

```bash
sentinel --version
sentinel --help
```

## Scripts Disponíveis

### Build e Execução

```bash
# Compilar TypeScript
npm run build

# Executar versão compilada
npm start

# Executar com ts-node (desenvolvimento)
npm run dev
```

### Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage
```

### Qualidade de Código

```bash
# Lint
npm run lint

# Lint com correção automática
npm run lint:fix

# Formatação com Prettier
npm run format
```

### Release

```bash
# Patch version (0.1.0 -> 0.1.1)
npm run release

# Minor version (0.1.0 -> 0.2.0)
npm run release:minor

# Major version (0.1.0 -> 1.0.0)
npm run release:major
```

## Estrutura de Build

### Entrada
- **Source**: `src/`
- **Entry point**: `src/index.ts`

### Saída
- **Dist**: `dist/`
- **Main**: `dist/index.js`
- **Types**: `dist/index.d.ts`
- **Source maps**: `dist/*.js.map`

### Arquivos Incluídos no Pacote NPM

- `dist/` - Código compilado
- `config/` - Configuração YAML padrão
- `plugins/` - Plugin exemplo
- `README.md` - Documentação
- `LICENSE` - Licença MIT
- `CHANGELOG.md` - Histórico de mudanças

## Troubleshooting

### Erro: "Cannot find module"

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "tsc: command not found"

```bash
# Instale TypeScript globalmente
npm install -g typescript

# Ou use via npx
npx tsc
```

### Erro de Permissão no npm link

```bash
# Linux/Mac
sudo npm link

# Windows (execute como Administrador)
npm link
```

### Build Falha

```bash
# Limpe e rebuilde
rm -rf dist
npm run build
```

### Testes Falham

```bash
# Verifique a versão do Node.js
node -v  # Deve ser >= 20.0.0

# Reinstale dependências de teste
npm install --save-dev jest ts-jest @types/jest
```

## Desenvolvimento Local

### Setup Rápido

Use o script de setup automatizado:

```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

Este script:
1. Verifica a versão do Node.js
2. Instala dependências
3. Compila o projeto
4. Roda os testes
5. Cria link global

### Workflow de Desenvolvimento

1. **Faça mudanças** no código em `src/`
2. **Compile**: `npm run build`
3. **Teste**: `npm test`
4. **Lint**: `npm run lint`
5. **Teste manualmente**: `sentinel <comando>`

### Hot Reload

Para desenvolvimento com reload automático:

```bash
# Terminal 1: Watch mode para TypeScript
npx tsc --watch

# Terminal 2: Teste seus comandos
node dist/index.js <comando>
```

Ou use `ts-node` diretamente:

```bash
npx ts-node src/index.ts <comando>
```

## Publicação no NPM

### Pré-requisitos

1. Conta no NPM
2. Login: `npm login`
3. Acesso ao scope `@mhsolutions`

### Processo

```bash
# 1. Certifique-se de que tudo está commitado
git status

# 2. Atualize o CHANGELOG.md

# 3. Execute o release
npm run release  # Para patch
# ou
npm run release:minor  # Para minor
# ou
npm run release:major  # Para major

# 4. O script automaticamente:
#    - Atualiza a versão no package.json
#    - Cria um commit
#    - Cria uma tag
#    - Publica no NPM
```

### Publicação Manual

```bash
# Build
npm run build

# Teste
npm test

# Publicar
npm publish --access public
```

## Verificação Pós-Instalação

### Como Usuário

```bash
# Instale
npm install -g @mhsolutions/sentinel

# Verifique
sentinel --version
sentinel --help

# Teste
sentinel echo "Hello, Sentinel!"

# Veja stats
sentinel stats
```

### Como Desenvolvedor

```bash
# Clone e setup
git clone <repo>
cd sentinel
npm install
npm run build
npm link

# Verifique
sentinel --version

# Rode testes
npm test

# Teste manualmente
sentinel echo "Test"
```

## Desinstalação

### Global

```bash
npm uninstall -g @mhsolutions/sentinel
```

### Local

```bash
npm uninstall @mhsolutions/sentinel
```

### Link de Desenvolvimento

```bash
npm unlink sentinel
```

## Suporte

- **Issues**: https://github.com/mhsolutions/sentinel/issues
- **Discussions**: https://github.com/mhsolutions/sentinel/discussions
- **Email**: support@mhsolutions.com

---

Para mais informações, consulte o [README.md](README.md) principal.
