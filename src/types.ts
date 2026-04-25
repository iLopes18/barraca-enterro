export interface Shot {
  name: string;
  ingredients: string;
}

export interface Gift {
  name: string;
  cost: number;
}

export interface Barraca {
  id: string;
  name: string;
  course: string;
  row: number;
  col: number; // 1, 3, 4, 6
  shots: Shot[];
  gifts: Gift[];
  visualUrl?: string;
  shotsUrls?: string[];
  giftsUrls?: string[];
  voteCount: number;
  dailyVotes?: Record<string, number>;
}

export interface Vote {
  deviceId: string;
  barracaId: string;
  timestamp: any; // Firestore Timestamp
}
