// Level 1: "I Campi del Grano"
// Tile size: 32x32px
// Each character = one tile
// Legend:
//   . = air
//   # = ground (grass top)
//   - = dirt (underground)
//   P = player spawn
//   C = coin
//   E = enemy (corvo, patrol)
//   B = cinghiale (carica)
//   L = lumaca (immune stomp)
//   X = exit / level end
//   U = powerup (invincibilità)
//   S = powerup velocità
//   F = powerup falce (uccide nemici)
//   D = powerup punti doppi
//   H = floating hay platform
//   ? = breakable block
//   K = key (apre porte)
//   J = door (richiede chiave)
//   ] = secret wall (distruttibile con attacco)
//   V = fly (mosca, segue player X+Y)
//   R = skeleton (scheletro, rigenera)
//   G = ghost (fantasma, onda sinusoidale)
//   A = archer (arciere, spara frecce)
//   Z = boss (3 fasi, arena)

export const LEVEL_1_WIDTH = 120;
export const LEVEL_1_HEIGHT = 18;

export const LEVEL_1: string[] = [
    // Row 0  (top)
    '................................................................................................................................................................................',
    // Row 1
    '................................................................................................................................................................................',
    // Row 2
    '..S.......H.......H...................................H...........H.......................H..............H..........................H......H.........',
    // Row 3
    '................................................................................................................................................................D..........S....',
    // Row 4
    '..........................................................U..................................................................................................',
    // Row 5
    '.......C.......C...........C....C...........................C...........C....C........................C.......C............H..H....................',
    // Row 6
    '..............................................................................F.........................................................................',
    // Row 7
    '..................................E............................................E.................................................E.................',
    // Row 8
    '........C..............C.........H.H.............C..............C..........H.H........C...........C..........H.H.........C.......................',
    // Row 9
    '..H.H.......................................H.H.......................................................H.H............................................',
    // Row 10
    '......................C....C...................................................................C....C..................................................',
    // Row 11
    '.............................................C.....C.....................................................................C....C......................',
    // Row 12
    'P.C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C..C.X',
    // Row 13
    '#############?############################################?########################################################################################################',
    // Row 14
    '----------------------------------------------------------------------------------------------------------------------------------------------------------------------------',
    // Row 15
    '----------------------------------------------------------------------------------------------------------------------------------------------------------------------------',
    // Row 16
    '----------------------------------------------------------------------------------------------------------------------------------------------------------------------------',
    // Row 17 (bottom)
    '----------------------------------------------------------------------------------------------------------------------------------------------------------------------------',
];

// Parse level and return structured data
export interface LevelData {
    platforms: { x: number; y: number; type: string }[];
    coins: { x: number; y: number }[];
    enemies: { x: number; y: number; type?: string }[];
    playerSpawn: { x: number; y: number };
    exit: { x: number; y: number } | null;
    powerups: { x: number; y: number; type: string }[];
    water: { x: number; y: number }[];
    breakables: { x: number; y: number }[];
    keys: { x: number; y: number }[];
    doors: { x: number; y: number }[];
    secretWalls: { x: number; y: number }[];
}

export function parseLevel(level: string[], tileSize: number): LevelData {
    const data: LevelData = {
        platforms: [],
        coins: [],
        enemies: [],
        playerSpawn: { x: 0, y: 0 },
        exit: null,
        powerups: [],
        water: [],
        breakables: [],
        keys: [],
        doors: [],
        secretWalls: [],
    };

    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            const ch = level[row][col];
            const x = col * tileSize + tileSize / 2;
            const y = row * tileSize + tileSize / 2;

            switch (ch) {
                case '#':
                    data.platforms.push({ x, y, type: 'ground' });
                    break;
                case '-':
                    data.platforms.push({ x, y, type: 'dirt' });
                    break;
                case 'H':
                    data.platforms.push({ x, y, type: 'platform' });
                    break;
                case 'C':
                    data.coins.push({ x, y });
                    break;
                case 'E':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'crow' });
                    break;
                case 'B':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'boar' });
                    break;
                case 'L':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'snail' });
                    break;
                case '?':
                    data.breakables.push({ x, y });
                    break;
                case 'P':
                    data.playerSpawn = { x, y };
                    break;
                case 'X':
                    data.exit = { x, y };
                    break;
                case 'U':
                    data.powerups.push({ x, y, type: 'invincible' });
                    break;
                case 'S':
                    data.powerups.push({ x, y, type: 'speed' });
                    break;
                case 'F':
                    data.powerups.push({ x, y, type: 'kill' });
                    break;
                case 'D':
                    data.powerups.push({ x, y, type: 'points' });
                    break;
                case 'W':
                    data.water.push({ x, y });
                    break;
                case 'K':
                    data.keys.push({ x, y });
                    break;
                case 'J':
                    data.doors.push({ x, y });
                    break;
                case ']':
                    data.secretWalls.push({ x, y });
                    break;
                case 'V':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'fly' });
                    break;
                case 'R':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'skeleton' });
                    break;
                case 'G':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'ghost' });
                    break;
                case 'A':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'archer' });
                    break;
                case 'Z':
                    data.enemies.push({ x: col * tileSize + tileSize / 2, y: (row + 1) * tileSize, type: 'boss' });
                    break;
            }
        }
    }

    return data;
}
