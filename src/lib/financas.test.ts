import { describe, expect, it } from 'vitest';
import type { Lancamento } from '../tipos';
import {
  deslocarMes,
  despesasPorCategoria,
  filtrar,
  historicoMensal,
  nomeDoMes,
  resumir,
  situacaoOrcamentos,
} from './financas';

let contador = 0;
function lanc(data: string, valor: number, tipo: Lancamento['tipo'], categoria = 'Outros', descricao = 'Item'): Lancamento {
  return { id: String(++contador).padStart(4, '0'), data, valor, tipo, categoria, descricao };
}

const dados = [
  lanc('2026-10-05', 500000, 'receita', 'Salário'),
  lanc('2026-10-06', 150000, 'despesa', 'Moradia', 'Aluguel'),
  lanc('2026-10-08', 60000, 'despesa', 'Alimentação', 'Açougue'),
  lanc('2026-10-20', 40000, 'despesa', 'Alimentação', 'Mercado'),
  lanc('2026-09-10', 30000, 'despesa', 'Lazer', 'Show'),
];

describe('meses', () => {
  it('avança e volta atravessando o ano', () => {
    expect(deslocarMes('2026-12', 1)).toBe('2027-01');
    expect(deslocarMes('2026-01', -1)).toBe('2025-12');
    expect(deslocarMes('2026-10', -12)).toBe('2025-10');
  });

  it('escreve o nome do mês em português', () => {
    expect(nomeDoMes('2026-03')).toBe('Março de 2026');
  });
});

describe('resumir', () => {
  it('soma receitas, despesas e saldo', () => {
    expect(resumir(filtrar(dados, { mes: '2026-10' }))).toEqual({ receitas: 500000, despesas: 250000, saldo: 250000 });
  });
});

describe('filtrar', () => {
  it('filtra por mês, categoria e busca sem acento, do mais recente para o mais antigo', () => {
    expect(filtrar(dados, { mes: '2026-10', categoria: 'Alimentação' }).map((l) => l.descricao)).toEqual(['Mercado', 'Açougue']);
    expect(filtrar(dados, { busca: 'acougue' }).map((l) => l.descricao)).toEqual(['Açougue']);
  });
});

describe('despesasPorCategoria', () => {
  it('agrupa e calcula a porcentagem', () => {
    const fatias = despesasPorCategoria(filtrar(dados, { mes: '2026-10' }));
    expect(fatias.map((f) => [f.categoria, f.total, f.porcentagem])).toEqual([
      ['Moradia', 150000, 60],
      ['Alimentação', 100000, 40],
    ]);
  });
});

describe('historicoMensal', () => {
  it('inclui meses vazios', () => {
    const meses = historicoMensal(dados, '2026-10', 3);
    expect(meses.map((m) => [m.mes, m.despesas])).toEqual([
      ['2026-08', 0],
      ['2026-09', 30000],
      ['2026-10', 250000],
    ]);
  });
});

describe('situacaoOrcamentos', () => {
  it('classifica cada orçamento', () => {
    const doMes = filtrar(dados, { mes: '2026-10' });
    const situacao = situacaoOrcamentos(doMes, { Alimentação: 90000, Moradia: 180000, Lazer: 20000, Saúde: 0 });
    expect(situacao.map((s) => [s.categoria, s.estado])).toEqual([
      ['Alimentação', 'estourado'],
      ['Moradia', 'atencao'],
      ['Lazer', 'ok'],
    ]);
  });
});
