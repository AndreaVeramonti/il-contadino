export type EnemyType = 'crow' | 'boar' | 'snail' | 'fly' | 'skeleton' | 'ghost' | 'archer' | 'boss';

export interface EnemyConfig {
    texture: string;
    speed: number;
    stompable: boolean;
    hp: number;
    patrolRange: number;
    chargeSpeed: number;
    chargeRange: number;
    // Optional extended fields for new enemy types
    flySpeed?: number;
    regenDelay?: number;
    waveAmplitude?: number;
    waveFrequency?: number;
    shootRange?: number;
    shootCooldown?: number;
}

export const ENEMY_CONFIG: Record<EnemyType, EnemyConfig> = {
    crow: {
        texture: 'enemy',
        speed: 60,
        stompable: true,
        hp: 1,
        patrolRange: 80,
        chargeSpeed: 0,
        chargeRange: 0,
    },
    boar: {
        texture: 'boar',
        speed: 30,
        stompable: true,
        hp: 3,
        patrolRange: 100,
        chargeSpeed: 280,
        chargeRange: 150,
    },
    snail: {
        texture: 'snail',
        speed: 40,
        stompable: false,
        hp: 2,
        patrolRange: 60,
        chargeSpeed: 0,
        chargeRange: 0,
    },
    fly: {
        texture: 'monster-7',
        speed: 80,
        stompable: false,
        hp: 2,
        patrolRange: 150,
        chargeSpeed: 0,
        chargeRange: 0,
        flySpeed: 100,
    },
    skeleton: {
        texture: 'monster-8',
        speed: 50,
        stompable: true,
        hp: 2,
        patrolRange: 80,
        chargeSpeed: 0,
        chargeRange: 0,
        regenDelay: 5000,
    },
    ghost: {
        texture: 'howl',
        speed: 60,
        stompable: false,
        hp: 3,
        patrolRange: 100,
        chargeSpeed: 0,
        chargeRange: 0,
        waveAmplitude: 30,
        waveFrequency: 0.003,
    },
    archer: {
        texture: 'monster-3',
        speed: 40,
        stompable: true,
        hp: 2,
        patrolRange: 150,
        chargeSpeed: 0,
        chargeRange: 0,
        shootRange: 200,
        shootCooldown: 2500,
    },
    boss: {
        texture: 'boss',
        speed: 0,
        stompable: false,
        hp: 15,
        patrolRange: 0,
        chargeSpeed: 250,
        chargeRange: 400,
        shootRange: 300,
        shootCooldown: 2000,
    },
};

export function getEnemyLabel(type: EnemyType): string {
    switch (type) {
        case 'crow': return 'Corvo';
        case 'boar': return 'Cinghiale';
        case 'snail': return 'Lumaca';
        case 'fly': return 'Mosca';
        case 'skeleton': return 'Scheletro';
        case 'ghost': return 'Fantasma';
        case 'archer': return 'Arciere';
        case 'boss': return 'BOSS';
    }
}
