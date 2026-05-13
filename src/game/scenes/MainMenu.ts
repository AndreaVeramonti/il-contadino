import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }
    create(): void {
        this.cameras.main.setBackgroundColor('#F7F6F0');

        // Mountains as decorative background (lower area, behind everything)
        this.add.image(480, 400, 'mountain-bg').setAlpha(0.3).setScale(1).setDepth(0);
        this.add.image(480, 420, 'mountain-fg').setAlpha(0.25).setScale(0.9).setDepth(0);

        // Title
        this.add.text(480, 140, 'IL CONTADINO', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '60px',
            color: '#1A1A1A',
        }).setOrigin(0.5).setDepth(10);

        // Subtitle
        this.add.text(480, 205, 'Un\'avventura nei campi', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '22px',
            color: '#3D6B35',
            fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(10);

        // Terreno blocks as decoration
        this.add.image(280, 300, 'terreno').setScale(1.2).setDepth(5);
        this.add.image(680, 300, 'terreno').setScale(1.2).setDepth(5);

        // Start prompt
        const startText = this.add.text(480, 410, 'CLICCA PER INIZIARE', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '28px',
            color: '#CC2200',
            stroke: '#1A1A1A',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(10);
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        // Controls hint
        this.add.text(480, 510, 'WASD / Frecce = muoviti   |   Z = attacca  |   Sopra i nemici = schiacciali', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '14px',
            color: '#3D6B35',
            align: 'center',
        }).setOrigin(0.5).setDepth(10);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('Game');
        });
        this.input.keyboard?.once('keydown-ENTER', () => {
            this.scene.start('Game');
        });
    }
}
