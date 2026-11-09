import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Campo, BotaoPrimario, BotaoSecundario, cores } from '../components/AuthUI';
import { atualizarPerfil, buscarCep, sair, usuarioLogado } from '../services/api';
import { abrirPerfil } from '../services/perfil';
import { avisar, confirmar } from '../services/dialogo';
import { mascaraCep, mascaraTelefone, soDigitos } from '../services/mascaras';

const ICONE_LOGO = require('../assets/icones/logo.png');
const ICONE_TAB_HOME = require('../assets/icones/icone_home.png');
const ICONE_TAB_CARRINHO = require('../assets/icones/icone_carrinho.png');
const ICONE_TAB_PERFIL = require('../assets/icones/perfil.png');

const ENDERECO_VAZIO = { endereco: '', bairro: '', cidade: '', estado: '' };

function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export default function Perfil({ navigation }) {
  const usuario = usuarioLogado();

  // Sem sessão (ex.: o app foi recarregado) → volta para o login.
  useEffect(() => {
    if (!usuario) navigation.replace('Login');
  }, [usuario, navigation]);

  const [nome, setNome] = useState(usuario ? usuario.nome : '');
  const [telefone, setTelefone] = useState(usuario ? mascaraTelefone(usuario.telefone) : '');
  const [cep, setCep] = useState(usuario ? mascaraCep(usuario.cep) : '');
  const [numero, setNumero] = useState(usuario ? usuario.numero || '' : '');
  const [complemento, setComplemento] = useState(usuario ? usuario.complemento || '' : '');
  const [local, setLocal] = useState(
    usuario
      ? {
          endereco: usuario.endereco || '',
          bairro: usuario.bairro || '',
          cidade: usuario.cidade || '',
          estado: usuario.estado || '',
        }
      : ENDERECO_VAZIO
  );
  const [liberar, setLiberar] = useState({ endereco: false, bairro: false });
  const [cepCarregando, setCepCarregando] = useState(false);
  const [cepErro, setCepErro] = useState(null);

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const ultimoCepConsultado = useRef(usuario ? soDigitos(usuario.cep) : '');

  if (!usuario) return null;

  const aoMudarCep = async (valor) => {
    const mascarado = mascaraCep(valor);
    const digitos = soDigitos(mascarado);
    setCep(mascarado);
    setCepErro(null);
    setErros((e) => ({ ...e, cep: undefined }));

    if (digitos.length < 8) {
      ultimoCepConsultado.current = '';
      setLocal(ENDERECO_VAZIO);
      setLiberar({ endereco: false, bairro: false });
      return;
    }

    ultimoCepConsultado.current = digitos;
    setCepCarregando(true);
    try {
      const dados = await buscarCep(digitos);
      if (ultimoCepConsultado.current !== digitos) return;
      setLocal({
        endereco: dados.endereco,
        bairro: dados.bairro,
        cidade: dados.cidade,
        estado: dados.estado,
      });
      setLiberar({ endereco: !dados.endereco, bairro: !dados.bairro });
    } catch (e) {
      if (ultimoCepConsultado.current !== digitos) return;
      setLocal(ENDERECO_VAZIO);
      setLiberar({ endereco: false, bairro: false });
      setCepErro(e.message);
    } finally {
      if (ultimoCepConsultado.current === digitos) setCepCarregando(false);
    }
  };

  const validar = () => {
    const novos = {};
    if (nome.trim().length < 3) novos.nome = 'Informe seu nome completo.';
    if (![10, 11].includes(soDigitos(telefone).length)) novos.telefone = 'Informe o telefone com DDD.';
    if (soDigitos(cep).length !== 8 || !local.cidade) novos.cep = 'Informe um CEP válido.';
    if (!local.endereco.trim()) novos.endereco = 'Informe o endereço.';
    if (!local.bairro.trim()) novos.bairro = 'Informe o bairro.';
    if (!numero.trim()) novos.numero = 'Informe o número.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const salvar = async () => {
    setErroGeral(null);
    if (!validar()) return;

    setSalvando(true);
    try {
      await atualizarPerfil({
        nome: nome.trim(),
        telefone: soDigitos(telefone),
        cep: soDigitos(cep),
        endereco: local.endereco.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: local.bairro.trim(),
        cidade: local.cidade,
        estado: local.estado,
      });
      avisar('Pronto!', 'Seus dados foram atualizados.');
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const aoSair = () => {
    confirmar({
      titulo: 'Sair da conta',
      mensagem: 'Deseja realmente sair?',
      textoConfirmar: 'Sair',
      destrutivo: true,
      aoConfirmar: () => {
        sair();
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Image source={ICONE_LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho do perfil */}
          <View style={styles.perfilTopo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{iniciais(usuario.nome)}</Text>
            </View>
            <Text style={styles.nomeTopo}>{usuario.nome}</Text>
            <Text style={styles.emailTopo}>{usuario.email}</Text>
          </View>

          {/* Atalho */}
          <TouchableOpacity
            style={styles.botaoPedidos}
            onPress={() => navigation.navigate('MeusPedidos')}
            activeOpacity={0.85}
          >
            <Text style={styles.botaoPedidosTexto}>Meus pedidos</Text>
            <Text style={styles.botaoPedidosSeta}>›</Text>
          </TouchableOpacity>

          {/* Dados pessoais */}
          <Text style={styles.secao}>Dados pessoais</Text>
          <Campo
            rotulo="Nome completo"
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            erro={erros.nome}
          />
          <Campo rotulo="E-mail" value={usuario.email} editable={false} />
          <Campo
            rotulo="Telefone"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChangeText={(v) => setTelefone(mascaraTelefone(v))}
            keyboardType="phone-pad"
            erro={erros.telefone}
          />

          {/* Endereço */}
          <Text style={styles.secao}>Endereço de entrega</Text>
          <Campo
            rotulo="CEP"
            placeholder="00000-000"
            value={cep}
            onChangeText={aoMudarCep}
            keyboardType="number-pad"
            maxLength={9}
            carregando={cepCarregando}
            erro={cepErro || erros.cep}
          />
          <Campo
            rotulo="Endereço"
            placeholder="Preenchido pelo CEP"
            value={local.endereco}
            onChangeText={(v) => setLocal((l) => ({ ...l, endereco: v }))}
            editable={liberar.endereco}
            erro={erros.endereco}
          />

          <View style={styles.linha}>
            <View style={styles.colunaNumero}>
              <Campo
                rotulo="Número"
                placeholder="Nº"
                value={numero}
                onChangeText={setNumero}
                erro={erros.numero}
              />
            </View>
            <View style={styles.colunaComplemento}>
              <Campo
                rotulo="Complemento"
                placeholder="Apto, bloco (opcional)"
                value={complemento}
                onChangeText={setComplemento}
              />
            </View>
          </View>

          <Campo
            rotulo="Bairro"
            placeholder="Preenchido pelo CEP"
            value={local.bairro}
            onChangeText={(v) => setLocal((l) => ({ ...l, bairro: v }))}
            editable={liberar.bairro}
            erro={erros.bairro}
          />

          <View style={styles.linha}>
            <View style={styles.colunaCidade}>
              <Campo rotulo="Cidade" value={local.cidade} editable={false} />
            </View>
            <View style={styles.colunaEstado}>
              <Campo rotulo="Estado" value={local.estado} editable={false} />
            </View>
          </View>

          {erroGeral ? <Text style={styles.erroGeral}>{erroGeral}</Text> : null}

          <View style={styles.botoes}>
            <BotaoPrimario titulo="Salvar alterações" onPress={salvar} carregando={salvando} />
            <BotaoSecundario titulo="Sair da conta" onPress={aoSair} disabled={salvando} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDE8',
  },
  logo: {
    width: 56,
    height: 42,
  },
  conteudo: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  perfilTopo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: cores.DOURADO,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  nomeTopo: {
    fontSize: 19,
    fontWeight: '800',
    color: cores.TEXTO,
  },
  emailTopo: {
    fontSize: 13,
    color: cores.CINZA,
    marginTop: 2,
  },
  botaoPedidos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: cores.DOURADO,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  botaoPedidosTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.DOURADO,
  },
  botaoPedidosSeta: {
    fontSize: 22,
    color: cores.DOURADO,
    marginTop: -2,
  },
  secao: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.DOURADO,
    marginTop: 20,
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  colunaNumero: {
    flex: 1,
  },
  colunaComplemento: {
    flex: 2,
  },
  colunaCidade: {
    flex: 3,
  },
  colunaEstado: {
    flex: 1,
  },
  erroGeral: {
    fontSize: 13,
    color: '#C0504D',
    textAlign: 'center',
    marginBottom: 12,
  },
  botoes: {
    marginTop: 12,
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
