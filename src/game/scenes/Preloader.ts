import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() { super('Preloader'); }
    init(): void {
        this.cameras.main.setBackgroundColor('#E8E4D4');
        const bar = this.add.rectangle(480, 340, 4, 28, 0x1A1A1A);
        this.load.on('progress', (p: number) => { bar.width = 4 + (552 * p); });
    }
    preload(): void {
        this.load.setPath('assets/svg');
        // Decorative SVGs — mountains as background horizon silhouettes
        this.load.svg('mountain-bg', 'bg.mountain-1.svg', { width: 600, height: 180 });
        this.load.svg('mountain-fg', 'bg-mountain-2.svg', { width: 500, height: 150 });
        this.load.svg('bg-grass', 'bg-grass.svg', { width: 64, height: 32 });
        this.load.svg('terreno', 'terreno.svg', { width: 64, height: 64 });
        this.load.svg('tree', 'tree.svg', { width: 80, height: 120 });
        this.load.svg('tree-2', 'tree-2.svg', { width: 60, height: 90 });
        this.load.svg('flower', 'flower.svg', { width: 32, height: 48 });
        this.load.svg('flower-3', 'flower-3.svg', { width: 28, height: 40 });
        this.load.svg('car', 'car.svg', { width: 48, height: 36 });
        this.load.svg('exit', 'exit.svg', { width: 32, height: 64 });
        this.load.svg('flag', 'flag.svg', { width: 32, height: 32 });
        this.load.svg('water', 'water.svg', { width: 32, height: 32 });
        // Power-up SVGs
        this.load.svg('powerup', 'powerup.svg', { width: 24, height: 24 });
        this.load.svg('pu-speed', 'thunder.svg', { width: 24, height: 24 });
        this.load.svg('pu-kill', 'scissor.svg', { width: 24, height: 24 });
        this.load.svg('pu-points', 'food.svg', { width: 24, height: 24 });
        // Enemy SVGs for non-redesigned types (kept as original)
        this.load.svg('boar', 'pig.svg', { width: 32, height: 24 });
        this.load.svg('snail', 'monster-5.svg', { width: 28, height: 18 });
        this.load.svg('fly', 'monster-7.svg', { width: 28, height: 24 });
        this.load.svg('skeleton', 'monster-8.svg', { width: 28, height: 28 });
        this.load.svg('ghost', 'howl.svg', { width: 28, height: 28 });
        this.load.svg('archer', 'monster-3.svg', { width: 28, height: 28 });
        this.load.svg('boss', 'monster-4.svg', { width: 40, height: 40 });
    }
    create(): void {
        this.scene.start('MainMenu');
    }
}
