# Busca Inteligente

Este documento descreve a implementação inicial do recurso de busca por IA no CloudControl.

## Conceito

A funcionalidade permite que o usuário pesquise informações diretamente pelo chat ou por formulários dedicados. Inicialmente, a busca suporta a consulta de produtos pelo nome dentro do tenant logado.

## Como Funciona

1. O `SearchService` usa o `DatabaseService` para acessar as coleções do Firestore.
2. Ao chamar `searchProductByName`, o serviço procura na coleção `products` do tenant atual um documento cujo campo `name` seja igual ao texto informado.
3. O primeiro resultado é retornado para quem fez a chamada.

## Próximos Passos

- Expandir a lógica de busca para aceitar comandos em linguagem natural.
- Integrar modelos de IA externos para compreender perguntas mais complexas.
- Permitir consultas a outras coleções, como clientes ou vendas.
