// Textos e cores de cada status de pedido (o servidor manda só o código).
const STATUS = {
  aguardando_pagamento: { rotulo: 'Aguardando pagamento', cor: '#9A6A12', fundo: '#FFF4DB' },
  pago: { rotulo: 'Pago', cor: '#2F7D4F', fundo: '#E4F5EA' },
  falhou: { rotulo: 'Pagamento recusado', cor: '#B8433F', fundo: '#FBE7E6' },
  cancelado: { rotulo: 'Cancelado', cor: '#6B6B6B', fundo: '#EEEEEE' },
  reembolsado: { rotulo: 'Reembolsado', cor: '#6B6B6B', fundo: '#EEEEEE' },
  recebido: { rotulo: 'Recebido', cor: '#6B6B6B', fundo: '#EEEEEE' },
};

export function infoStatus(status) {
  return STATUS[status] || { rotulo: String(status), cor: '#6B6B6B', fundo: '#EEEEEE' };
}

export function rotuloBotaoPagar(status) {
  if (status === 'falhou') return 'Tentar pagar novamente';
  if (status === 'cancelado') return 'Pagar novamente';
  return 'Finalizar compra';
}

// O servidor devolve a data em UTC ("2026-11-05 14:30:00"); mostramos no horário do aparelho.
export function formatarData(valor) {
  const data = new Date(String(valor).replace(' ', 'T') + 'Z');
  if (Number.isNaN(data.getTime())) return String(valor);
  const dois = (n) => String(n).padStart(2, '0');
  return `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${data.getFullYear()} ${dois(data.getHours())}:${dois(data.getMinutes())}`;
}
