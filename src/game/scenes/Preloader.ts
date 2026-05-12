import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init(): void {
        this.add.image(400, 300, 'bg');
        const bar = this.add.rectangle(400, 384, 4, 28, 0xffffff);
        this.load.on('progress', (p: number) => {
            bar.width = 4 + (460 * p);
        });
    }

    preload(): void {
        // No external assets to load — all textures generated in Boot
    }

    create(): void {
        this.scene.start('MainMenu');
    }
}
