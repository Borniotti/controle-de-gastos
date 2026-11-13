import { type FormEvent, useState } from 'react';
import { lerReais } from '../lib/dinheiro';
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, type Lancamento, type TipoLancamento } from '../tipos';

interface Props {
  dataPadrao: string;
  onAdicionar: (lancamento: Omit<Lancamento, 'id'>) => void;
}

export function FormLancamento({ dataPadrao, onAdicionar }: Props) {
  const [tipo, setTipo] = useState<TipoLancamento>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_DESPESA[0]);
  const [data, setData] = useState(dataPadrao);
  const [erro, setErro] = useState('');

  const categorias = tipo === 'despesa' ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;

  function trocarTipo(novo: TipoLancamento) {
    setTipo(novo);
    setCategoria((novo === 'despesa' ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA)[0]);
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const centavos = lerReais(valor);
    if (!descricao.trim()) return setErro('Escreva uma descrição.');
    if (centavos === null) return setErro('Valor inválido. Exemplo: 1.234,56');
    if (!data) return setErro('Escolha uma data.');
    onAdicionar({ descricao: descricao.trim(), valor: centavos, tipo, categoria, data });
    setDescricao('');
    setValor('');
    setErro('');
  }

  return (
    <form className="cartao form-lancamento" onSubmit={enviar} aria-label="Novo lançamento">
      <h2>Novo lançamento</h2>
      <div className="alternador" role="radiogroup" aria-label="Tipo">
        {(['despesa', 'receita'] as const).map((t) => (
          // biome-ignore lint/a11y/useSemanticElements: botões estilizados como alternador; role radio + aria-checked mantêm a semântica
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={tipo === t}
            className={tipo === t ? `ativo ${t}` : ''}
            onClick={() => trocarTipo(t)}
          >
            {t === 'despesa' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>
      <label>
        Descrição
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={60}
          placeholder="Supermercado"
        />
      </label>
      <div className="lado-a-lado">
        <label>
          Valor (R$)
          <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="0,00" />
        </label>
        <label>
          Data
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </label>
      </div>
      <label>
        Categoria
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <p className="erro" role="alert">
        {erro}
      </p>
      <button type="submit" className="botao-principal">
        Adicionar
      </button>
    </form>
  );
}
