import { describe, expect, it } from 'vitest';
import { formatarReais, lerReais } from './dinheiro';

describe('lerReais', () => {
  it.each([
    ['12', 1200],
    ['12,5', 1250],
    ['12,50', 1250],
    ['1.234,56', 123456],
    ['R$ 1.234,56', 123456],
    ['12.50', 1250],
    ['1.234', 123400],
    ['0,01', 1],
  ])('entende "%s"', (texto, esperado) => {
    expect(lerReais(texto)).toBe(esperado);
  });

  it.each(['', 'abc', '0', '-5', '12,345', '1,234.56', '12..5', '1.23,45'])('recusa "%s"', (texto) => {
    expect(lerReais(texto)).toBeNull();
  });

  it('evita o erro clássico de ponto flutuante', () => {
    expect(lerReais('0,1')! + lerReais('0,2')!).toBe(lerReais('0,3'));
  });
});

describe('formatarReais', () => {
  it('formata centavos no padrão brasileiro', () => {
    expect(formatarReais(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56');
  });
});
