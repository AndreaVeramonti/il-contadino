import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }
    create(): void {
        this.cameras.main.setBackgroundColor('#E8E4D4');

        // Mountains in lower half
        this.add.image(480, 440, 'mountain-bg').setAlpha(0.4).setScale(1);

        // Title
        this.add.text(480, 160, 'IL CONTADINO', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '60px',
            color: '#1A1A1A',
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(480, 225, 'Un\'avventura nei campi', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '22px',
            color: '#3D6B35',
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // Terreno blocks as decoration
        this.add.image(280, 310, 'terreno').setScale(1.2);
        this.add.image(680, 310, 'terreno').setScale(1.2);

        // Start prompt
        const startText = this.add.text(480, 400, 'CLICCA PER INIZIARE', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '28px',
            color: '#CC2200',
            stroke: '#1A1A1A',
            strokeThickness: 2,
        }).setOrigin(0.5);
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        // Controls hint
        this.add.text(480, 478, 'WASD / Frecce = muoviti   |   Z = attacca  |   Sopra i nemici = schiacciali', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '14px',
            color: '#3D6B35',
            align: 'center',
        }).setOrigin(0.5);

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
