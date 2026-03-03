// ── Types extracted from beanheads AvatarProps ──────────────────────────────
export interface AvatarModel {
  skinTone?: 'light' | 'yellow' | 'brown' | 'dark' | 'red' | 'black';
  eyes?:
    | 'normal'
    | 'leftTwitch'
    | 'happy'
    | 'content'
    | 'squint'
    | 'simple'
    | 'dizzy'
    | 'wink'
    | 'heart';
  eyebrows?: 'raised' | 'leftLowered' | 'serious' | 'angry' | 'concerned';
  mouth?: 'grin' | 'sad' | 'openSmile' | 'lips' | 'open' | 'serious' | 'tongue';
  hair?:
    | 'none'
    | 'long'
    | 'bun'
    | 'short'
    | 'pixie'
    | 'balding'
    | 'buzz'
    | 'afro'
    | 'bob';
  hairColor?:
    | 'blonde'
    | 'orange'
    | 'black'
    | 'white'
    | 'brown'
    | 'blue'
    | 'pink';
  facialHair?: 'none' | 'none2' | 'none3' | 'stubble' | 'mediumBeard';
  clothing?: 'naked' | 'shirt' | 'dressShirt' | 'vneck' | 'tankTop' | 'dress';
  clothingColor?: 'white' | 'blue' | 'black' | 'green' | 'red';
  accessory?: 'none' | 'roundGlasses' | 'tinyGlasses' | 'shades';
  graphic?: 'none' | 'redwood' | 'gatsby' | 'vue' | 'react' | 'graphQL';
  hat?: 'none' | 'none2' | 'none3' | 'none4' | 'none5' | 'beanie' | 'turban';
  hatColor?: 'white' | 'blue' | 'black' | 'green' | 'red';
  lipColor?: 'red' | 'purple' | 'pink' | 'turqoise' | 'green';
  faceMaskColor?: 'white' | 'blue' | 'black' | 'green' | 'red';
  body?: 'chest' | 'breasts';
  circleColor?: 'blue';
  lashes?: boolean;
  mask?: boolean;
  faceMask?: boolean;
}

export interface GameSessionModel {
  id: string;
  roomCode: string | null;
  title: string;
  status: string;
  createdAt: string;
  finishedAt: string | null;
  totalPlayers: number;
}

export interface GameHistoryModel {
  id: string;
  sessionId: string;
  nickname: string;
  score: number;
  joinedAt: string;
  session: {
    title: string;
    createdAt: string;
    totalQuestions: number;
  };
}

export interface PlayerModel {
  nickname: string;
  score: number;
  avatar?: AvatarModel | null;
}

export interface LeaderboardProps {
  players: PlayerModel[];
  prevPlayers?: PlayerModel[];
  myName: string | null;
}
