import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Campo, BotaoPrimario, BotaoSecundario, cores } from '../components/AuthUI';
import { buscarCep, cadastrar } from '../services/api';
import { avisar } from '../services/dialogo';

const ICONE_LOGO = require('../assets/icones/logo.png');

// ---------- máscaras ----------
const soDigitos = (v) => v.replace(/\D/g, '');

function mascaraTelefone(valor) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function mascaraCep(valor) {
  const d = soDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

const ENDERECO_VAZIO = { endereco: '', bairro: '', cidade: '', estado: '' };

export default function Cadastro({ navigation, route }) {
  const voltarAoFluxo = Boolean(route.params && route.params.voltar);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Endereço vindo do ViaCEP (campos bloqueados)
  const [local, setLocal] = useState(ENDERECO_VAZIO);
  const [cepCarregando, setCepCarregando] = useState(false);
  const [cepErro, setCepErro] = useState(null);
  // Alguns CEPs (cidades pequenas) vêm sem rua/bairro: nesse caso liberamos o campo para digitar.
  const [liberar, setLiberar] = useState({ endereco: false, bairro: false });

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const ultimoCepConsultado = useRef('');

  const limparEndereco = () => {
    setLocal(ENDERECO_VAZIO);
    setLiberar({ endereco: false, bairro: false });
  };

  const aoMudarCep = async (valor) => {
    const mascarado = mascaraCep(valor);
    const digitos = soDigitos(mascarado);
    setCep(mascarado);
    setCepErro(null);
    setErros((e) => ({ ...e, cep: undefined }));

    if (digitos.length < 8) {
      ultimoCepConsultado.current = '';
      limparEndereco();
      return;
    }

    ultimoCepConsultado.current = digitos;
    setCepCarregando(true);
    try {
      const dados = await buscarCep(digitos);
      if (ultimoCepConsultado.current !== digitos) return; // o usuário já mudou o CEP
      setLocal({
        endereco: dados.endereco,
        bairro: dados.bairro,
        cidade: dados.cidade,
        estado: dados.estado,
      });
      setLiberar({ endereco: !dados.endereco, bairro: !dados.bairro });
    } catch (e) {
      if (ultimoCepConsultado.current !== digitos) return;
      limparEndereco();
      setCepErro(e.message);
    } finally {
      if (ultimoCepConsultado.current === digitos) setCepCarregando(false);
    }
  };

  const validar = () => {
    const novos = {};
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const digitosTelefone = soDigitos(telefone);

    if (nome.trim().length < 3) novos.nome = 'Informe seu nome completo.';
    if (!emailValido) novos.email = 'Informe um e-mail válido.';
    if (![10, 11].includes(digitosTelefone.length)) novos.telefone = 'Informe o telefone com DDD.';
    if (soDigitos(cep).length !== 8 || !local.cidade) novos.cep = 'Informe um CEP válido.';
    if (liberar.endereco && !local.endereco.trim()) novos.endereco = 'Informe o endereço.';
    if (liberar.bairro && !local.bairro.trim()) novos.bairro = 'Informe o bairro.';
    if (!numero.trim()) novos.numero = 'Informe o número.';
    if (senha.length < 6) novos.senha = 'Mínimo de 6 caracteres.';
    if (confirmarSenha !== senha) novos.confirmarSenha = 'As senhas não conferem.';

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const criarConta = async () => {
    setErroGeral(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        telefone: soDigitos(telefone),
        cep: soDigitos(cep),
        endereco: local.endereco.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: local.bairro.trim(),
        cidade: local.cidade,
        estado: local.estado,
        senha,
      });
      if (voltarAoFluxo && navigation.canGoBack()) {
        navigation.pop(2); // fecha Cadastro e Login e volta para onde a pessoa estava (ex.: o carrinho)
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
      avisar('Conta criada!', 'Bem-vindo(a)! Você já está conectado(a).');
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image source={ICONE_LOGO} style={styles.logo} resizeMode="contain" />

          <Text style={styles.titulo}>Criar conta</Text>
          <Text style={styles.subtitulo}>Preencha seus dados para comprar{'\n'}flores e presentes</Text>

          <View style={styles.formulario}>
            <Campo
              rotulo="Nome completo"
              placeholder="Digite seu nome"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              erro={erros.nome}
            />
            <Campo
              rotulo="E-mail"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              erro={erros.email}
            />
            <Campo
              rotulo="Telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChangeText={(v) => setTelefone(mascaraTelefone(v))}
              keyboardType="phone-pad"
              erro={erros.telefone}
            />

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
                  keyboardType="default"
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
                <Campo
                  rotulo="Cidade"
                  placeholder="Preenchido pelo CEP"
                  value={local.cidade}
                  editable={false}
                />
              </View>
              <View style={styles.colunaEstado}>
                <Campo rotulo="Estado" placeholder="UF" value={local.estado} editable={false} />
              </View>
            </View>

            <Campo
              rotulo="Senha"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              erro={erros.senha}
            />
            <Campo
              rotulo="Confirmar senha"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              autoCapitalize="none"
              erro={erros.confirmarSenha}
            />

            {erroGeral ? <Text style={styles.erroGeral}>{erroGeral}</Text> : null}

            <View style={styles.botoes}>
              <BotaoPrimario titulo="Criar conta" onPress={criarConta} carregando={enviando} />
              <BotaoSecundario
                titulo="Já tenho conta"
                onPress={() => navigation.navigate('Login')}
                disabled={enviando}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 75,
    marginBottom: 14,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: cores.TEXTO,
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 13,
    color: cores.CINZA,
    textAlign: 'center',
    lineHeight: 18,
  },
  formulario: {
    width: '100%',
    marginTop: 24,
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
    marginTop: 8,
  },
});
