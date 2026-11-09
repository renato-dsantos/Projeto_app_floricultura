import React, { useState } from 'react';
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
import { login } from '../services/api';
import { avisar } from '../services/dialogo';

const ICONE_LOGO = require('../assets/icones/logo.png');

export default function Login({ navigation, route }) {
  const voltarAoFluxo = Boolean(route.params && route.params.voltar);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const entrar = async () => {
    if (!email.trim() || !senha) {
      setErro('Informe seu e-mail e senha.');
      return;
    }

    setCarregando(true);
    setErro(null);
    try {
      const usuario = await login(email.trim(), senha);
      // Quem decide se é administrador é o servidor (campo "role" da resposta).
      if (usuario.role === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'Admin' }] });
      } else if (voltarAoFluxo && navigation.canGoBack()) {
        navigation.goBack(); // volta para onde a pessoa estava (ex.: o carrinho, sem perder os itens)
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
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

          <Text style={styles.titulo}>Bem-vindo de volta</Text>
          <Text style={styles.subtitulo}>Entre para continuar comprando{'\n'}flores e presentes</Text>
          <Text style={styles.subtitulo}>Acesso administrador:{'\n'}Login: admin@admin.com{'\n'}Senha: admin123</Text>

          <View style={styles.formulario}>
            <Campo
              rotulo="E-mail"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Campo
              rotulo="Senha"
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={entrar}
            />

            <TouchableOpacity
              style={styles.esqueciBotao}
              onPress={() => avisar('Em breve', 'A recuperação de senha ainda será implementada.')}
            >
              <Text style={styles.esqueciTexto}>Esqueci minha senha</Text>
            </TouchableOpacity>

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <BotaoPrimario titulo="Entrar" onPress={entrar} carregando={carregando} />
            <BotaoSecundario
              titulo="Criar conta"
              onPress={() => navigation.navigate('Cadastro', { voltar: voltarAoFluxo })}
              disabled={carregando}
            />
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
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 90,
    marginBottom: 20,
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
    marginTop: 32,
  },
  esqueciBotao: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -2,
  },
  esqueciTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.DOURADO,
  },
  erro: {
    fontSize: 13,
    color: '#C0504D',
    textAlign: 'center',
    marginBottom: 12,
  },
});
