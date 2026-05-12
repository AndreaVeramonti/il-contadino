import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    create(): void {
        this.generateTextures();
        this.scene.start('Preloader');
    }

    private generateTextures(): void {
        this.makeTex('ground', 32, 32, (g) => {
            g.fillStyle(0x5a8c3f);
            g.fillRect(0, 0, 32, 8);
            g.fillStyle(0x8B5E3C);
            g.fillRect(0, 8, 32, 24);
        });

        this.makeTex('dirt', 32, 32, (g) => {
            g.fillStyle(0x8B5E3C);
            g.fillRect(0, 0, 32, 32);
            g.fillStyle(0x7a4d2b);
            g.fillRect(4, 6, 6, 4);
            g.fillRect(20, 16, 8, 4);
            g.fillRect(10, 24, 5, 5);
        });

        this.makeTex('platform', 32, 32, (g) => {
            g.fillStyle(0xC8A951);
            g.fillRect(0, 0, 32, 32);
            g.fillStyle(0xB8983A);
            g.fillRect(0, 0, 32, 3);
            g.fillRect(0, 14, 32, 2);
            g.fillRect(0, 28, 32, 3);
        });

        this.makeTex('coin', 20, 20, (g) => {
            g.fillStyle(0xFFD700);
            g.fillCircle(10, 10, 9);
            g.fillStyle(0xFFEC80);
            g.fillCircle(8, 8, 4);
        });

        this.makeTex('player-idle', 28, 36, (g) => {
            g.fillStyle(0x5C3A1E);
            g.fillRect(4, 0, 20, 6);
            g.fillRect(2, 4, 24, 4);
            g.fillStyle(0xFFD7A0);
            g.fillRect(6, 7, 16, 12);
            g.fillStyle(0x000000);
            g.fillRect(10, 10, 3, 3);
            g.fillRect(16, 10, 3, 3);
            g.fillStyle(0x4169E1);
            g.fillRect(4, 18, 20, 14);
            g.fillStyle(0x5C3A1E);
            g.fillRect(4, 22, 20, 3);
            g.fillStyle(0x2E5DB5);
            g.fillRect(6, 30, 6, 6);
            g.fillRect(16, 30, 6, 6);
        });

        this.makeTex('player-jump', 28, 36, (g) => {
            g.fillStyle(0xFFD7A0);
            g.fillRect(8, 10, 12, 10);
            g.fillStyle(0x000000);
            g.fillRect(10, 12, 2, 2);
            g.fillRect(16, 12, 2, 2);
            g.fillStyle(0x4169E1);
            g.fillRect(4, 18, 20, 14);
            g.fillStyle(0x5C3A1E);
            g.fillRect(4, 22, 20, 3);
            g.fillStyle(0xFFD7A0);
            g.fillRect(0, 14, 4, 8);
            g.fillRect(24, 14, 4, 8);
            g.fillStyle(0x2E5DB5);
            g.fillRect(4, 30, 6, 6);
            g.fillRect(18, 30, 6, 6);
        });

        this.makeTex('enemy', 28, 24, (g) => {
            g.fillStyle(0x2F2F2F);
            g.fillRect(4, 6, 20, 14);
            g.fillRect(10, 0, 8, 8);
            g.fillStyle(0xFF8C00);
            g.fillRect(18, 3, 6, 3);
            g.fillStyle(0xFFFFFF);
            g.fillRect(12, 2, 3, 3);
            g.fillStyle(0x000000);
            g.fillRect(13, 3, 1, 1);
            g.fillStyle(0x1E1E1E);
            g.fillRect(2, 8, 4, 8);
            g.fillRect(22, 8, 4, 8);
            g.fillStyle(0xFF8C00);
            g.fillRect(8, 20, 3, 4);
            g.fillRect(17, 20, 3, 4);
        });

        this.makeTex('enemy-flat', 28, 8, (g) => {
            g.fillStyle(0x2F2F2F);
            g.fillRect(0, 0, 28, 6);
            g.fillStyle(0x1E1E1E);
            g.fillRect(0, 6, 28, 2);
        });

        this.makeTex('powerup', 24, 24, (g) => {
            g.fillStyle(0x00FF7F);
            g.fillCircle(12, 12, 11);
            g.fillStyle(0x7FFFD4);
            g.fillCircle(8, 8, 4);
            g.fillStyle(0x228B22);
            g.fillRect(11, 0, 3, 5);
        });

        this.makeTex('exit', 32, 64, (g) => {
            g.fillStyle(0x8B4513);
            g.fillRect(0, 16, 32, 48);
            g.fillRect(8, 0, 16, 24);
            g.fillStyle(0x87CEEB);
            g.fillRect(10, 4, 12, 18);
            g.fillStyle(0x8B4513);
            g.fillRect(8, 20, 16, 4);
            g.fillStyle(0xFF4500);
            g.fillRect(12, 0, 12, 8);
        });

        this.makeTex('particle', 6, 6, (g) => {
            g.fillStyle(0xFFFFFF);
            g.fillRect(1, 1, 4, 4);
        });

        this.makeTex('bg', 800, 600, (g) => {
            const topColor = 0x87CEEB;
            const bottomColor = 0xE0F0FF;
            for (let y = 0; y < 600; y++) {
                const t = y / 600;
                const r = ((topColor >> 16) & 0xFF) * (1 - t) + ((bottomColor >> 16) & 0xFF) * t;
                const gn = ((topColor >> 8) & 0xFF) * (1 - t) + ((bottomColor >> 8) & 0xFF) * t;
                const b = (topColor & 0xFF) * (1 - t) + (bottomColor & 0xFF) * t;
                const color = (Math.round(r) << 16) | (Math.round(gn) << 8) | Math.round(b);
                g.fillStyle(color);
                g.fillRect(0, y, 800, 1);
            }
            g.fillStyle(0xFFFACD);
            g.fillCircle(680, 80, 40);
            g.fillStyle(0xFFFFE0);
            g.fillCircle(680, 80, 30);
            g.fillStyle(0xFFFFFF);
            g.fillEllipse(150, 80, 160, 50);
            g.fillEllipse(400, 120, 200, 60);
            g.fillEllipse(600, 160, 140, 45);
        });

        this.makeTex('hills', 800, 160, (g) => {
            g.fillStyle(0x6B8E23);
            g.fillEllipse(100, 160, 300, 120);
            g.fillEllipse(350, 160, 250, 100);
            g.fillEllipse(550, 160, 350, 140);
            g.fillEllipse(750, 160, 200, 80);
            g.fillStyle(0x8FBC5A);
            g.fillEllipse(200, 160, 200, 80);
            g.fillEllipse(500, 160, 250, 90);
            g.fillEllipse(700, 160, 180, 70);
        });

        for (let i = 0; i < 4; i++) {
            const w = [20, 16, 8, 16][i];
            this.makeTex(`coin-spin-${i}`, 20, 20, (g) => {
                const ox = (20 - w) / 2;
                g.fillStyle(0xFFD700);
                g.fillRect(ox, 2, w, 16);
                g.fillStyle(0xFFEC80);
                g.fillRect(ox + 2, 4, Math.max(1, w - 4), 12);
            });
        }
    }

    private makeTex(
        key: string,
        w: number,
        h: number,
        draw: (g: Phaser.GameObjects.Graphics) => void
    ): void {
        const g = this.add.graphics();
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
    }
}
