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
  StyleSheet,
  StatusBar,
} from 'react-native';
import { BotaoPrimario, cores } from '../components/AuthUI';
import {
  sair,
  usuarioLogado,
  resumoAdmin,
  listarPedidosAdmin,
  listarClientesAdmin,
  exportarDadosAdmin,
  listarProdutos,
  excluirProdutoAdmin,
  imagemDoProduto,
} from '../services/api';
import { avisar, confirmar } from '../services/dialogo';
import { entregarJson } from '../services/exportar';

const ICONE_LOGO = require('../assets/icones/logo.png');

// O servidor devolve a data em UTC ("2026-11-05 14:30:00"); mostramos no horário do aparelho.
function formatarData(valor) {
  const data = new Date(String(valor).replace(' ', 'T') + 'Z');
  if (Number.isNaN(data.getTime())) return valor;
  const dois = (n) => String(n).padStart(2, '0');
  return `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${data.getFullYear()} ${dois(data.getHours())}:${dois(data.getMinutes())}`;
}

function Cartao({ titulo, valor }) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoValor}>{valor}</Text>
      <Text style={styles.cartaoTitulo}>{titulo}</Text>
    </View>
  );
}

export default function Admin({ navigation }) {
  const admin = usuarioLogado();
  const [resumo, setResumo] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [msgExport, setMsgExport] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [r, p, c, prods] = await Promise.all([
        resumoAdmin(),
        listarPedidosAdmin(),
        listarClientesAdmin(),
        listarProdutos(),
      ]);
      setResumo(r);
      setPedidos(p);
      setClientes(c);
      setProdutos(prods);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Ao voltar da tela de cadastro de produto, atualiza a lista.
  useEffect(() => navigation.addListener('focus', carregar), [navigation, carregar]);

  const excluirProduto = (produto) => {
    confirmar({
      titulo: 'Excluir produto',
      mensagem: `Excluir "${produto.nome}" da loja? Os pedidos já feitos continuam no histórico.`,
      textoConfirmar: 'Excluir',
      destrutivo: true,
      aoConfirmar: async () => {
        try {
          await excluirProdutoAdmin(produto.id);
          setProdutos((atual) => atual.filter((p) => p.id !== produto.id));
          setResumo((r) => (r ? { ...r, totalProdutos: Math.max(0, r.totalProdutos - 1) } : r));
        } catch (e) {
          avisar('Não foi possível excluir', e.message);
        }
      },
    });
  };

  const exportar = async () => {
    setExportando(true);
    setMsgExport(null);
    try {
      const dados = await exportarDadosAdmin();
      const hoje = new Date().toISOString().slice(0, 10);
      await entregarJson(dados, `floricultura-dados-${hoje}.json`);
      setMsgExport({
        ok: true,
        texto: `JSON gerado: ${dados.pedidos.length} pedidos, ${dados.itensPedidos.length} itens, ${dados.clientes.length} clientes.`,
      });
    } catch (e) {
      setMsgExport({ ok: false, texto: e.message });
    } finally {
      setExportando(false);
    }
  };

  const aoSair = () => {
    sair();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Image source={ICONE_LOGO} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={aoSair} activeOpacity={0.7} style={styles.sairBotao}>
          <Text style={styles.sairTexto}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
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
        <Text style={styles.titulo}>Painel administrativo</Text>
        <Text style={styles.subtitulo}>Olá, {admin ? admin.nome : 'administrador'}</Text>

        {carregando ? (
          <ActivityIndicator size="large" color={cores.DOURADO} style={styles.carregando} />
        ) : erro ? (
          <View style={styles.erroBox}>
            <Text style={styles.erroTexto}>{erro}</Text>
            <TouchableOpacity style={styles.tentarBotao} onPress={carregar} activeOpacity={0.8}>
              <Text style={styles.tentarTexto}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cartoes}>
              <Cartao titulo="Pedidos" valor={resumo.totalPedidos} />
              <Cartao titulo="Total vendido" valor={resumo.totalVendidoFormatado} />
              <Cartao titulo="Clientes" valor={resumo.totalClientes} />
              <Cartao titulo="Produtos" valor={resumo.totalProdutos} />
            </View>

            <View style={styles.secaoLinha}>
              <Text style={[styles.secao, styles.semMargemTopo]}>Produtos ({produtos.length})</Text>
              <TouchableOpacity
                style={styles.novoBotao}
                onPress={() => navigation.navigate('AdminProdutoNovo')}
                activeOpacity={0.85}
              >
                <Text style={styles.novoTexto}>+ Cadastrar</Text>
              </TouchableOpacity>
            </View>
            {produtos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum produto à venda.</Text>
            ) : (
              produtos.map((p) => (
                <View key={p.id} style={styles.linhaItem}>
                  <Image source={imagemDoProduto(p.imagem)} style={styles.produtoImagem} />
                  <View style={styles.flex}>
                    <Text style={styles.itemTitulo} numberOfLines={2}>{p.nome}</Text>
                    <Text style={styles.itemDetalhe}>
                      {p.categoria} · {p.precoFormatado}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.excluirBotao}
                    onPress={() => excluirProduto(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.excluirTexto}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <Text style={styles.secao}>Dados para análise</Text>
            <View style={styles.exportarBox}>
              <Text style={styles.exportarTexto}>
                Gera um arquivo JSON com pedidos, itens, produtos, clientes (anonimizados) e estatísticas, pronto
                para usar em um dashboard.
              </Text>
              <BotaoPrimario titulo="Gerar dados em JSON" onPress={exportar} carregando={exportando} />
              {msgExport ? (
                <Text style={[styles.exportarMsg, msgExport.ok ? styles.exportarOk : styles.exportarErro]}>
                  {msgExport.texto}
                </Text>
              ) : null}
            </View>

            <Text style={styles.secao}>Pedidos recentes</Text>
            {pedidos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum pedido até agora.</Text>
            ) : (
              pedidos.slice(0, 10).map((p) => (
                <View key={p.id} style={styles.linhaItem}>
                  <View style={styles.flex}>
                    <Text style={styles.itemTitulo}>Pedido #{p.id}</Text>
                    <Text style={styles.itemDetalhe}>
                      {formatarData(p.criadoEm)} · {p.qtdItens} {p.qtdItens === 1 ? 'item' : 'itens'} · {p.status}
                    </Text>
                  </View>
                  <Text style={styles.itemValor}>{p.totalFormatado}</Text>
                </View>
              ))
            )}

            <Text style={styles.secao}>Clientes</Text>
            {clientes.length === 0 ? (
              <Text style={styles.vazio}>Nenhum cliente cadastrado.</Text>
            ) : (
              clientes.map((c) => (
                <View key={c.id} style={styles.linhaItem}>
                  <View style={styles.flex}>
                    <Text style={styles.itemTitulo}>{c.nome}</Text>
                    <Text style={styles.itemDetalhe}>{c.email}</Text>
                  </View>
                  <Text style={styles.itemDetalhe}>
                    {c.cidade}/{c.estado}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  logo: {
    width: 56,
    height: 42,
  },
  sairBotao: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: cores.DOURADO,
    borderRadius: 10,
  },
  sairTexto: {
    color: cores.DOURADO,
    fontWeight: '700',
    fontSize: 13,
  },
  conteudo: {
    padding: 16,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: cores.TEXTO,
  },
  subtitulo: {
    fontSize: 13,
    color: cores.CINZA,
    marginTop: 4,
    marginBottom: 16,
  },
  carregando: {
    marginTop: 40,
  },
  erroBox: {
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  erroTexto: {
    fontSize: 13,
    color: '#C0504D',
    textAlign: 'center',
  },
  tentarBotao: {
    backgroundColor: cores.DOURADO,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tentarTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cartoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cartao: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cartaoValor: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.DOURADO,
  },
  cartaoTitulo: {
    fontSize: 12,
    color: cores.CINZA,
    marginTop: 4,
  },
  secao: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.TEXTO,
    marginTop: 24,
    marginBottom: 10,
  },
  secaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10,
  },
  semMargemTopo: {
    marginTop: 0,
    marginBottom: 0,
  },
  novoBotao: {
    backgroundColor: cores.DOURADO,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  novoTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  produtoImagem: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#F1EFEC',
  },
  excluirBotao: {
    borderWidth: 1,
    borderColor: '#C0504D',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  excluirTexto: {
    color: '#C0504D',
    fontWeight: '700',
    fontSize: 12,
  },
  exportarBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  exportarTexto: {
    fontSize: 12,
    color: cores.CINZA,
    lineHeight: 17,
    marginBottom: 12,
  },
  exportarMsg: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  exportarOk: {
    color: '#2F7D4F',
  },
  exportarErro: {
    color: '#C0504D',
  },
  vazio: {
    fontSize: 13,
    color: cores.CINZA,
  },
  linhaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 10,
  },
  itemTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.TEXTO,
  },
  itemDetalhe: {
    fontSize: 12,
    color: cores.CINZA,
    marginTop: 2,
  },
  itemValor: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.TEXTO,
  },
});
