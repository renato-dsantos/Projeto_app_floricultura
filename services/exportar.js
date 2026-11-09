import { Platform, Share } from 'react-native';

// Limite de segurança: o compartilhamento do celular (Android/iOS) manda o conteúdo como texto
// e falha com arquivos muito grandes. No navegador não há esse limite.
const LIMITE_CELULAR = 400000;

// Navegador → baixa um arquivo .json.
// Celular   → abre o menu de compartilhar (e-mail, WhatsApp, Drive, "Salvar em arquivos"...).
export async function entregarJson(dados, nomeArquivo) {
  if (Platform.OS === 'web') {
    const texto = JSON.stringify(dados, null, 2);
    const blob = new Blob([texto], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return 'baixado';
  }

  const texto = JSON.stringify(dados);
  if (texto.length > LIMITE_CELULAR) {
    throw new Error('Os dados ficaram grandes demais para compartilhar pelo celular. Gere o arquivo pelo navegador.');
  }
  await Share.share({ title: nomeArquivo, message: texto });
  return 'compartilhado';
}
