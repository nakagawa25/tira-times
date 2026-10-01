const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function formatDateLong(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()];
  const day = date.getDate();
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  return `${weekday}, ${day} de ${month}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
}
