import { Alert, Platform } from 'react-native';

// Alert.alert não faz nada no navegador (Expo Web), então nesse caso usamos
// window.alert / window.confirm. No celular (Android/iOS) usa o Alert normal.

export function avisar(titulo, mensagem) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    return;
  }
  Alert.alert(titulo, mensagem);
}

export function confirmar({ titulo, mensagem, textoConfirmar = 'Confirmar', destrutivo = false, aoConfirmar }) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensagem ? `${titulo}\n\n${mensagem}` : titulo)) aoConfirmar();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoConfirmar, style: destrutivo ? 'destructive' : 'default', onPress: aoConfirmar },
  ]);
}
