import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('adiciona uma despesa e atualiza o resumo', async () => {
    const usuario = userEvent.setup();
    render(<App />);

    const form = screen.getByRole('form', { name: 'Novo lançamento' });
    await usuario.type(within(form).getByLabelText('Descrição'), 'Padaria');
    await usuario.type(within(form).getByLabelText('Valor (R$)'), '25,90');
    await usuario.click(within(form).getByRole('button', { name: 'Adicionar' }));

    const lista = screen.getByRole('list', { name: 'Lista de lançamentos' });
    expect(within(lista).getByText('Padaria')).toBeInTheDocument();
    const resumo = screen.getByLabelText('Resumo do mês');
    expect(within(resumo).getAllByText(/25,90/)).toHaveLength(2); // despesas e saldo
  });

  it('mostra erro claro para valor inválido', async () => {
    const usuario = userEvent.setup();
    render(<App />);
    await usuario.type(screen.getByLabelText('Descrição'), 'Teste');
    await usuario.type(screen.getByLabelText('Valor (R$)'), 'dez reais');
    await usuario.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText(/Valor inválido/)).toBeInTheDocument();
  });

  it('guarda os lançamentos no navegador', async () => {
    const usuario = userEvent.setup();
    const { unmount } = render(<App />);
    await usuario.click(screen.getByRole('button', { name: 'Ver exemplo' }));
    unmount();
    render(<App />);
    expect(screen.getAllByText('Aluguel').length).toBeGreaterThan(0);
  });
});
