import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import { FormLancamento } from './components/FormLancamento';
import { GraficoCategorias, GraficoMensal } from './components/Graficos';
import { Orcamentos } from './components/Orcamentos';
import { useArmazenamento } from './hooks/useArmazenamento';
import { deCsv, paraCsv } from './lib/csv';
import { formatarReais } from './lib/dinheiro';
import { gerarExemplo, ORCAMENTOS_EXEMPLO } from './lib/exemplo';
import {
  deslocarMes,
  despesasPorCategoria,
  filtrar,
  historicoMensal,
  mesDe,
  nomeDoMes,
  resumir,
  situacaoOrcamentos,
} from './lib/financas';
import type { Lancamento, Orcamentos as TipoOrcamentos } from './tipos';

function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [lancamentos, setLancamentos] = useArmazenamento<Lancamento[]>('gastos:lancamentos', []);
  const [orcamentos, setOrcamentos] = useArmazenamento<TipoOrcamentos>('gastos:orcamentos', {});
  const [mes, setMes] = useState(mesDe(hoje()));
  const [categoria, setCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState('');
  const arquivo = useRef<HTMLInputElement>(null);

  const doMes = useMemo(() => filtrar(lancamentos, { mes }), [lancamentos, mes]);
  const visiveis = useMemo(() => filtrar(doMes, { categoria, busca }), [doMes, categoria, busca]);
  const resumo = resumir(doMes);
  const categoriasUsadas = [...new Set(doMes.map((l) => l.categoria))].sort();

  function adicionar(novo: Omit<Lancamento, 'id'>) {
    setLancamentos((atual) => [...atual, { ...novo, id: crypto.randomUUID() }]);
    setMes(mesDe(novo.data));
  }

  function remover(id: string) {
    setLancamentos((atual) => atual.filter((l) => l.id !== id));
  }

  function definirOrcamento(cat: string, limite: number) {
    setOrcamentos((atual) => {
      const { [cat]: _removido, ...resto } = atual;
      return limite > 0 ? { ...resto, [cat]: limite } : resto;
    });
  }

  function carregarExemplo() {
    setLancamentos(gerarExemplo(mesDe(hoje())));
    setOrcamentos(ORCAMENTOS_EXEMPLO);
    setMes(mesDe(hoje()));
    setAviso('Dados de exemplo carregados.');
  }

  function exportar() {
    const blob = new Blob([`﻿${paraCsv(filtrar(lancamentos, {}))}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lancamentos-${hoje()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importar(evento: ChangeEvent<HTMLInputElement>) {
    const escolhido = evento.target.files?.[0];
    evento.target.value = '';
    if (!escolhido) return;
    const { lancamentos: novos, erros } = deCsv(await escolhido.text());
    setLancamentos((atual) => [...atual, ...novos]);
    setAviso(
      `${novos.length} lançamento(s) importado(s).` +
        (erros.length ? ` ${erros.length} linha(s) ignorada(s): ${erros.slice(0, 3).join(' ')}` : ''),
    );
  }

  return (
    <div className="app">
      <header className="topo">
        <div>
          <h1>Controle de Gastos</h1>
          <p>Suas finanças do mês num lugar só. Os dados ficam só no seu navegador.</p>
        </div>
        <div className="acoes-topo">
          <button type="button" onClick={carregarExemplo}>
            Ver exemplo
          </button>
          <button type="button" onClick={() => arquivo.current?.click()}>
            Importar CSV
          </button>
          <button type="button" onClick={exportar} disabled={lancamentos.length === 0}>
            Exportar CSV
          </button>
          <input ref={arquivo} type="file" accept=".csv,text/csv" hidden onChange={importar} />
        </div>
      </header>
      {aviso && (
        <p className="aviso" role="status">
          {aviso}{' '}
          <button type="button" className="botao-texto" onClick={() => setAviso('')} aria-label="Fechar aviso">
            ✕
          </button>
        </p>
      )}

      <nav className="seletor-mes" aria-label="Mês">
        <button type="button" onClick={() => setMes(deslocarMes(mes, -1))} aria-label="Mês anterior">
          ‹
        </button>
        <h2 aria-live="polite">{nomeDoMes(mes)}</h2>
        <button type="button" onClick={() => setMes(deslocarMes(mes, 1))} aria-label="Próximo mês">
          ›
        </button>
      </nav>

      <section className="resumo" aria-label="Resumo do mês">
        <div className="cartao indicador">
          <span>Receitas</span>
          <strong className="positivo">{formatarReais(resumo.receitas)}</strong>
        </div>
        <div className="cartao indicador">
          <span>Despesas</span>
          <strong className="negativo">{formatarReais(resumo.despesas)}</strong>
        </div>
        <div className="cartao indicador">
          <span>Saldo</span>
          <strong className={resumo.saldo >= 0 ? 'positivo' : 'negativo'}>{formatarReais(resumo.saldo)}</strong>
        </div>
      </section>

      <div className="grade">
        <FormLancamento dataPadrao={hoje()} onAdicionar={adicionar} />

        <section className="cartao" aria-labelledby="titulo-categorias">
          <h2 id="titulo-categorias">Para onde foi o dinheiro</h2>
          <GraficoCategorias fatias={despesasPorCategoria(doMes)} />
        </section>

        <section className="cartao" aria-labelledby="titulo-historico">
          <h2 id="titulo-historico">Últimos 6 meses</h2>
          <GraficoMensal meses={historicoMensal(lancamentos, mes)} />
        </section>

        <Orcamentos
          situacao={situacaoOrcamentos(doMes, orcamentos)}
          orcamentos={orcamentos}
          onDefinir={definirOrcamento}
        />

        <section className="cartao largo" aria-labelledby="titulo-lancamentos">
          <div className="lista-topo">
            <h2 id="titulo-lancamentos">Lançamentos</h2>
            <div className="filtros">
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar"
                aria-label="Buscar lançamento"
              />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                aria-label="Filtrar por categoria"
              >
                <option value="">Todas as categorias</option>
                {categoriasUsadas.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          {visiveis.length === 0 ? (
            <p className="vazio">
              {doMes.length === 0
                ? 'Nenhum lançamento neste mês. Adicione um ou clique em "Ver exemplo".'
                : 'Nada encontrado com esse filtro.'}
            </p>
          ) : (
            <ul className="lancamentos" aria-label="Lista de lançamentos">
              {visiveis.map((l) => (
                <li key={l.id}>
                  <time dateTime={l.data}>
                    {l.data.slice(8, 10)}/{l.data.slice(5, 7)}
                  </time>
                  <div className="lancamento-info">
                    <strong>{l.descricao}</strong>
                    <small>{l.categoria}</small>
                  </div>
                  <span className={`numero ${l.tipo === 'receita' ? 'positivo' : 'negativo'}`}>
                    {l.tipo === 'receita' ? '+' : '−'} {formatarReais(l.valor)}
                  </span>
                  <button
                    type="button"
                    className="botao-texto"
                    onClick={() => remover(l.id)}
                    aria-label={`Remover ${l.descricao}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="rodape">
        React + TypeScript · <a href="https://github.com/Borniotti/controle-de-gastos">código no GitHub</a>
      </footer>
    </div>
  );
}
