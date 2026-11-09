import { Platform } from 'react-native';

// Emulador Android acessa o PC por 10.0.2.2. No iOS Simulator, localhost funciona.
// Em celular físico (Expo Go), troque pelo IP do seu PC na rede, ex: 'http://192.168.0.15:3000'.
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_URL = `http://${HOST}:3000`;

// O banco guarda só a chave da imagem; o Metro exige require() com caminho fixo,
// por isso o mapeamento fica aqui.
const IMAGENS = {
  'flores/flor1.jpg': require('../assets/produtos/flores/flor1.jpg'),
  'flores/flor2.jpg': require('../assets/produtos/flores/flor2.jpg'),
  'flores/flor3.jpg': require('../assets/produtos/flores/flor3.jpg'),
  'chocolate/choco1.png': require('../assets/produtos/chocolate/choco1.png'),
  'chocolate/choco2.jpg': require('../assets/produtos/chocolate/choco2.jpg'),
  'chocolate/choco3.png': require('../assets/produtos/chocolate/choco3.png'),
  'cesta/cesta1.png': require('../assets/produtos/cesta/cesta1.png'),
  'cesta/cesta2.png': require('../assets/produtos/cesta/cesta2.png'),
  'cesta/cesta3.png': require('../assets/produtos/cesta/cesta3.png'),
  'cesta/cesta4.png': require('../assets/produtos/cesta/cesta4.png'),
};

// A imagem de um produto pode ser um arquivo do app (chave do mapa acima)
// ou uma URL da internet (produtos cadastrados pelo admin).
export function imagemDoProduto(chave) {
  if (typeof chave === 'string' && /^https?:\/\//i.test(chave)) return { uri: chave };
  return IMAGENS[chave];
}

// ---------- sessão (fica em memória enquanto o app estiver aberto) ----------
let tokenAtual = null;
let usuarioAtual = null;

export function usuarioLogado() {
  return usuarioAtual;
}

function iniciarSessao({ token, usuario }) {
  tokenAtual = token;
  usuarioAtual = usuario;
  return usuario;
}

export function sair() {
  tokenAtual = null;
  usuarioAtual = null;
}

// ---------- requisição base ----------
async function requisitar(caminho, opcoes = {}) {
  const headers = { ...(opcoes.headers || {}) };
  if (tokenAtual) headers.Authorization = `Bearer ${tokenAtual}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers });
  } catch (e) {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}

const enviarJson = (metodo, corpo) => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(corpo),
});

// ---------- produtos e pedidos ----------
// listarProdutos({ categoria: 'flores' })  |  listarProdutos({ destaque: true })
export function listarProdutos({ categoria, destaque } = {}) {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (destaque) params.append('destaque', '1');
  const query = params.toString();
  return requisitar(`/produtos${query ? `?${query}` : ''}`);
}

// criarPedido([{ produtoId: 1, quantidade: 2 }])  — exige login
export function criarPedido(itens) {
  return requisitar('/pedidos', enviarJson('POST', { itens }));
}

// Devolve { checkoutUrl, pedido }: abra o checkoutUrl no navegador para o cliente pagar.
export function iniciarPagamento(pedidoId) {
  return requisitar(`/pedidos/${pedidoId}/pagamento`, { method: 'POST' });
}

// O servidor confere o pagamento no Mercado Pago quando o pedido ainda está pendente.
export const buscarPedido = (pedidoId) => requisitar(`/pedidos/${pedidoId}`);
export const listarMeusPedidos = () => requisitar('/meus-pedidos');

// ---------- login e cadastro ----------
export async function login(email, senha) {
  return iniciarSessao(await requisitar('/auth/login', enviarJson('POST', { email, senha })));
}

export async function cadastrar(dados) {
  return iniciarSessao(await requisitar('/auth/cadastro', enviarJson('POST', dados)));
}

// Salva nome, telefone e endereço do usuário logado (e-mail e papel não mudam por aqui).
export async function atualizarPerfil(dados) {
  const usuario = await requisitar('/auth/me', enviarJson('PUT', dados));
  usuarioAtual = usuario;
  return usuario;
}

// ---------- CEP (ViaCEP) ----------
// Retorna { cep, endereco, bairro, cidade, estado }. Alguns CEPs (de cidades pequenas)
// vêm sem rua e/ou bairro — nesses casos os campos vazios devem ser liberados para digitar.
export async function buscarCep(cep) {
  const digitos = String(cep).replace(/\D/g, '');
  if (digitos.length !== 8) throw new Error('CEP inválido.');

  let resposta;
  try {
    resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  } catch (e) {
    throw new Error('Não foi possível consultar o CEP. Verifique sua conexão.');
  }
  if (!resposta.ok) throw new Error('Não foi possível consultar o CEP.');

  const d = await resposta.json();
  if (d.erro) throw new Error('CEP não encontrado.');

  return {
    cep: digitos,
    endereco: d.logradouro || '',
    bairro: d.bairro || '',
    cidade: d.localidade || '',
    estado: d.uf || '',
  };
}

// ---------- administração (exige login como admin) ----------
export const resumoAdmin = () => requisitar('/admin/resumo');
export const listarPedidosAdmin = () => requisitar('/admin/pedidos');
export const listarClientesAdmin = () => requisitar('/admin/usuarios');
// Todos os dados (tabelas + estatísticas) em JSON, com clientes anonimizados — para dashboards.
export const exportarDadosAdmin = () => requisitar('/admin/exportar');

// ---------- produtos (admin) ----------
export const listarCategorias = () => requisitar('/categorias');

// cadastrarProdutoAdmin({ nome, categoria: 'flores', preco: 99.9, imagem: 'https://...', destaque: true })
export const cadastrarProdutoAdmin = (dados) => requisitar('/admin/produtos', enviarJson('POST', dados));

// Exclusão lógica: o produto sai da loja, mas pedidos antigos continuam no histórico.
export const excluirProdutoAdmin = (id) => requisitar(`/admin/produtos/${id}`, { method: 'DELETE' });
