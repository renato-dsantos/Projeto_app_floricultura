import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

// Ajuste os caminhos abaixo para os arquivos que você já tem em assets/

const ICONE_LOGO = require('./assets/icones/logo.png');
const ICONE_TAB_HOME = require('./assets/icones/icone_home.png');
const ICONE_TAB_CARRINHO = require('./assets/icones/icone_carrinho.png');
const ICONE_TAB_PERFIL = require('./assets/icones/perfil.png');

const ICONE_LIXEIRA = require('./assets/icones/lixeira.png');
const IMAGEM_BANNER = require('./assets/banner.png');

const ITENS_INICIAIS = [
  {
    id: '1',
    nome: 'Buquê de rosas',
    preco: 80.0,
    quantidade: 1,
    imagem: require('./assets/produtos/produto1.png'),
  },
];

function formatarPreco(valor) {
  return `R$${valor.toFixed(2).replace('.', ',')}`;
}

function ItemCarrinho({ item, onAumentar, onDiminuir, onRemover }) {
  return (
    <View style={styles.itemCard}>
      <Image source={item.imagem} style={styles.itemImagem} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemPreco}>{formatarPreco(item.preco)}</Text>

        <View style={styles.itemControles}>
          <View style={styles.quantidadeBox}>
            <TouchableOpacity
              style={styles.quantidadeBotao}
              onPress={() => onDiminuir(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.quantidadeBotaoTexto}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantidadeValor}>{item.quantidade}</Text>
            <TouchableOpacity
              style={styles.quantidadeBotao}
              onPress={() => onAumentar(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.quantidadeBotaoTexto}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onRemover(item.id)} activeOpacity={0.7}>
            <Image source={ICONE_LIXEIRA} style={styles.lixeiraIcone} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CarrinhoScreen({ navigation }) {
  const [itens, setItens] = useState(ITENS_INICIAIS);

  const aumentarQuantidade = (id) => {
    setItens((atual) =>
      atual.map((item) => (item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item))
    );
  };

  const diminuirQuantidade = (id) => {
    setItens((atual) =>
      atual.map((item) =>
        item.id === id && item.quantidade > 1
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      )
    );
  };

  const removerItem = (id) => {
    setItens((atual) => atual.filter((item) => item.id !== id));
  };

  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  const finalizarPedido = () => {
    // navigation?.navigate('Checkout', { itens, total });
    console.log('Finalizar pedido:', itens, total);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={ICONE_LOGO} style={styles.logoImagem} resizeMode="contain" />
          <TouchableOpacity activeOpacity={0.7}>
            <Image source={ICONE_MENU} style={styles.menuImagem} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image source={IMAGEM_BANNER} style={styles.bannerImagem} />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTexto}>Flores que{'\n'}nunca saem de moda</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.tituloSecao}>Carrinho de compras</Text>

        {/* Lista de itens */}
        <View style={styles.listaItens}>
          {itens.length === 0 ? (
            <Text style={styles.carrinhoVazio}>Seu carrinho está vazio.</Text>
          ) : (
            itens.map((item) => (
              <ItemCarrinho
                key={item.id}
                item={item}
                onAumentar={aumentarQuantidade}
                onDiminuir={diminuirQuantidade}
                onRemover={removerItem}
              />
            ))
          )}
        </View>

        {/* Total */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total: </Text>
          <Text style={styles.totalValor}>{formatarPreco(total)}</Text>
        </View>

        {/* Botão finalizar */}
        <TouchableOpacity
          style={styles.botaoFinalizar}
          onPress={finalizarPedido}
          activeOpacity={0.8}
          disabled={itens.length === 0}
        >
          <Text style={styles.botaoFinalizarTexto}>Finalizar pedido</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tab bar inferior */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Image source={ICONE_TAB_HOME} style={styles.tabImagem} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Image source={ICONE_TAB_CARRINHO} style={styles.tabImagem} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Image source={ICONE_TAB_PERFIL} style={styles.tabImagem} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3F0',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  logoImagem: {
    width: 40,
    height: 40,
  },
  menuImagem: {
    width: 24,
    height: 24,
  },
  bannerContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 110,
    justifyContent: 'center',
  },
  bannerImagem: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  tituloSecao: {
    fontSize: 26,
    fontWeight: '400',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    color: '#222222',
  },
  listaItens: {
    paddingHorizontal: 16,
  },
  carrinhoVazio: {
    textAlign: 'center',
    color: '#888888',
    marginTop: 20,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImagem: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemPreco: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
  },
  itemControles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantidadeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantidadeBotao: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quantidadeBotaoTexto: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  quantidadeValor: {
    fontSize: 14,
    paddingHorizontal: 8,
    color: '#1A1A1A',
  },
  lixeiraIcone: {
    width: 20,
    height: 20,
    marginLeft: 16,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginTop: 30,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValor: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  botaoFinalizar: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  botaoFinalizarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  tabItem: {
    padding: 8,
  },
  tabImagem: {
    width: 24,
    height: 24,
  },
});