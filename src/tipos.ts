export type TipoLancamento = 'receita' | 'despesa';

export interface Lancamento {
  id: string;
  descricao: string;
  /** Valor em centavos, sempre positivo. Inteiros evitam erros de arredondamento (0,1 + 0,2). */
  valor: number;
  tipo: TipoLancamento;
  categoria: string;
  /** Data no formato AAAA-MM-DD. */
  data: string;
}

/** Limite mensal de gastos por categoria, em centavos. */
export type Orcamentos = Record<string, number>;

export const CATEGORIAS_DESPESA = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Compras',
  'Outros',
] as const;

export const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Outros'] as const;
