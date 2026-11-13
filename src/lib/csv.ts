import type { Lancamento } from '../tipos';

const COLUNAS = ['data', 'descricao', 'categoria', 'tipo', 'valor'] as const;

function escapar(campo: string): string {
  return /[;"\n\r]/.test(campo) ? `"${campo.replace(/"/g, '""')}"` : campo;
}

/** CSV com ponto e vírgula e vírgula decimal: abre direto no Excel em português. */
export function paraCsv(lancamentos: Lancamento[]): string {
  const linhas = lancamentos.map((l) =>
    [l.data, l.descricao, l.categoria, l.tipo, (l.valor / 100).toFixed(2).replace('.', ',')].map(escapar).join(';'),
  );
  return [COLUNAS.join(';'), ...linhas].join('\r\n');
}

/** Divide o texto em linhas e campos, respeitando aspas (inclusive quebras de linha dentro delas). */
function lerCampos(texto: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = '';
  let entreAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreAspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreAspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreAspas = true;
    } else if (c === ';') {
      linha.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  if (campo || linha.length) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((c) => c.trim()));
}

export interface ResultadoImportacao {
  lancamentos: Lancamento[];
  erros: string[];
}

export function deCsv(texto: string, gerarId: () => string = () => crypto.randomUUID()): ResultadoImportacao {
  const [cabecalho, ...linhas] = lerCampos(texto.replace(/^﻿/, ''));
  if (!cabecalho || COLUNAS.some((c, i) => cabecalho[i]?.trim().toLowerCase() !== c)) {
    return { lancamentos: [], erros: [`O cabeçalho precisa ser: ${COLUNAS.join(';')}`] };
  }

  const lancamentos: Lancamento[] = [];
  const erros: string[] = [];
  linhas.forEach((campos, i) => {
    const numero = i + 2;
    const [data = '', descricao = '', categoria = '', tipo = '', valorTexto = ''] = campos.map((c) => c.trim());
    const valor = Math.round(Number(valorTexto.replace(/\./g, '').replace(',', '.')) * 100);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) erros.push(`Linha ${numero}: data inválida "${data}".`);
    else if (!descricao) erros.push(`Linha ${numero}: falta a descrição.`);
    else if (tipo !== 'receita' && tipo !== 'despesa') erros.push(`Linha ${numero}: tipo deve ser receita ou despesa.`);
    else if (!Number.isSafeInteger(valor) || valor <= 0) erros.push(`Linha ${numero}: valor inválido "${valorTexto}".`);
    else lancamentos.push({ id: gerarId(), data, descricao, categoria: categoria || 'Outros', tipo, valor });
  });

  return { lancamentos, erros };
}
