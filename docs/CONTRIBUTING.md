# Guia de Contribuição

Obrigado por considerar contribuir com o Sentinel! Este documento fornece diretrizes para contribuir com o projeto.

## 🎯 Como Contribuir

### Reportando Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/isckosta/sentinel/issues)
2. Se não, crie uma nova issue com:
   - Título descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Versão do Node.js e Sentinel
   - Sistema operacional

### Sugerindo Melhorias

1. Abra uma issue com tag `enhancement`
2. Descreva claramente:
   - O problema que a feature resolve
   - Como você imagina a solução
   - Exemplos de uso

### Pull Requests

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça suas mudanças
4. Adicione testes
5. Rode os testes: `npm test`
6. Commit: `git commit -m 'feat: adiciona nova feature'`
7. Push: `git push origin feature/minha-feature`
8. Abra um Pull Request

## 📝 Padrões de Código

### TypeScript

- Use TypeScript estrito
- Sempre defina tipos explícitos
- Evite `any` quando possível
- Use interfaces para contratos públicos

```typescript
// ✅ Bom
function calculateRisk(command: ParsedCommand): number {
  return 0;
}

// ❌ Ruim
function calculateRisk(command: any): any {
  return 0;
}
```

### Naming Conventions

- Classes: `PascalCase`
- Funções/Métodos: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Arquivos: `kebab-case.ts`

### Comentários

- Use JSDoc para funções públicas
- Comente lógica complexa
- Não comente o óbvio

```typescript
/**
 * Calculates the risk score for a given command
 * @param command - Parsed command object
 * @returns Risk score between 0-100
 */
function calculateRisk(command: ParsedCommand): number {
  // Complex logic here deserves a comment
  const baseScore = command.args.length * 10;
  return Math.min(baseScore, 100);
}
```

## 🧪 Testes

### Escrevendo Testes

- Todo código novo deve ter testes
- Mantenha cobertura > 80%
- Use nomes descritivos

```typescript
describe('RiskEngine', () => {
  test('should return critical for dangerous commands', () => {
    // Arrange
    const command = createDangerousCommand();
    
    // Act
    const result = engine.assess(command);
    
    // Assert
    expect(result.level).toBe('critical');
  });
});
```

### Rodando Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com coverage
npm test -- --coverage
```

## 📦 Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Tarefas de build, configs, etc

Exemplos:
```
feat: adiciona suporte para Docker commands
fix: corrige cálculo de score para branches
docs: atualiza guia de plugins
test: adiciona testes para telemetry
```

## 🏗️ Estrutura do Projeto

```
sentinel/
├── src/
│   ├── core/          # Lógica principal
│   ├── ui/            # Interface do usuário
│   ├── utils/         # Utilitários
│   └── types/         # Definições de tipos
├── tests/             # Testes
├── docs/              # Documentação
├── config/            # Configurações padrão
└── plugins/           # Plugins exemplo
```

## 🔍 Code Review

Pull requests serão revisados considerando:

1. **Funcionalidade**: Resolve o problema proposto?
2. **Testes**: Tem testes adequados?
3. **Documentação**: Está documentado?
4. **Estilo**: Segue os padrões do projeto?
5. **Performance**: Não introduz problemas de performance?

## 🎨 UI/UX

Ao adicionar mensagens ou output:

- Use cores apropriadas (chalk)
- Mantenha o tom profissional mas espirituoso
- Seja claro e conciso
- Pense na experiência do usuário

## 🔌 Desenvolvendo Plugins

Veja [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) para detalhes sobre como criar plugins.

## 📚 Documentação

- Atualize o README.md se necessário
- Adicione exemplos de uso
- Documente breaking changes
- Atualize CHANGELOG.md

## 🚀 Release Process

1. Atualize versão: `npm version [patch|minor|major]`
2. Atualize CHANGELOG.md
3. Commit: `git commit -m "chore: release vX.Y.Z"`
4. Tag: `git tag vX.Y.Z`
5. Push: `git push && git push --tags`
6. CI/CD publica automaticamente

## 💬 Comunicação

- Issues: Para bugs e features
- Discussions: Para perguntas e ideias
- Discord: [Link do servidor] (futuro)

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT do projeto.

## 🙏 Reconhecimento

Todos os contribuidores serão adicionados ao README.md na seção de Contributors.

## ❓ Dúvidas?

Não hesite em abrir uma issue com suas dúvidas ou entrar em contato com os mantenedores.

---

Obrigado por contribuir com o Sentinel! 🛡️
