import React from 'react';
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

const ICONE_LOGO = require('./assets/icones/logo.png');
const ICONE_TAB_HOME = require('./assets/icones/icone_home.png');
const ICONE_TAB_CARRINHO = require('./assets/icones/icone_carrinho.png');
const ICONE_TAB_PERFIL = require('./assets/icones/perfil.png');

const CATEGORIAS = [
  { id: '1', icone: require('./assets/icones/icone_flor.png') },
  { id: '2', icone: require('./assets/icones/icone_chocolate.png') },
  { id: '3', icone: require('./assets/icones/icone_cestas.png') },
];

const PRODUTOS_DESTAQUE = [
  {
    id: '1',
    nome: 'Caixa Delicia de chocolates decorado',
    preco: 'R$80,90',
    imagem: require('./assets/produtos/chocolate/choco1.png'),
  },
  {
    id: '2',
    nome: 'Caixa Transparente com Chocolates',
    preco: 'R$70,90',
    imagem: require('./assets/produtos/chocolate/choco2.png'),
  },
  {
    id: '3',
    nome: 'Coração truda de colher chocolate branco',
    preco: 'R$50,90',
    imagem: require('./assets/produtos/chocolate/choco3.png'),
  },
  {
    id: '4',
    nome: 'Coração truda de colher chocolate',
    preco: 'R$99,90',
    imagem: require('./assets/produtos/chocolate/choco3.png'),
  },
];

function ProdutoCard({ produto, onComprar }) {
  return (
    <View style={styles.card}>
      <Image source={produto.imagem} style={styles.cardImagem} />
      <Text style={styles.cardNome} numberOfLines={2}>
        {produto.nome}
      </Text>
      <Text style={styles.cardPreco}>{produto.preco}</Text>
      <TouchableOpacity
        style={styles.botaoComprar}
        onPress={() => onComprar(produto)}
        activeOpacity={0.8}
      >
        <Text style={styles.botaoComprarTexto}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FloriculturaHomeScreen({ navigation }) {
  const handleComprar = (produto) => {
    // navigation?.navigate('DetalheProduto', { produto });
    console.log('Comprar:', produto.nome);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCirculo}>
            <Image source={ICONE_LOGO} style={styles.logoImagem} resizeMode="contain" />
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('./assets/banner.png')}
            style={styles.bannerImagem}
          />
        </View>

        {/* Categorias */}
        <View style={styles.categoriasRow}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoriaBotao} activeOpacity={0.7}>
              <Image source={cat.icone} style={styles.categoriaImagem} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Título */}
        <Text style={styles.tituloSecao}>Chocolates</Text>

        {/* Grid de produtos (2 colunas) */}
        <View style={styles.grid}>
          {PRODUTOS_DESTAQUE.map((produto) => (
            <ProdutoCard key={produto.id} produto={produto} onComprar={handleComprar} />
          ))}
        </View>
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

const CARD_LARGURA = '47%';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3F0',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
  alignItems: 'flex-start',   // era 'center' — isso que empurra o logo pro centro
  paddingVertical: 16,
  paddingHorizontal: 16,      // opcional, pra não colar na borda
},
logoCirculo: {
  width: 48,
  height: 48,
  borderRadius: 24,
  alignItems: 'center',       // mantém o ícone centralizado DENTRO do círculo
  justifyContent: 'center',
},
logoImagem: {
  width: 50,
  height: 50,
},
  bannerContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 130,
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
  categoriasRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  categoriaBotao: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    elevation: 1,
  },
  categoriaImagem: {
    width: 28,
    height: 28,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    color: '#333333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_LARGURA,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    marginBottom: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImagem: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  cardNome: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardPreco: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },
  botaoComprar: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  botaoComprarTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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