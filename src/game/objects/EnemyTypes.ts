export type EnemyType = 'crow' | 'boar' | 'snail';

export interface EnemyConfig {
    texture: string;
    speed: number;
    stompable: boolean;
    patrolRange: number;
    chargeSpeed: number;
    chargeRange: number;
}

export const ENEMY_CONFIG: Record<EnemyType, EnemyConfig> = {
    crow: {
        texture: 'enemy',
        speed: 60,
        stompable: true,
        patrolRange: 80,
        chargeSpeed: 0,
        chargeRange: 0,
    },
    boar: {
        texture: 'boar',
        speed: 30,
        stompable: true,
        patrolRange: 100,
        chargeSpeed: 280,
        chargeRange: 150,
    },
    snail: {
        texture: 'snail',
        speed: 40,
        stompable: false,
        patrolRange: 60,
        chargeSpeed: 0,
        chargeRange: 0,
    },
};

export function getEnemyLabel(type: EnemyType): string {
    switch (type) {
        case 'crow': return 'Corvo';
        case 'boar': return 'Cinghiale';
        case 'snail': return 'Lumaca';
    }
}
