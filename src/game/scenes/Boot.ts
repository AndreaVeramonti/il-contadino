import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }
    create(): void {
        this.genTextures();
        this.scene.start('Preloader');
    }
    private genTextures(): void {
        // --- Player (green body #3D6B35 + cream head #E8E4D4 + black outline #1A1A1A) 28×36 ---
        this.genTex('player-idle', 28, 36, (g) => {
            // Outline
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 28, 36);
            // Body (green)
            g.fillStyle(0x3D6B35);
            g.fillRect(2, 14, 24, 20);
            // Head (cream)
            g.fillStyle(0xE8E4D4);
            g.fillRect(4, 2, 20, 14);
            // Eyes
            g.fillStyle(0x1A1A1A);
            g.fillRect(8, 6, 3, 3);
            g.fillRect(17, 6, 3, 3);
        });

        // Player power-up (same but with glow)
        this.genTex('player-power', 28, 36, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 28, 36);
            g.fillStyle(0x4A8B40);
            g.fillRect(2, 14, 24, 20);
            g.fillStyle(0xF0ECD8);
            g.fillRect(4, 2, 20, 14);
            g.fillStyle(0x1A1A1A);
            g.fillRect(8, 6, 3, 3);
            g.fillRect(17, 6, 3, 3);
            // Green glow outline
            g.lineStyle(2, 0x66FF66, 0.6);
            g.strokeRect(1, 1, 26, 34);
        });

        // --- Enemy (red #CC2200 + white eyes + black outline) 28×24 ---
        this.genTex('enemy', 28, 24, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 28, 24);
            g.fillStyle(0xCC2200);
            g.fillRect(2, 2, 24, 20);
            // Eyes
            g.fillStyle(0xFFFFFF);
            g.fillRect(6, 6, 6, 6);
            g.fillRect(16, 6, 6, 6);
            g.fillStyle(0x1A1A1A);
            g.fillRect(8, 8, 3, 3);
            g.fillRect(18, 8, 3, 3);
        });

        // Enemy flat (squished after stomp)
        this.genTex('enemy-flat', 28, 8, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 28, 8);
            g.fillStyle(0xCC2200);
            g.fillRect(2, 2, 24, 4);
        });

        // --- Coin (yellow #D4A017 circle + black outline) 20×20 ---
        this.genTex('coin', 20, 20, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillCircle(10, 10, 10);
            g.fillStyle(0xD4A017);
            g.fillCircle(10, 10, 8);
            g.fillStyle(0xE8C840);
            g.fillCircle(8, 8, 3);
        });

        // --- Heart (#CC2200 simple heart) 20×20 ---
        this.genTex('heart', 20, 20, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillCircle(6, 7, 6);
            g.fillCircle(14, 7, 6);
            g.fillTriangle(0, 10, 20, 10, 10, 20);
            g.fillStyle(0xCC2200);
            g.fillCircle(6, 7, 5);
            g.fillCircle(14, 7, 5);
            g.fillTriangle(1, 10, 19, 10, 10, 19);
        });

        // --- Player projectile (small yellow circle) 10×10 ---
        this.genTex('proj-player', 10, 10, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillCircle(5, 5, 5);
            g.fillStyle(0xFFD700);
            g.fillCircle(5, 5, 4);
        });

        // --- Enemy projectile (small red circle) 10×10 ---
        this.genTex('proj-enemy', 10, 10, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillCircle(5, 5, 5);
            g.fillStyle(0xCC2200);
            g.fillCircle(5, 5, 4);
        });

        // --- Terreno fallback (#C8C87A tile) 32×32 ---
        this.genTex('terreno', 32, 32, (g) => {
            g.fillStyle(0xC8C87A);
            g.fillRect(0, 0, 32, 32);
            g.fillStyle(0xBCBC6E);
            g.fillRect(0, 0, 16, 16);
            g.fillRect(16, 16, 16, 16);
            g.lineStyle(1, 0xB0B062, 0.4);
            g.strokeRect(0, 16, 32, 0);
            g.strokeRect(16, 0, 0, 32);
        });

        // --- Particle (white square) 6×6 ---
        this.genTex('particle', 6, 6, (g) => {
            g.fillStyle(0xFFFFFF);
            g.fillRect(1, 1, 4, 4);
        });
    }
    private genTex(
        key: string, w: number, h: number,
        draw: (g: Phaser.GameObjects.Graphics) => void
    ): void {
        const g = this.add.graphics();
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
    }
}
