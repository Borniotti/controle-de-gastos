# 💸 Controle de Gastos

[![Testes e site](https://github.com/Borniotti/controle-de-gastos/actions/workflows/site.yml/badge.svg)](https://github.com/Borniotti/controle-de-gastos/actions/workflows/site.yml)

**[Abrir o app →](https://borniotti.github.io/controle-de-gastos/)** · [English below](#english)

App de finanças pessoais feito com **React + TypeScript**. Você registra receitas e despesas, vê para onde o dinheiro foi, acompanha os últimos seis meses e define limites de gasto por categoria. Os dados ficam só no seu navegador, sem cadastro e sem servidor.

Clique em **Ver exemplo** para carregar seis meses de dados fictícios.

## Funcionalidades

- Resumo do mês: receitas, despesas e saldo.
- Gráfico de rosca com as despesas por categoria e gráfico de barras com os últimos 6 meses, os dois feitos em SVG, sem biblioteca de gráficos.
- Orçamento por categoria, com barra que fica amarela perto do limite e vermelha quando estoura.
- Busca (sem diferenciar acentos) e filtro por categoria.
- Importar e exportar CSV no padrão brasileiro (`;` e vírgula decimal), que abre direto no Excel.
- Tema claro e escuro automático, layout para celular e navegação por teclado.

## Decisões técnicas

| Decisão | Por quê |
|---|---|
| Valores guardados em **centavos inteiros** | Evita o erro clássico de `0,1 + 0,2 = 0,30000000000000004` em dinheiro. |
| Regras de negócio em [`src/lib/`](src/lib), separadas dos componentes | A lógica é testada sem precisar de navegador, e os componentes ficam simples. |
| Leitor de valores que aceita `1.234,56`, `R$ 12` e `12.50` | É assim que as pessoas digitam no Brasil. Valores ambíguos como `12,345` são recusados com mensagem clara. |
| Leitor de CSV próprio, que respeita aspas | Descrições com `;` ou aspas não quebram a importação. Linhas ruins são apontadas pelo número, e as boas são importadas. |
| Hook `useArmazenamento` | Igual ao `useState`, mas salva no `localStorage`, e continua funcionando em aba anônima. |
| TypeScript em modo estrito (`strict` + `noUncheckedIndexedAccess`) | Pega erros antes de rodar. |

## Testes

32 testes com **Vitest** e **Testing Library**: regras de dinheiro, cálculos do mês, CSV de ida e volta e o app sendo usado como uma pessoa usaria (digitando e clicando). O GitHub Actions roda verificação de tipos, testes e build a cada mudança e publica o site no GitHub Pages.

## Rodar no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
git clone https://github.com/Borniotti/controle-de-gastos.git
cd controle-de-gastos
npm install
npm run dev     # abre em http://localhost:5173/controle-de-gastos/
npm test        # roda os testes
```

## Estrutura

```
src/
├── App.tsx                 tela principal
├── components/             formulário, gráficos e orçamentos
├── hooks/useArmazenamento.ts
├── lib/                    regras: dinheiro, finanças, CSV (com testes ao lado)
└── tipos.ts
```

> Projeto feito com a ajuda de IA (Claude), com revisão e decisões minhas.

---

## English

**[Open the app →](https://borniotti.github.io/controle-de-gastos/)**

A personal finance tracker built with **React + TypeScript** (UI in Brazilian Portuguese). Log income and expenses, see where the money went, follow the last six months and set monthly budgets per category. Data stays in the browser: no sign-up, no backend. Click **Ver exemplo** to load six months of sample data.

**Highlights**

- Monthly summary, a donut chart by category and a 6-month bar chart, both hand-built in SVG with no chart library.
- Per-category budgets with warning and over-budget states.
- Accent-insensitive search and category filter.
- CSV import/export in the Brazilian Excel format (`;` separator, comma decimals), with a quote-aware parser and per-line error reporting.
- Money stored as **integer cents** to avoid floating-point errors.
- Business logic in `src/lib/`, separate from components and unit-tested.
- Strict TypeScript, light/dark theme, responsive and keyboard accessible.
- 32 tests (Vitest + Testing Library); GitHub Actions runs type checks, tests and build, then deploys to GitHub Pages.

```bash
npm install && npm run dev   # http://localhost:5173/controle-de-gastos/
npm test
```

> Built with AI assistance (Claude), reviewed and directed by me.

License: [MIT](LICENSE)
