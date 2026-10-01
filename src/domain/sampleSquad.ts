import type { Player } from './types';

function p(
  id: string,
  name: string,
  positions: Player['positions'],
  monthly: boolean,
  attack: number,
  defense: number,
  speed: number,
  skill: number,
): Player {
  return { id, name, positions, monthly, skills: { attack, defense, speed, skill } };
}

export const sampleSquad: Player[] = [
  p('p01', 'Marcão', ['GOL'], true, 1, 4, 2, 3),
  p('p02', 'Tiago Souza', ['ATA'], true, 5, 2, 4, 5),
  p('p03', 'Rafa', ['MEI', 'ATA'], true, 4, 3, 4, 4),
  p('p04', 'Dudu', ['DEF'], true, 2, 5, 3, 3),
  p('p05', 'Léo Martins', ['ALA'], true, 3, 3, 5, 3),
  p('p06', 'Bruno', ['QQ'], false, 3, 3, 3, 3),
  p('p07', 'Caio', ['MEI'], true, 3, 4, 3, 4),
  p('p08', 'Gui', ['ATA'], false, 4, 2, 5, 3),
  p('p09', 'Pedrinho', ['ALA', 'DEF'], true, 2, 4, 4, 2),
  p('p10', 'Fábio', ['DEF'], false, 2, 4, 2, 2),
  p('p11', 'Juninho', ['MEI'], true, 4, 2, 3, 5),
  p('p12', 'Vini', ['QQ'], false, 3, 2, 4, 3),
  p('p13', 'Neto', ['DEF', 'MEI'], true, 2, 4, 3, 3),
  p('p14', 'Beto', ['QQ'], false, 2, 3, 2, 2),
  p('p15', 'Alemão', ['ATA'], true, 4, 1, 3, 4),
  p('p16', 'Serginho', ['GOL'], false, 1, 3, 2, 2),
  p('p17', 'Paulo Henrique', ['MEI'], true, 3, 3, 3, 4),
  p('p18', 'Nando', ['ALA'], false, 3, 2, 4, 3),
  p('p19', 'Diego', ['DEF'], true, 2, 5, 3, 2),
  p('p20', 'Careca', ['QQ'], false, 3, 3, 2, 3),
  p('p21', 'Wellington', ['ATA', 'ALA'], false, 4, 2, 4, 3),
  p('p22', 'Thiago Jr', ['QQ'], false, 2, 2, 3, 2),
];
