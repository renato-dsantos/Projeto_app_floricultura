import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Image,
  Switch,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Campo, BotaoPrimario, BotaoSecundario, cores } from '../components/AuthUI';
import { cadastrarProdutoAdmin, listarCategorias, usuarioLogado } from '../services/api';
import { avisar } from '../services/dialogo';

const ICONE_LOGO = require('../assets/icones/logo.png');

const URL_VALIDA = /^https?:\/\/\S+$/i;

export default function AdminProdutoNovo({ navigation }) {
  const usuario = usuarioLogado();
  const ehAdmin = Boolean(usuario) && usuario.role === 'admin';

  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [destaque, setDestaque] = useState(false);
  const [imagemComErro, setImagemComErro] = useState(false);

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Só administrador entra aqui (o servidor também confere).
  useEffect(() => {
    if (!ehAdmin) navigation.replace('Home');
  }, [ehAdmin, navigation]);

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => setErroGeral('Não foi possível carregar as categorias.'));
  }, []);

  if (!ehAdmin) return null;

  const urlLimpa = imagem.trim();
  const urlParecidaComLink = URL_VALIDA.test(urlLimpa);

  const mudarImagem = (valor) => {
    setImagem(valor);
    setImagemComErro(false);
    setErros((e) => ({ ...e, imagem: undefined }));
  };

  const usarImagemDeExemplo = () => mudarImagem(`https://picsum.photos/seed/${Date.now()}/300/300`);

  const validar = () => {
    const novos = {};
    const valorPreco = Number(preco.replace(',', '.'));

    if (nome.trim().length < 3) novos.nome = 'Informe o nome do produto (mínimo 3 letras).';
    if (!categoria) novos.categoria = 'Escolha uma categoria.';
    if (!Number.isFinite(valorPreco) || valorPreco <= 0) novos.preco = 'Informe um preço maior que zero.';
    if (!urlParecidaComLink) novos.imagem = 'Informe uma URL começando com http:// ou https://';

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const cadastrar = async () => {
    setErroGeral(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      const produto = await cadastrarProdutoAdmin({
        nome: nome.trim(),
        categoria,
        preco: Number(preco.replace(',', '.')),
        imagem: urlLimpa,
        destaque,
      });
      navigation.goBack(); // a tela Admin recarrega a lista ao voltar
      avisar('Produto cadastrado', `"${produto.nome}" já está à venda.`);
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.voltarBotao}>
          <Text style={styles.voltarTexto}>‹ Voltar</Text>
        </TouchableOpacity>
        <Image source={ICONE_LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>Cadastrar produto</Text>

          <Campo
            rotulo="Nome do produto"
            placeholder="Ex.: Orquídea branca"
            value={nome}
            onChangeText={(v) => {
              setNome(v);
              setErros((e) => ({ ...e, nome: undefined }));
            }}
            autoCapitalize="sentences"
            erro={erros.nome}
          />

          {/* Categoria */}
          <Text style={styles.rotulo}>Categoria</Text>
          <View style={styles.chips}>
            {categorias.map((c) => {
              const selecionada = categoria === c.slug;
              return (
                <TouchableOpacity
                  key={c.slug}
                  style={[styles.chip, selecionada && styles.chipSelecionado]}
                  onPress={() => {
                    setCategoria(c.slug);
                    setErros((e) => ({ ...e, categoria: undefined }));
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipTexto, selecionada && styles.chipTextoSelecionado]}>{c.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {erros.categoria ? <Text style={styles.erroTexto}>{erros.categoria}</Text> : null}

          <View style={styles.espaco} />

          <Campo
            rotulo="Preço (R$)"
            placeholder="0,00"
            value={preco}
            onChangeText={(v) => {
              setPreco(v);
              setErros((e) => ({ ...e, preco: undefined }));
            }}
            keyboardType="decimal-pad"
            erro={erros.preco}
          />

          <Campo
            rotulo="URL da imagem"
            placeholder="https://exemplo.com/foto.jpg"
            value={imagem}
            onChangeText={mudarImagem}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            erro={erros.imagem}
          />
          <TouchableOpacity onPress={usarImagemDeExemplo} activeOpacity={0.7} style={styles.exemploBotao}>
            <Text style={styles.exemploTexto}>Usar imagem de exemplo (teste)</Text>
          </TouchableOpacity>

          {urlParecidaComLink ? (
            <View style={styles.previewBox}>
              <Image
                source={{ uri: urlLimpa }}
                style={styles.preview}
                onError={() => setImagemComErro(true)}
                onLoad={() => setImagemComErro(false)}
              />
              <Text style={[styles.previewTexto, imagemComErro && styles.erroTexto]}>
                {imagemComErro
                  ? 'Não foi possível carregar essa imagem. Confira o link (prefira https://).'
                  : 'Pré-visualização'}
              </Text>
            </View>
          ) : null}

          <View style={styles.destaqueLinha}>
            <View style={styles.flex}>
              <Text style={styles.destaqueTitulo}>Mostrar em destaque na Home</Text>
              <Text style={styles.destaqueDica}>Aparece na lista "Produtos destaques".</Text>
            </View>
            <Switch
              value={destaque}
              onValueChange={setDestaque}
              trackColor={{ false: '#D8D4CE', true: cores.DOURADO }}
              thumbColor="#FFFFFF"
            />
          </View>

          {erroGeral ? <Text style={styles.erroGeral}>{erroGeral}</Text> : null}

          <View style={styles.botoes}>
            <BotaoPrimario titulo="Cadastrar produto" onPress={cadastrar} carregando={enviando} />
            <BotaoSecundario titulo="Cancelar" onPress={() => navigation.goBack()} disabled={enviando} />
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
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: cores.TEXTO,
    marginBottom: 18,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.TEXTO,
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: cores.BORDA,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  chipSelecionado: {
    backgroundColor: cores.DOURADO,
    borderColor: cores.DOURADO,
  },
  chipTexto: {
    fontSize: 13,
    color: cores.TEXTO,
    fontWeight: '600',
  },
  chipTextoSelecionado: {
    color: '#FFFFFF',
  },
  espaco: {
    height: 14,
  },
  erroTexto: {
    fontSize: 12,
    color: '#C0504D',
    marginTop: 4,
  },
  exemploBotao: {
    alignSelf: 'flex-start',
    marginTop: -6,
    marginBottom: 12,
  },
  exemploTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.DOURADO,
  },
  previewBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F1EFEC',
  },
  previewTexto: {
    fontSize: 12,
    color: cores.CINZA,
    marginTop: 6,
    textAlign: 'center',
  },
  destaqueLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: cores.BORDA,
    borderRadius: 12,
    padding: 14,
  },
  destaqueTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.TEXTO,
  },
  destaqueDica: {
    fontSize: 12,
    color: cores.CINZA,
    marginTop: 2,
  },
  erroGeral: {
    fontSize: 13,
    color: '#C0504D',
    textAlign: 'center',
    marginTop: 14,
  },
  botoes: {
    marginTop: 20,
  },
});
