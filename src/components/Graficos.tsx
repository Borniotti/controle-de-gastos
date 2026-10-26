import type { FatiaCategoria, MesHistorico } from '../lib/financas';
import { formatarReais } from '../lib/dinheiro';

export const CORES = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#64748b'];

/** Gráfico de rosca em SVG puro, sem bibliotecas. */
export function GraficoCategorias({ fatias }: { fatias: FatiaCategoria[] }) {
  if (fatias.length === 0) return <p className="vazio">Sem despesas neste mês.</p>;

  const raio = 60;
  const circunferencia = 2 * Math.PI * raio;
  let acumulado = 0;
  const total = fatias.reduce((s, f) => s + f.total, 0);

  return (
    <div className="grafico-categorias">
      <svg viewBox="0 0 160 160" role="img" aria-label="Despesas por categoria">
        <g transform="rotate(-90 80 80)">
          {fatias.map((f, i) => {
            const tamanho = (f.porcentagem / 100) * circunferencia;
            const circulo = (
              <circle
                key={f.categoria}
                cx="80"
                cy="80"
                r={raio}
                fill="none"
                stroke={CORES[i % CORES.length]}
                strokeWidth="24"
                strokeDasharray={`${tamanho} ${circunferencia - tamanho}`}
                strokeDashoffset={-acumulado}
              >
                <title>{`${f.categoria}: ${formatarReais(f.total)}`}</title>
              </circle>
            );
            acumulado += tamanho;
            return circulo;
          })}
        </g>
        <text x="80" y="76" textAnchor="middle" className="grafico-rotulo">
          Total
        </text>
        <text x="80" y="94" textAnchor="middle" className="grafico-valor">
          {formatarReais(total).replace(/,\d{2}$/, '')}
        </text>
      </svg>
      <ul className="legenda">
        {fatias.map((f, i) => (
          <li key={f.categoria}>
            <span className="bolinha" style={{ background: CORES[i % CORES.length] }} />
            <span>{f.categoria}</span>
            <span className="numero">{f.porcentagem.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GraficoMensal({ meses }: { meses: MesHistorico[] }) {
  const maior = Math.max(1, ...meses.flatMap((m) => [m.receitas, m.despesas]));
  const largura = 320;
  const altura = 160;
  const grupo = largura / meses.length;
  const barra = grupo * 0.32;

  return (
    <figure className="grafico-mensal">
      <svg viewBox={`0 0 ${largura} ${altura + 22}`} role="img" aria-label="Receitas e despesas dos últimos meses">
        {meses.map((m, i) => {
          const x = i * grupo + grupo / 2;
          const hR = (m.receitas / maior) * altura;
          const hD = (m.despesas / maior) * altura;
          const rotulo = new Date(`${m.mes}-15`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
          return (
            <g key={m.mes}>
              <rect x={x - barra - 1} y={altura - hR} width={barra} height={hR} rx="3" className="barra-receita">
                <title>{`Receitas: ${formatarReais(m.receitas)}`}</title>
              </rect>
              <rect x={x + 1} y={altura - hD} width={barra} height={hD} rx="3" className="barra-despesa">
                <title>{`Despesas: ${formatarReais(m.despesas)}`}</title>
              </rect>
              <text x={x} y={altura + 16} textAnchor="middle" className="grafico-eixo">
                {rotulo}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="legenda legenda-linha">
        <span>
          <span className="bolinha barra-receita" /> Receitas
        </span>
        <span>
          <span className="bolinha barra-despesa" /> Despesas
        </span>
      </figcaption>
    </figure>
  );
}
