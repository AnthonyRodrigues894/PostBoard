// URL base da API — altere aqui se mudar de servidor
const BASE_URL = 'https://jsonplaceholder.typicode.com';
 
// ─── Função auxiliar interna ────────────────────────────────
// Centraliza a lógica de fetch + verificação de status
async function requisicao(endpoint, opcoes = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
    ...opcoes,
  });
 
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
 
  // DELETE retorna corpo vazio (204 No Content)
  if (response.status === 204) return null;
 
  return response.json();
}
 
// ─── POSTS ──────────────────────────────────────────────────
 
// Busca todos os posts (limitamos a 20 para não sobrecarregar a tela)
export async function getPosts() {
  return requisicao('/posts?_limit=20');
}
 
// ✅ Exercício 1 — Filtrar posts por usuário
export async function getPostsPorUsuario(userId) {
  return requisicao(`/posts?userId=${userId}`);
}
 
// ✅ Exercício 5 — Paginação manual
export async function getPostsPaginados(page = 1, limit = 10) {
  return requisicao(`/posts?_page=${page}&_limit=${limit}`);
}
 
// Busca um post pelo ID
export async function getPostPorId(id) {
  return requisicao(`/posts/${id}`);
}
 
// Cria um novo post
// A JSONPlaceholder simula a criação mas não persiste de verdade
export async function criarPost(dados) {
  return requisicao('/posts', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}
 
// Atualiza um post existente
export async function atualizarPost(id, dados) {
  return requisicao(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}
 
// Remove um post
export async function deletarPost(id) {
  return requisicao(`/posts/${id}`, {
    method: 'DELETE',
  });
}
 
// ─── USUÁRIOS ───────────────────────────────────────────────
 
// Busca todos os usuários
export async function getUsuarios() {
  return requisicao('/users');
}
 
// Busca um usuário pelo ID
export async function getUsuarioPorId(id) {
  return requisicao(`/users/${id}`);
}
 
// ─── COMENTÁRIOS (EXTRA - opcional, deixa mais profissional) ─
 
export async function getComentariosPorPost(postId) {
  return requisicao(`/posts/${postId}/comments`);
}