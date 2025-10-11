# 🚀 Quick Start Guide

Guia rápido para começar a usar o Sentinel em 5 minutos.

## 1. Instalação

Instale o Sentinel globalmente na sua máquina.

```bash
npm install -g @mhsolutions/sentinel
```

## 2. Ativar Integração Automática (Recomendado)

Para que o Sentinel monitore **todos** os seus comandos automaticamente, integre-o ao seu shell. Execute o comando correspondente ao seu terminal:

```bash
# Para Zsh (usado no macOS moderno e muitos Linux)
sentinel init zsh

# Para Bash (padrão em muitos sistemas Linux)
sentinel init bash
```

Em seguida, adicione a linha fornecida ao seu arquivo de configuração (`~/.zshrc` ou `~/.bashrc`):

```bash
eval "$(sentinel init zsh)" # ou bash
```

Reinicie seu terminal e o Sentinel estará ativo!

## 3. Testando a Proteção

Agora que a integração está ativa, apenas digite um comando arriscado. O Sentinel irá interceptá-lo.

```bash
# Tente este comando (ele será bloqueado)
git push --force
```

## 4. Ver Suas Estatísticas

Veja um resumo da sua atividade e dos comandos analisados.

```bash
sentinel stats
```

## Uso Manual (Alternativo)

Se não quiser a integração automática, você pode usar o Sentinel manualmente prefixando seus comandos com `sentinel exec`.

```bash
sentinel exec echo "Hello, Sentinel!"
sentinel exec git push --force
```

## Próximos Passos

1. ✅ Instale o Sentinel
2. ✅ Ative a integração com o shell
3. ✅ Teste com comandos arriscados
4. ✅ Crie seu `sentinel.yml` customizado
5. 📚 Leia a [documentação completa](../README.md)
6. 🔌 Explore [plugins](./PLUGIN_GUIDE.md)

---

**Pronto!** Você está protegido pelo Sentinel. 🛡️
