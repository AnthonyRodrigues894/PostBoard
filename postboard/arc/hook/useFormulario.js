import { useState, useCallback } from 'react';
 
// ── Regras de validação disponíveis ────────────────────────
// Cada regra é uma função que recebe o valor e retorna
// uma string de erro ou null se válido.
const REGRAS = {
  obrigatorio: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'Este campo é obrigatório.';
    }
    return null;
  },
 
  minimo: (min) => (valor) => {
    if (valor && valor.trim().length < min) {
      return `Mínimo de ${min} caracteres.`;
    }
    return null;
  },
 
  maximo: (max) => (valor) => {
    if (valor && valor.trim().length > max) {
      return `Máximo de ${max} caracteres.`;
    }
    return null;
  },
 
  semEspacoInicial: (valor) => {
    if (valor && valor !== valor.trimStart()) {
      return 'Não pode começar com espaço.';
    }
    return null;
  },

  semCaracteresEspeciais: (valor) =>
  !/[<>{}\[\]]/.test(valor) || 'Não use caracteres especiais (< > { } [ ])',
};
 
// ── Hook principal ──────────────────────────────────────────
// camposIniciais: objeto com { nomeCampo: valorInicial }
// regrasValidacao: objeto com { nomeCampo: [array de funções] }
//
// Exemplo de uso:
//   const form = useFormulario(
//     { titulo: '', corpo: '', autorId: null },
//     {
//       titulo: [REGRAS.obrigatorio, REGRAS.minimo(5), REGRAS.maximo(100)],
//       corpo:  [REGRAS.obrigatorio, REGRAS.minimo(10)],
//     }
//   );
export default function useFormulario(camposIniciais, regrasValidacao = {}) {
  const [valores, setValores]   = useState(camposIniciais);
  const [erros, setErros]       = useState({});
  // tocados: campos que o usuário já interagiu (para não
  // mostrar erro antes de o usuário digitar algo)
  const [tocados, setTocados]   = useState({});
  // ── Atualiza o valor de um campo específico ───────────
  const definir = useCallback((campo, valor) => {
    setValores(prev => ({ ...prev, [campo]: valor }));
    // Valida em tempo real após o campo ser tocado
    if (tocados[campo]) {
      validarCampo(campo, valor);
    }
  }, [tocados]);
 
  // ── Marca o campo como tocado (ao tirar o foco) ──────
  const tocar = useCallback((campo) => {
    setTocados(prev => ({ ...prev, [campo]: true }));
    validarCampo(campo, valores[campo]);
  }, [valores]);
 
  // ── Valida um campo contra suas regras ────────────────
  const validarCampo = useCallback((campo, valor) => {
    const regras = regrasValidacao[campo] || [];
    for (const regra of regras) {
      const erro = regra(valor);
      if (erro) {
        setErros(prev => ({ ...prev, [campo]: erro }));
        return false;
      }
    }
    // Sem erros — limpa o erro anterior desse campo
    setErros(prev => { const novo = { ...prev }; delete novo[campo]; return novo; });
    return true;
  }, [regrasValidacao]);
 
  // ── Valida TODOS os campos de uma vez (usado no submit) ─
  const validarTudo = useCallback(() => {
    // Marca todos os campos como tocados
    const todosTocados = Object.keys(camposIniciais).reduce(
      (acc, campo) => ({ ...acc, [campo]: true }), {}
    );
    setTocados(todosTocados);
 
    let formularioValido = true;
    for (const campo of Object.keys(regrasValidacao)) {
      const valido = validarCampo(campo, valores[campo]);
      if (!valido) formularioValido = false;
    }
    return formularioValido;
  }, [valores, regrasValidacao, camposIniciais]);
 
  // ── Reseta o formulário para os valores iniciais ──────
  const resetar = useCallback(() => {
    setValores(camposIniciais);
    setErros({});
    setTocados({});
  }, [camposIniciais]);
 
  // ── Preenche o formulário com dados existentes (edição) ─
  const preencher = useCallback((dados) => {
    setValores(prev => ({ ...prev, ...dados }));
    setErros({});
    setTocados({});
  }, []);
 
  const temErros = Object.keys(erros).length > 0;
 
  return {
    valores,
    erros,
    tocados,
    temErros,
    definir,
    tocar,
    validarTudo,
    resetar,
    preencher,
  };
}
 
// Exporta as regras para uso nas telas
export { REGRAS };
