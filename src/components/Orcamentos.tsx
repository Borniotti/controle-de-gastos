import { type FormEvent, useState } from 'react';
import { formatarReais, lerReais } from '../lib/dinheiro';
import type { SituacaoOrcamento } from '../lib/financas';
import { CATEGORIAS_DESPESA, type Orcamentos as TipoOrcamentos } from '../tipos';

interface Props {
  situacao: SituacaoOrcamento[];
  orcamentos: TipoOrcamentos;
  onDefinir: (categoria: string, limite: number) => void;
}

const TEXTO_ESTADO = { ok: 'dentro do limite', atencao: 'perto do limite', estourado: 'acima do limite' };

export function Orcamentos({ situacao, orcamentos, onDefinir }: Props) {
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_DESPESA[1]);
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const limite = valor.trim() === '0' ? 0 : lerReais(valor);
    if (limite === null) return setErro('Valor inválido.');
    onDefinir(categoria, limite);
    setValor('');
    setErro('');
  }

  return (
    <section className="cartao" aria-labelledby="titulo-orcamentos">
      <h2 id="titulo-orcamentos">Orçamento do mês</h2>
      {situacao.length === 0 ? (
        <p className="vazio">Defina um limite de gastos para uma categoria.</p>
      ) : (
        <ul className="orcamentos">
          {situacao.map((s) => (
            <li key={s.categoria}>
              <div className="orcamento-topo">
                <strong>{s.categoria}</strong>
                <span className="numero">
                  {formatarReais(s.gasto)} de {formatarReais(s.limite)}
                </span>
              </div>
              <div
                className={`progresso ${s.estado}`}
                role="progressbar"
                aria-valuenow={Math.round(s.porcentagem)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${s.categoria}: ${TEXTO_ESTADO[s.estado]}`}
              >
                <span style={{ width: `${Math.min(100, s.porcentagem)}%` }} />
              </div>
              {s.estado === 'estourado' && (
                <small className="alerta">Passou {formatarReais(s.gasto - s.limite)} do limite</small>
              )}
            </li>
          ))}
        </ul>
      )}
      <form className="form-orcamento" onSubmit={enviar}>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria do orçamento">
          {CATEGORIAS_DESPESA.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          inputMode="decimal"
          placeholder={orcamentos[categoria] ? formatarReais(orcamentos[categoria]) : 'Limite (0 remove)'}
          aria-label="Limite mensal"
        />
        <button type="submit">Salvar</button>
      </form>
      <p className="erro" role="alert">
        {erro}
      </p>
    </section>
  );
}
