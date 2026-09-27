export interface Voter {
  id: string;
  name: string;
  type: 'yes' | 'maybe' | 'interested';
  votedAt: string;
}

export interface GameSession {
  id: string;
  creatorDiscord: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "21:30"
  game: string;
  createdAt: string;
  voters: Voter[];
}

export const POPULAR_GAME_NAMES: string[] = [
  // Giochi espressamente richiesti
  'Wardogs',
  'Arc Raiders',
  'Dead by Daylight',
  'The First Descendant',
  'Marathon',
  'GTA 5 / GTA Online',

  // Sparatutto ed Extraction / Battle Royale
  'Valorant',
  'Helldivers 2',
  'Counter-Strike 2',
  'Rainbow Six Siege',
  'Apex Legends',
  'Call of Duty: Warzone',
  'Call of Duty: Modern Warfare',
  'Fortnite',
  'Overwatch 2',
  'Escape from Tarkov',
  'Hunt: Showdown 1896',
  'The Finals',
  'Battlefield 2042',
  'Team Fortress 2',
  'Destiny 2',
  'Warframe',
  'Titanfall 2',
  'Halo Infinite',
  'XDefiant',
  'Delta Force',
  'Spectre Divide',
  'Payday 3',
  'Deep Rock Galactic',
  'Killing Floor 2',
  'Left 4 Dead 2',
  'Warhammer 40,000: Space Marine 2',

  // Survival, Sandbox & Crafting
  'Rust',
  'Minecraft',
  'Terraria',
  'Sons of the Forest / The Forest',
  'Raft',
  'Sea of Thieves',
  'ARK: Survival Ascended / Evolved',
  'Valheim',
  'Palworld',
  'DayZ',
  'Project Zomboid',
  '7 Days to Die',
  'Conan Exiles',
  'Grounded',
  'Subnautica',
  'No Man\'s Sky',
  'Astroneer',
  'Enshrouded',
  'V Rising',

  // Horror Co-op & Party Games
  'Lethal Company',
  'Phasmophobia',
  'Content Warning',
  'Among Us',
  'Roblox',
  'Garry\'s Mod',
  'Demonologist',
  'The Outlast Trials',
  'Devour',
  'Forewarned',
  'Escape the Backrooms',
  'Party Animals',
  'Fall Guys',
  'Human Fall Flat',
  'Pummel Party',
  'Goose Goose Duck',
  'Golf With Your Friends',
  'Pico Park',
  'Overcooked! All You Can Eat',
  'PlateUp!',
  'Gang Beasts',
  'Stick Fight: The Game',
  'Chained Together',
  'Lockdown Protocol',

  // MOBA, Sport, Racing & Picchiaduro
  'League of Legends',
  'Rocket League',
  'Dota 2',
  'EA Sports FC 25',
  'NBA 2K25',
  'Forza Horizon 5',
  'Assetto Corsa',
  'F1 24',
  'iRacing',
  'The Crew Motorfest',
  'Need for Speed Unbound',
  'Tekken 8',
  'Street Fighter 6',
  'Mortal Kombat 1',
  'Super Smash Bros.',
  'Brawlhalla',
  'Smite 2',

  // GDR, MMO & Strategici
  'World of Warcraft',
  'Final Fantasy XIV',
  'Elder Scrolls Online',
  'Guild Wars 2',
  'Lost Ark',
  'Path of Exile / PoE 2',
  'Diablo IV',
  'Baldur\'s Gate 3',
  'Elden Ring (Seamless Co-op)',
  'Monster Hunter: World / Wilds',
  'Black Desert Online',
  'Civilization VI / VII',
  'Age of Empires IV',
  'Hearts of Iron IV',
  'Stellaris',
  'Total War: Warhammer III',
  'Crusader Kings III',
  'Helldivers',
  'Tabletop Simulator',
];
