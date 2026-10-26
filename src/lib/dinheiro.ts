const FORMATO_REAL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarReais(centavos: number): string {
  return FORMATO_REAL.format(centavos / 100);
}

/**
 * Converte o que a pessoa digitou em centavos.
 * Aceita "12", "12,5", "1.234,56", "R$ 1.234,56" e também "12.50".
 * Devolve null quando o texto não é um valor válido.
 */
export function lerReais(texto: string): number | null {
  let limpo = texto.replace(/R\$|\s/g, '');
  if (!/^\d[\d.,]*$/.test(limpo)) return null;

  const temVirgula = limpo.includes(',');
  if (temVirgula) {
    // Formato brasileiro: ponto separa milhar, vírgula separa centavos.
    if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(limpo)) return null;
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  } else if (!/^\d+(\.\d{1,2})?$|^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    return null;
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    limpo = limpo.replace(/\./g, ''); // "1.234" = mil duzentos e trinta e quatro
  }

  const centavos = Math.round(Number(limpo) * 100);
  return Number.isSafeInteger(centavos) && centavos > 0 ? centavos : null;
}
