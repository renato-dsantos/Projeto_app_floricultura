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

export function imagemDoProduto(chave) {
  return IMAGENS[chave];
}

async function requisitar(caminho, opcoes) {
  const resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}

// listarProdutos({ categoria: 'flores' })  |  listarProdutos({ destaque: true })
export function listarProdutos({ categoria, destaque } = {}) {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (destaque) params.append('destaque', '1');
  const query = params.toString();
  return requisitar(`/produtos${query ? `?${query}` : ''}`);
}

// criarPedido([{ produtoId: 1, quantidade: 2 }])
export function criarPedido(itens) {
  return requisitar('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itens }),
  });
}
