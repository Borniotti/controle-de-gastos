import { useEffect, useState } from 'react';

/** Como useState, mas guarda o valor no navegador para sobreviver a recarregar a página. */
export function useArmazenamento<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const salvo = localStorage.getItem(chave);
      return salvo ? (JSON.parse(salvo) as T) : inicial;
    } catch {
      return inicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // Navegação anônima ou armazenamento cheio: o app continua funcionando sem salvar.
    }
  }, [chave, valor]);

  return [valor, setValor] as const;
}
