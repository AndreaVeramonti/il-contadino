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
        // --- Player (green body #3D6B35 + cream head #E8E4D4 + black outline #1A1A1A) 32×48 ---
        this.genTex('player-idle', 32, 48, (g) => {
            // Outline body
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 32, 48);
            // Body (green)
            g.fillStyle(0x3D6B35);
            g.fillRect(2, 18, 28, 28);
            // Legs (darker green)
            g.fillStyle(0x2D5B25);
            g.fillRect(4, 36, 10, 10);
            g.fillRect(18, 36, 10, 10);
            // Head (cream)
            g.fillStyle(0xE8E4D4);
            g.fillRect(4, 2, 24, 18);
            // Hat (dark brown)
            g.fillStyle(0x4A3728);
            g.fillRect(2, 0, 28, 6);
            // Eyes
            g.fillStyle(0x1A1A1A);
            g.fillRect(9, 8, 4, 4);
            g.fillRect(19, 8, 4, 4);
            // Mouth (small smile)
            g.fillStyle(0x1A1A1A);
            g.fillRect(12, 15, 8, 2);
            // Arms (cream)
            g.fillStyle(0xE8E4D4);
            g.fillRect(0, 20, 4, 12);
            g.fillRect(28, 20, 4, 12);
        });

        // Player power-up (same but with glow)
        this.genTex('player-power', 32, 48, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 32, 48);
            g.fillStyle(0x4A8B40);
            g.fillRect(2, 18, 28, 28);
            g.fillStyle(0x3D7B30);
            g.fillRect(4, 36, 10, 10);
            g.fillRect(18, 36, 10, 10);
            g.fillStyle(0xF0ECD8);
            g.fillRect(4, 2, 24, 18);
            g.fillStyle(0x4A3728);
            g.fillRect(2, 0, 28, 6);
            g.fillStyle(0x1A1A1A);
            g.fillRect(9, 8, 4, 4);
            g.fillRect(19, 8, 4, 4);
            g.fillStyle(0x1A1A1A);
            g.fillRect(12, 15, 8, 2);
            g.fillStyle(0xF0ECD8);
            g.fillRect(0, 20, 4, 12);
            g.fillRect(28, 20, 4, 12);
            // Green glow outline
            g.lineStyle(2, 0x66FF66, 0.6);
            g.strokeRect(1, 1, 30, 46);
        });

        // --- Enemy (red #CC2200 + white eyes + black outline) 32×32 ---
        this.genTex('enemy', 32, 32, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 32, 32);
            // Body
            g.fillStyle(0xCC2200);
            g.fillRect(2, 4, 28, 26);
            // Head tuft
            g.fillStyle(0xAA1100);
            g.fillTriangle(8, 4, 16, 0, 24, 4);
            // Eyes (white circles)
            g.fillStyle(0xFFFFFF);
            g.fillCircle(10, 12, 6);
            g.fillCircle(22, 12, 6);
            // Pupils
            g.fillStyle(0x1A1A1A);
            g.fillCircle(10, 12, 3);
            g.fillCircle(22, 12, 3);
            // Beak
            g.fillStyle(0xFF8800);
            g.fillTriangle(14, 18, 18, 18, 16, 24);
            // Feet
            g.fillStyle(0xFF8800);
            g.fillRect(6, 28, 8, 4);
            g.fillRect(18, 28, 8, 4);
        });

        // Enemy flat (squished after stomp) - wider, flatter
        this.genTex('enemy-flat', 36, 10, (g) => {
            g.fillStyle(0x1A1A1A);
            g.fillRect(0, 0, 36, 10);
            g.fillStyle(0xCC2200);
            g.fillRect(2, 2, 32, 6);
            g.fillStyle(0xFF8800);
            g.fillRect(8, 6, 6, 4);
            g.fillRect(22, 6, 6, 4);
        });

        // --- Coin (gold #D4A017 circle + black outline) 32×32 with shine ---
        this.genTex('coin', 32, 32, (g) => {
            // Black outline
            g.fillStyle(0x1A1A1A);
            g.fillCircle(16, 16, 16);
            // Gold fill
            g.fillStyle(0xD4A017);
            g.fillCircle(16, 16, 14);
            // Inner ring
            g.lineStyle(2, 0xB89010, 0.5);
            g.strokeCircle(16, 16, 10);
            // Shine highlight (top-left)
            g.fillStyle(0xF0D060);
            g.fillCircle(12, 11, 5);
            // Bright spot
            g.fillStyle(0xFFF0A0);
            g.fillCircle(10, 9, 2);
        });

        // --- Heart (#CC2200 simple heart) 24×24 ---
        this.genTex('heart', 24, 20, (g) => {
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
