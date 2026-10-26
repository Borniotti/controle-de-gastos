import { describe, expect, it } from 'vitest';
import type { Lancamento } from '../tipos';
import { deCsv, paraCsv } from './csv';

const originais: Lancamento[] = [
  { id: '1', data: '2026-10-01', descricao: 'Mercado; feira', categoria: 'Alimentação', tipo: 'despesa', valor: 123456 },
  { id: '2', data: '2026-10-05', descricao: 'Bônus "anual"', categoria: 'Salário', tipo: 'receita', valor: 50 },
];

describe('CSV', () => {
  it('ida e volta preserva os dados, inclusive ; e aspas', () => {
    let n = 0;
    const { lancamentos, erros } = deCsv(paraCsv(originais), () => String(++n));
    expect(erros).toEqual([]);
    expect(lancamentos).toEqual(originais);
  });

  it('usa vírgula decimal para abrir certo no Excel', () => {
    expect(paraCsv(originais)).toContain(';1234,56');
  });

  it('aponta as linhas com problema e importa as boas', () => {
    const texto = [
      'data;descricao;categoria;tipo;valor',
      '2026-10-01;Ok;Lazer;despesa;10,00',
      '01/10/2026;Data ruim;Lazer;despesa;10,00',
      '2026-10-02;Tipo ruim;Lazer;gasto;10,00',
      '2026-10-03;Valor ruim;Lazer;despesa;abc',
    ].join('\n');
    const { lancamentos, erros } = deCsv(texto);
    expect(lancamentos).toHaveLength(1);
    expect(erros).toHaveLength(3);
    expect(erros[0]).toMatch(/Linha 3/);
  });

  it('recusa arquivo sem o cabeçalho esperado', () => {
    expect(deCsv('a;b;c\n1;2;3').erros[0]).toMatch(/cabeçalho/);
  });
});
