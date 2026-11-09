import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  Linking,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { BotaoPrimario, BotaoSecundario, cores } from '../components/AuthUI';
import {
  buscarPedido,
  criarPedido,
  imagemDoProduto,
  iniciarPagamento,
  usuarioLogado,
} from '../services/api';
import { formatarData, infoStatus, rotuloBotaoPagar } from '../services/statusPedido';

const ICONE_LOGO = require('../assets/icones/logo.png');

const dinheiro = (valor) => `R$${valor.toFixed(2).replace('.', ',')}`;

// Esta tela tem dois modos:
//  1) vindo do carrinho:   route.params.itens     → mostra o resumo e cria o pedido ao tocar em "Finalizar compra"
//  2) pedido já criado:    route.params.pedidoId  → mostra o pedido e leva ao pagamento (Mercado Pago)
export default function Checkout({ navigation, route }) {
  const itensCarrinho = route.params ? route.params.itens : undefined;
  const pedidoId = route.params ? route.params.pedidoId : undefined;
  const autoPagar = route.params ? route.params.autoPagar : false;
  const usuario = usuarioLogado();

  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(pedidoId));
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [abriuPagamento, setAbriuPagamento] = useState(false);
  const [, setAtualizar] = useState(0);

  const jaIniciou = useRef(false);
  const abriuRef = useRef(false);

  // Sem sessão → login
  useEffect(() => {
    if (!usuario) navigation.replace('Login');
  }, [usuario, navigation]);

  // Ao voltar do Perfil (endereço alterado), redesenha com os dados novos.
  useEffect(() => {
    const cancelar = navigation.addListener('focus', () => setAtualizar((n) => n + 1));
    return cancelar;
  }, [navigation]);

  const carregarPedido = useCallback(async () => {
    if (!pedidoId) return null;
    try {
      const dados = await buscarPedido(pedidoId);
      setPedido(dados);
      setErro(null);
      return dados;
    } catch (e) {
      setErro(e.message);
      return null;
    } finally {
      setCarregando(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    carregarPedido();
  }, [carregarPedido]);

  // Ao voltar do navegador (pagamento), confere o status automaticamente.
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && abriuRef.current) carregarPedido();
    });
    return () => assinatura.remove();
  }, [carregarPedido]);

  const pagar = async () => {
    if (!pedido) return;
    setProcessando(true);
    setErro(null);
    setAviso(null);
    try {
      const { checkoutUrl } = await iniciarPagamento(pedido.id);
      abriuRef.current = true;
      setAbriuPagamento(true);
      await Linking.openURL(checkoutUrl);
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(false);
    }
  };

  // Pedido recém-criado vindo do carrinho: abre o pagamento sozinho (uma única vez).
  useEffect(() => {
    if (autoPagar && pedido && pedido.podePagar && !jaIniciou.current) {
      jaIniciou.current = true;
      pagar();
    }
  }, [autoPagar, pedido]); // eslint-disable-line react-hooks/exhaustive-deps

  const verificar = async () => {
    setVerificando(true);
    setAviso(null);
    const atual = await carregarPedido();
    if (atual && atual.status !== 'pago') {
      setAviso('Ainda não identificamos o pagamento. Se você acabou de pagar, aguarde alguns instantes e tente de novo.');
    }
    setVerificando(false);
  };

  const finalizarCompra = async () => {
    setProcessando(true);
    setErro(null);
    try {
      const novo = await criarPedido(
        itensCarrinho.map((i) => ({
          produtoId: Number(String(i.id).split('-')[0]),
          quantidade: i.quantidade,
        }))
      );
      // Troca a pilha de telas: o carrinho sai (fica vazio) e o pedido criado segue para o pagamento.
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'Checkout', params: { pedidoId: novo.id, autoPagar: true } }],
      });
    } catch (e) {
      setErro(e.message);
      setProcessando(false);
    }
  };

  const voltar = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'));
  const irParaMeusPedidos = () => navigation.navigate('MeusPedidos');

  if (!usuario) return null;

  // ---------- dados exibidos ----------
  const linhas = pedido
    ? pedido.itens.map((i, idx) => ({
        chave: `${i.produtoId}-${idx}`,
        nome: i.nome,
        quantidade: i.quantidade,
        valor: i.subtotalFormatado,
        imagem: imagemDoProduto(i.imagem),
      }))
    : (itensCarrinho || []).map((i) => ({
        chave: String(i.id),
        nome: i.nome,
        quantidade: i.quantidade,
        valor: dinheiro(i.preco * i.quantidade),
        imagem: i.imagem,
      }));

  const total = pedido
    ? pedido.totalFormatado
    : dinheiro((itensCarrinho || []).reduce((soma, i) => soma + i.preco * i.quantidade, 0));

  const complemento = usuario.complemento ? ` - ${usuario.complemento}` : '';
  const enderecoTexto = pedido
    ? pedido.enderecoEntrega
    : `${usuario.endereco || ''}, ${usuario.numero || ''}${complemento}\n${usuario.bairro || ''} - ${usuario.cidade || ''}/${usuario.estado || ''}\nCEP ${usuario.cep || ''}`;

  const status = pedido ? infoStatus(pedido.status) : null;
  const semDados = !pedidoId && (!itensCarrinho || itensCarrinho.length === 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={voltar} activeOpacity={0.7} style={styles.voltarBotao}>
          <Text style={styles.voltarTexto}>‹ Voltar</Text>
        </TouchableOpacity>
        <Image source={ICONE_LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Finalizar pedido</Text>

        {carregando ? (
          <ActivityIndicator size="large" color={cores.DOURADO} style={styles.carregando} />
        ) : semDados ? (
          <Text style={styles.vazio}>Não há itens para finalizar.</Text>
        ) : pedidoId && !pedido ? (
          <View style={styles.erroBox}>
            <Text style={styles.erroTexto}>{erro || 'Não foi possível carregar o pedido.'}</Text>
            <BotaoSecundario titulo="Tentar novamente" onPress={carregarPedido} />
          </View>
        ) : (
          <>
            {pedido ? (
              <View style={styles.linhaPedido}>
                <View>
                  <Text style={styles.pedidoNumero}>Pedido #{pedido.id}</Text>
                  <Text style={styles.pedidoData}>{formatarData(pedido.criadoEm)}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: status.fundo }]}>
                  <Text style={[styles.chipTexto, { color: status.cor }]}>{status.rotulo}</Text>
                </View>
              </View>
            ) : null}

            {/* Resumo */}
            <Text style={styles.secao}>Resumo do pedido</Text>
            {linhas.map((linha) => (
              <View key={linha.chave} style={styles.item}>
                {linha.imagem ? <Image source={linha.imagem} style={styles.itemImagem} /> : <View style={styles.itemImagem} />}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome} numberOfLines={2}>{linha.nome}</Text>
                  <Text style={styles.itemQtd}>Quantidade: {linha.quantidade}</Text>
                </View>
                <Text style={styles.itemValor}>{linha.valor}</Text>
              </View>
            ))}

            {/* Entrega */}
            <View style={styles.secaoLinha}>
              <Text style={styles.secao}>Entrega</Text>
              {!pedido ? (
                <TouchableOpacity onPress={() => navigation.navigate('Perfil')} activeOpacity={0.7}>
                  <Text style={styles.link}>Alterar endereço</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.cartao}>
              <Text style={styles.enderecoTexto}>{enderecoTexto}</Text>
            </View>

            {/* Total */}
            <View style={styles.totalBox}>
              <Text style={styles.totalRotulo}>Total</Text>
              <Text style={styles.totalValor}>{total}</Text>
            </View>

            {erro ? <Text style={styles.erroGeral}>{erro}</Text> : null}
            {aviso ? <Text style={styles.avisoTexto}>{aviso}</Text> : null}

            {/* Ações */}
            {!pedido ? (
              <View style={styles.botoes}>
                <BotaoPrimario titulo="Finalizar compra" onPress={finalizarCompra} carregando={processando} />
                <BotaoSecundario titulo="Voltar ao carrinho" onPress={voltar} disabled={processando} />
                <Text style={styles.nota}>O pagamento é feito no ambiente seguro do Mercado Pago.</Text>
              </View>
            ) : pedido.status === 'pago' ? (
              <View style={styles.botoes}>
                <View style={styles.sucessoBox}>
                  <Text style={styles.sucessoTitulo}>Pagamento confirmado!</Text>
                  <Text style={styles.sucessoTexto}>Obrigado pela compra. Acompanhe o pedido em "Meus pedidos".</Text>
                </View>
                <BotaoPrimario titulo="Ver meus pedidos" onPress={irParaMeusPedidos} />
                <BotaoSecundario titulo="Voltar à loja" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} />
              </View>
            ) : pedido.podePagar ? (
              <View style={styles.botoes}>
                <BotaoPrimario
                  titulo={abriuPagamento ? 'Abrir pagamento novamente' : rotuloBotaoPagar(pedido.status)}
                  onPress={pagar}
                  carregando={processando}
                />
                {abriuPagamento ? (
                  <>
                    <Text style={styles.nota}>
                      Conclua o pagamento no navegador. Ao voltar para o app, o status é atualizado automaticamente.
                    </Text>
                    <BotaoSecundario
                      titulo={verificando ? 'Verificando...' : 'Já paguei — verificar pagamento'}
                      onPress={verificar}
                      disabled={verificando}
                    />
                  </>
                ) : null}
                <BotaoSecundario titulo="Ver meus pedidos" onPress={irParaMeusPedidos} />
              </View>
            ) : (
              <View style={styles.botoes}>
                <BotaoSecundario titulo="Ver meus pedidos" onPress={irParaMeusPedidos} />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
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
  vazio: {
    textAlign: 'center',
    color: cores.CINZA,
    marginTop: 30,
  },
  erroBox: {
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  erroTexto: {
    fontSize: 13,
    color: '#C0504D',
    textAlign: 'center',
  },
  linhaPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  secao: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.DOURADO,
    marginTop: 18,
    marginBottom: 10,
  },
  secaoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.DOURADO,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.BORDA,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 12,
  },
  itemImagem: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#F1EFEC',
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.TEXTO,
  },
  itemQtd: {
    fontSize: 12,
    color: cores.CINZA,
    marginTop: 2,
  },
  itemValor: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.TEXTO,
  },
  cartao: {
    borderWidth: 1,
    borderColor: cores.BORDA,
    borderRadius: 12,
    padding: 14,
  },
  enderecoTexto: {
    fontSize: 13,
    color: cores.TEXTO,
    lineHeight: 19,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F3EC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  totalRotulo: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.TEXTO,
  },
  totalValor: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.DOURADO,
  },
  erroGeral: {
    fontSize: 13,
    color: '#C0504D',
    textAlign: 'center',
    marginTop: 14,
  },
  avisoTexto: {
    fontSize: 13,
    color: '#9A6A12',
    textAlign: 'center',
    marginTop: 14,
  },
  botoes: {
    marginTop: 20,
  },
  nota: {
    fontSize: 12,
    color: cores.CINZA,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 17,
  },
  sucessoBox: {
    backgroundColor: '#E4F5EA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  sucessoTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F7D4F',
  },
  sucessoTexto: {
    fontSize: 13,
    color: '#2F7D4F',
    textAlign: 'center',
    marginTop: 4,
  },
});
