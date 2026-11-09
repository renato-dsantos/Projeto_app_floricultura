import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { BotaoPrimario, cores } from '../components/AuthUI';
import { listarMeusPedidos, usuarioLogado } from '../services/api';
import { abrirPerfil } from '../services/perfil';
import { formatarData, infoStatus, rotuloBotaoPagar } from '../services/statusPedido';

const ICONE_LOGO = require('../assets/icones/logo.png');
const ICONE_TAB_HOME = require('../assets/icones/icone_home.png');
const ICONE_TAB_CARRINHO = require('../assets/icones/icone_carrinho.png');
const ICONE_TAB_PERFIL = require('../assets/icones/perfil.png');

const MAX_ITENS_NO_CARD = 3;

export default function MeusPedidos({ navigation }) {
  const usuario = usuarioLogado();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!usuario) navigation.replace('Login');
  }, [usuario, navigation]);

  const carregar = useCallback(async () => {
    try {
      setPedidos(await listarMeusPedidos());
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Recarrega ao abrir, ao voltar para esta tela e ao voltar do navegador (pagamento).
  useEffect(() => {
    carregar();
    const aoFocar = navigation.addListener('focus', carregar);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') carregar();
    });
    return () => {
      aoFocar();
      assinatura.remove();
    };
  }, [carregar, navigation]);

  if (!usuario) return null;

  const abrirPedido = (pedido, pagar) =>
    navigation.navigate('Checkout', { pedidoId: pedido.id, autoPagar: pagar });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Perfil'))}
          activeOpacity={0.7}
          style={styles.voltarBotao}
        >
          <Text style={styles.voltarTexto}>‹ Voltar</Text>
        </TouchableOpacity>
        <Image source={ICONE_LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregar();
            }}
            tintColor={cores.DOURADO}
          />
        }
      >
        <Text style={styles.titulo}>Meus pedidos</Text>

        {carregando ? (
          <ActivityIndicator size="large" color={cores.DOURADO} style={styles.carregando} />
        ) : erro ? (
          <View style={styles.estadoBox}>
            <Text style={styles.erroTexto}>{erro}</Text>
            <BotaoPrimario titulo="Tentar novamente" onPress={carregar} />
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.estadoBox}>
            <Text style={styles.vazioTitulo}>Você ainda não fez pedidos</Text>
            <Text style={styles.vazioTexto}>Quando comprar, seus pedidos aparecem aqui.</Text>
            <BotaoPrimario titulo="Ver produtos" onPress={() => navigation.navigate('Home')} />
          </View>
        ) : (
          pedidos.map((pedido) => {
            const status = infoStatus(pedido.status);
            const mostrados = pedido.itens.slice(0, MAX_ITENS_NO_CARD);
            const restantes = pedido.itens.length - mostrados.length;

            return (
              <TouchableOpacity
                key={pedido.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => abrirPedido(pedido, false)}
              >
                <View style={styles.cardTopo}>
                  <View>
                    <Text style={styles.pedidoNumero}>Pedido #{pedido.id}</Text>
                    <Text style={styles.pedidoData}>{formatarData(pedido.criadoEm)}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: status.fundo }]}>
                    <Text style={[styles.chipTexto, { color: status.cor }]}>{status.rotulo}</Text>
                  </View>
                </View>

                <View style={styles.itens}>
                  {mostrados.map((item, idx) => (
                    <Text key={`${item.produtoId}-${idx}`} style={styles.itemLinha} numberOfLines={1}>
                      {item.quantidade}× {item.nome}
                    </Text>
                  ))}
                  {restantes > 0 ? (
                    <Text style={styles.itemMais}>+ {restantes} {restantes === 1 ? 'item' : 'itens'}</Text>
                  ) : null}
                </View>

                <View style={styles.cardRodape}>
                  <Text style={styles.total}>{pedido.totalFormatado}</Text>
                  {pedido.podePagar ? (
                    <TouchableOpacity
                      style={styles.pagarBotao}
                      onPress={() => abrirPedido(pedido, true)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.pagarTexto}>{rotuloBotaoPagar(pedido.status)}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.verDetalhes}>Ver detalhes ›</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Tab bar inferior */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Image source={ICONE_TAB_HOME} style={styles.tabImagem} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Carrinho')}>
          <Image source={ICONE_TAB_CARRINHO} style={styles.tabImagem} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => abrirPerfil(navigation)}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDE8',
  },
  voltarBotao: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  voltarTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.DOURADO,
  },
  logo: {
    width: 56,
    height: 42,
  },
  conteudo: {
    padding: 16,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: cores.TEXTO,
    marginBottom: 14,
  },
  carregando: {
    marginTop: 40,
  },
  estadoBox: {
    marginTop: 24,
    gap: 10,
  },
  erroTexto: {
    fontSize: 13,
    color: '#C0504D',
    textAlign: 'center',
  },
  vazioTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.TEXTO,
    textAlign: 'center',
  },
  vazioTexto: {
    fontSize: 13,
    color: cores.CINZA,
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pedidoNumero: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.TEXTO,
  },
  pedidoData: {
    fontSize: 12,
    color: cores.CINZA,
    marginTop: 2,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  itens: {
    marginTop: 12,
    gap: 3,
  },
  itemLinha: {
    fontSize: 13,
    color: cores.TEXTO,
  },
  itemMais: {
    fontSize: 12,
    color: cores.CINZA,
  },
  cardRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EDE8',
  },
  total: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.TEXTO,
  },
  pagarBotao: {
    backgroundColor: cores.DOURADO,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  pagarTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  verDetalhes: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.DOURADO,
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
