import { Barraca } from './types';

const OFFICIAL_NAMES: { [key: number]: string } = {
  1: 'NEBEC', 2: 'NEMTC', 3: 'NAE-ISCA', 4: 'NED', 5: 'NEEB',
  6: 'NELRE', 7: 'NEEETA', 8: 'NEEQu', 9: 'AEGIA', 10: 'NECIB',
  11: 'NEAP', 12: 'NAE-ESSUA', 13: 'NEG', 14: 'NEEF', 15: 'NEEA',
  16: 'NEECT', 17: 'NRock', 18: 'NEEMec', 19: 'NEQ', 20: 'NEGPT',
  21: 'NEP', 22: 'NEEC', 23: 'NAE-ESAN', 24: 'NEB', 25: 'NEI',
  26: 'NeMat', 27: 'NECM', 28: 'NEBG', 29: 'NEM', 30: 'NEMOC/NEGeo',
  31: 'NEEE', 32: 'NELLC', 33: 'TUA', 34: 'NAESTGA', 35: 'NEMu/NET'
};

export const INITIAL_BARRACAS: Barraca[] = [];

const layout = [
  // Left Column (Col 1)
  { id: 2, r: 2, c: 1 }, { id: 4, r: 3, c: 1 },
  { id: 6, r: 5, c: 1 }, { id: 8, r: 6, c: 1 },
  { id: 12, r: 8, c: 1 }, { id: 16, r: 9, c: 1 },
  { id: 18, r: 11, c: 1 }, { id: 20, r: 12, c: 1 },
  { id: 24, r: 14, c: 1 }, { id: 28, r: 15, c: 1 },
  { id: 30, r: 17, c: 1 }, { id: 32, r: 18, c: 1 },
  { id: 34, r: 20, c: 1 }, { id: 35, r: 21, c: 1 },

  // Right Column (Col 6)
  { id: 1, r: 2, c: 6 }, { id: 3, r: 3, c: 6 },
  { id: 5, r: 5, c: 6 }, { id: 7, r: 6, c: 6 },
  { id: 9, r: 8, c: 6 }, { id: 13, r: 9, c: 6 },
  { id: 17, r: 11, c: 6 }, { id: 19, r: 12, c: 6 },
  { id: 21, r: 14, c: 6 }, { id: 25, r: 15, c: 6 },
  { id: 29, r: 17, c: 6 }, { id: 31, r: 18, c: 6 },
  { id: 33, r: 20, c: 6 },

  // Center Blocks
  { id: 11, r: 9, c: 3 }, { id: 10, r: 9, c: 4 },
  { id: 15, r: 10, c: 3 }, { id: 14, r: 10, c: 4 },
  { id: 23, r: 15, c: 3 }, { id: 22, r: 15, c: 4 },
  { id: 27, r: 16, c: 3 }, { id: 26, r: 16, c: 4 },
];

const STALL_ASSETS: { [key: number]: { shotsUrls?: string[], giftsUrls?: string[] } } = {
  2: { // NEMTC
    shotsUrls: ['/NEMTC-s-1.png', '/NEMTC-s-2.png', '/NEMTC-s-3.png'],
    giftsUrls: ['/NEMTC-b.png']
  },
  21: { // NEP
    shotsUrls: ['/NEP-s-1.png', '/NEP-s-2.png'],
    giftsUrls: ['/NEP-b-1.png', '/NEP-b-2.png', '/NEP-b-3.png', '/NEP-b-4.png', '/NEP-b-5.png']
  },
  27: { // NECM
    shotsUrls: ['/NECM-s.png'],
    giftsUrls: ['/NECM-b.png']
  },
  34: { // NAESTGA
    shotsUrls: ['/NAESTGA-s.png'],
    giftsUrls: ['/NAESTGA-b-1.png', '/NAESTGA-b-2.png']
  },
  15: { // NEEA
    shotsUrls: ['/NEEA-s.png'],
    giftsUrls: ['/NEEA-b-1.png', '/NEEA-b-2.png']
  },
  8: { // NEEQu
    shotsUrls: ['/NEEQu-s-1.png', '/NEEQu-s-2.png'],
    giftsUrls: ['/NEEQu-b.png']
  },
  9: { // AEGIA
    shotsUrls: ['/AEGIA-s.png']
  },
  11: { // NEAP
    shotsUrls: ['/NEAP-s.png']
  },
  20: { // NEGPT
    shotsUrls: ['/NEGPT-s.png']
  },
  19: { // NEQ
    shotsUrls: ['/NEQ-s.png'],
    giftsUrls: ['/NEQ-b.png']
  },
  3: { // NAE-ISCA
    shotsUrls: ['/ISCA-s.png']
  },
  14: { // NEEF
    shotsUrls: ['/NEEF-s.png']
  },
  7: { // NEEETA
    giftsUrls: ['/NEEETA-b-1.png', '/NEEETA-b-2.png', '/NEEETA-b-3.png', '/NEEETA-b-4.png']
  },
  22: { // NEEC
    giftsUrls: ['/NEEC-b.png']
  },
  18: { // NEEMec
    shotsUrls: ['/NEEMEC-s-1.png', '/NEEMEC-s-2.png'],
    giftsUrls: ['/NEEMEC-b-1.png', '/NEEMEC-b-2.png', '/NEEMEC-b-3.png']
  }
};

layout.forEach(pos => {
  const assets = STALL_ASSETS[pos.id] || {};
  INITIAL_BARRACAS.push({
    id: `b-${pos.id}`,
    name: OFFICIAL_NAMES[pos.id],
    course: '',
    row: pos.r,
    col: pos.c,
    shots: [],
    gifts: [],
    voteCount: 0,
    shotsUrls: assets.shotsUrls || [],
    giftsUrls: assets.giftsUrls || []
  });
});
