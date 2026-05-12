import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    create(): void {
        this.genPlaceholderTextures();
        this.scene.start('Preloader');
    }

    // Generate textures only for things WITHOUT SVG equivalents
    private genPlaceholderTextures(): void {
        // Hay platform (no SVG for this)
        this.genTex('platform', 32, 32, (g) => {
            g.fillStyle(0xC8A951);
            g.fillRect(0, 0, 32, 32);
            g.fillStyle(0xB8983A);
            g.fillRect(0, 0, 32, 3);
            g.fillRect(0, 14, 32, 2);
            g.fillRect(0, 28, 32, 3);
        });

        // Sky gradient background
        this.genTex('bg', 960, 540, (g) => {
            const top = 0x87CEEB, bot = 0xE0F0FF;
            for (let y = 0; y < 540; y++) {
                const t = y / 540;
                const r = ((top>>16)&0xFF)*(1-t)+((bot>>16)&0xFF)*t;
                const gn = ((top>>8)&0xFF)*(1-t)+((bot>>8)&0xFF)*t;
                const b = (top&0xFF)*(1-t)+(bot&0xFF)*t;
                g.fillStyle((Math.round(r)<<16)|(Math.round(gn)<<8)|Math.round(b));
                g.fillRect(0, y, 960, 1);
            }
            g.fillStyle(0xFFFACD);
            g.fillCircle(816, 80, 40);
            g.fillStyle(0xFFFFE0);
            g.fillCircle(816, 80, 30);
            g.fillStyle(0xFFFFFF);
            g.fillEllipse(180, 80, 160, 50);
            g.fillEllipse(480, 120, 200, 60);
            g.fillEllipse(720, 160, 140, 45);
        });

        // Parallax hills
        this.genTex('hills', 960, 160, (g) => {
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

        // Particle for effects
        this.genTex('particle', 6, 6, (g) => {
            g.fillStyle(0xFFFFFF);
            g.fillRect(1, 1, 4, 4);
        });

        // Coin spin frames (fallback — SVG coin is static)
        for (let i = 0; i < 4; i++) {
            const w = [20, 16, 8, 16][i];
            this.genTex(`coin-spin-${i}`, 20, 20, (g) => {
                const ox = (20 - w) / 2;
                g.fillStyle(0xFFD700);
                g.fillRect(ox, 2, w, 16);
                g.fillStyle(0xFFEC80);
                g.fillRect(ox + 2, 4, Math.max(1, w - 4), 12);
            });
        }
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
