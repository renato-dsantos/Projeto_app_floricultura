import { usuarioLogado } from './api';

// Ação do ícone de perfil na tab bar:
// - sem login      → abre a tela de Login
// - administrador  → abre o painel administrativo
// - cliente logado → abre a tela Perfil
export function abrirPerfil(navigation) {
  const usuario = usuarioLogado();

  if (!usuario) {
    navigation.navigate('Login');
    return;
  }

  navigation.navigate(usuario.role === 'admin' ? 'Admin' : 'Perfil');
}
