import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

export const DOURADO = '#B08D57';
const TEXTO = '#2B2326';
const CINZA = '#8A8A8A';
const BORDA = '#E6E2DC';

// Campo com rótulo, mensagem de erro e opção de ficar bloqueado (editable={false}).
export function Campo({ rotulo, erro, carregando, style, ...props }) {
  const bloqueado = props.editable === false;
  return (
    <View style={styles.campoWrapper}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.inputBox, bloqueado && styles.inputBloqueado, erro && styles.inputErro]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#A8A8A8"
          {...props}
        />
        {carregando ? <ActivityIndicator size="small" color={DOURADO} /> : null}
      </View>
      {erro ? <Text style={styles.erroTexto}>{erro}</Text> : null}
    </View>
  );
}

export function BotaoPrimario({ titulo, onPress, carregando, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.botaoPrimario, (disabled || carregando) && styles.botaoDesabilitado]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || carregando}
    >
      {carregando ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.botaoPrimarioTexto}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

export function BotaoSecundario({ titulo, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={styles.botaoSecundario}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={styles.botaoSecundarioTexto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

export const cores = { DOURADO, TEXTO, CINZA, BORDA };

const styles = StyleSheet.create({
  campoWrapper: {
    marginBottom: 14,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXTO,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDA,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputBloqueado: {
    backgroundColor: '#F1EFEC',
  },
  inputErro: {
    borderColor: '#C0504D',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: TEXTO,
    paddingVertical: 12,
  },
  erroTexto: {
    fontSize: 12,
    color: '#C0504D',
    marginTop: 4,
  },
  botaoPrimario: {
    backgroundColor: DOURADO,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  botaoSecundario: {
    borderWidth: 1.5,
    borderColor: DOURADO,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  botaoSecundarioTexto: {
    color: DOURADO,
    fontSize: 15,
    fontWeight: '700',
  },
});
