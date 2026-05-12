import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() { super('Preloader'); }

    init(): void {
        this.add.image(400, 300, 'bg');
        const bar = this.add.rectangle(400, 384, 4, 28, 0xffffff);
        this.load.on('progress', (p: number) => { bar.width = 4 + (460 * p); });
    }

    preload(): void {
        // Load SVGs as textures — Phaser rasterizes them at the given size
        this.load.setPath('assets/svg');

        this.load.svg('player-idle', 'hero.svg', { width: 28, height: 36 });
        this.load.svg('player-power', 'hero-powered-up.svg', { width: 28, height: 36 });
        this.load.svg('enemy', 'enemy.svg', { width: 28, height: 24 });
        this.load.svg('enemy-flat', 'enemy-flat.svg', { width: 28, height: 8 });
        this.load.svg('coin', 'coin.svg', { width: 20, height: 20 });
        this.load.svg('powerup', 'powerup.svg', { width: 24, height: 24 });
        this.load.svg('pu-speed', 'thunder.svg', { width: 24, height: 24 });
        this.load.svg('pu-kill', 'scissor.svg', { width: 24, height: 24 });
        this.load.svg('pu-points', 'food.svg', { width: 24, height: 24 });
        this.load.svg('exit', 'exit.svg', { width: 32, height: 64 });
        this.load.svg('dirt', 'dirt.svg', { width: 32, height: 32 });
        this.load.svg('ground', 'bg-grass.svg', { width: 32, height: 32 });
        this.load.svg('heart', 'heart.svg', { width: 20, height: 20 });
        this.load.svg('flag', 'flag.svg', { width: 32, height: 32 });
        this.load.svg('tree', 'tree.svg', { width: 32, height: 48 });
        this.load.svg('flower', 'flower.svg', { width: 16, height: 16 });
        this.load.svg('water', 'water.svg', { width: 32, height: 32 });
        this.load.svg('food', 'food.svg', { width: 16, height: 16 });
        this.load.svg('boar', 'pig.svg', { width: 32, height: 24 });
        this.load.svg('snail', 'monster-5.svg', { width: 28, height: 18 });
    }

    create(): void {
        this.scene.start('MainMenu');
    }
}
