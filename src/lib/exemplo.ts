import type { Lancamento } from '../tipos';
import { deslocarMes } from './financas';

const MODELO: Array<[dia: number, descricao: string, categoria: string, tipo: Lancamento['tipo'], reais: number]> = [
  [5, 'Salário', 'Salário', 'receita', 4800],
  [6, 'Aluguel', 'Moradia', 'despesa', 1450],
  [8, 'Supermercado', 'Alimentação', 'despesa', 612.4],
  [10, 'Conta de luz', 'Moradia', 'despesa', 187.9],
  [12, 'Projeto de site', 'Freelance', 'receita', 900],
  [14, 'Combustível', 'Transporte', 'despesa', 260],
  [16, 'Cinema', 'Lazer', 'despesa', 74],
  [18, 'Farmácia', 'Saúde', 'despesa', 96.35],
  [20, 'Curso online', 'Educação', 'despesa', 149.9],
  [22, 'Restaurante', 'Alimentação', 'despesa', 138.5],
  [25, 'Tênis', 'Compras', 'despesa', 329.99],
];

/** Seis meses de dados fictícios terminando no mês informado, com pequenas variações. */
export function gerarExemplo(mesAtual: string): Lancamento[] {
  const lancamentos: Lancamento[] = [];
  for (let m = 0; m < 6; m++) {
    const mes = deslocarMes(mesAtual, -m);
    MODELO.forEach(([dia, descricao, categoria, tipo, reais], i) => {
      if (tipo === 'receita' && descricao === 'Projeto de site' && m % 2 === 1) return;
      const variacao = tipo === 'despesa' && categoria !== 'Moradia' ? 1 + (((m * 7 + i * 3) % 9) - 4) / 20 : 1;
      lancamentos.push({
        id: `exemplo-${mes}-${i}`,
        descricao,
        categoria,
        tipo,
        valor: Math.round(reais * variacao * 100),
        data: `${mes}-${String(dia).padStart(2, '0')}`,
      });
    });
  }
  return lancamentos;
}

export const ORCAMENTOS_EXEMPLO = { Alimentação: 80000, Lazer: 15000, Transporte: 30000, Compras: 30000 };
