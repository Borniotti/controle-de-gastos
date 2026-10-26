import type { Lancamento, Orcamentos } from '../tipos';

/** "2026-10" a partir de "2026-10-25". */
export const mesDe = (data: string) => data.slice(0, 7);

export function deslocarMes(mes: string, quantidade: number): string {
  const [ano, m] = mes.split('-').map(Number) as [number, number];
  const d = new Date(Date.UTC(ano, m - 1 + quantidade, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function nomeDoMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number) as [number, number];
  const nome = new Date(Date.UTC(ano, m - 1, 1)).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export interface Resumo {
  receitas: number;
  despesas: number;
  saldo: number;
}

export function resumir(lancamentos: Lancamento[]): Resumo {
  let receitas = 0;
  let despesas = 0;
  for (const l of lancamentos) {
    if (l.tipo === 'receita') receitas += l.valor;
    else despesas += l.valor;
  }
  return { receitas, despesas, saldo: receitas - despesas };
}

export interface Filtro {
  mes?: string;
  categoria?: string;
  busca?: string;
}

const semAcento = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function filtrar(lancamentos: Lancamento[], { mes, categoria, busca }: Filtro): Lancamento[] {
  const termo = busca ? semAcento(busca.trim()) : '';
  return lancamentos
    .filter((l) => !mes || mesDe(l.data) === mes)
    .filter((l) => !categoria || l.categoria === categoria)
    .filter((l) => !termo || semAcento(l.descricao).includes(termo))
    .sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id));
}

export interface FatiaCategoria {
  categoria: string;
  total: number;
  porcentagem: number;
}

/** Despesas somadas por categoria, da maior para a menor. */
export function despesasPorCategoria(lancamentos: Lancamento[]): FatiaCategoria[] {
  const totais = new Map<string, number>();
  for (const l of lancamentos) {
    if (l.tipo === 'despesa') totais.set(l.categoria, (totais.get(l.categoria) ?? 0) + l.valor);
  }
  const soma = [...totais.values()].reduce((a, b) => a + b, 0);
  return [...totais]
    .map(([categoria, total]) => ({ categoria, total, porcentagem: soma ? (total / soma) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);
}

export interface MesHistorico extends Resumo {
  mes: string;
}

/** Os últimos `quantidade` meses terminando em `ate`, inclusive meses sem lançamentos. */
export function historicoMensal(lancamentos: Lancamento[], ate: string, quantidade = 6): MesHistorico[] {
  return Array.from({ length: quantidade }, (_, i) => {
    const mes = deslocarMes(ate, i - quantidade + 1);
    return { mes, ...resumir(lancamentos.filter((l) => mesDe(l.data) === mes)) };
  });
}

export interface SituacaoOrcamento {
  categoria: string;
  limite: number;
  gasto: number;
  porcentagem: number;
  estado: 'ok' | 'atencao' | 'estourado';
}

export function situacaoOrcamentos(lancamentosDoMes: Lancamento[], orcamentos: Orcamentos): SituacaoOrcamento[] {
  const gastos = new Map(despesasPorCategoria(lancamentosDoMes).map((f) => [f.categoria, f.total]));
  return Object.entries(orcamentos)
    .filter(([, limite]) => limite > 0)
    .map(([categoria, limite]) => {
      const gasto = gastos.get(categoria) ?? 0;
      const porcentagem = (gasto / limite) * 100;
      const estado = porcentagem > 100 ? 'estourado' : porcentagem >= 80 ? 'atencao' : 'ok';
      return { categoria, limite, gasto, porcentagem, estado } as const;
    })
    .sort((a, b) => b.porcentagem - a.porcentagem);
}
