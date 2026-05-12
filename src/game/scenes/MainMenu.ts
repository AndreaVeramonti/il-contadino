import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create(): void {
        this.add.image(480, 270, 'bg');
        this.add.image(480, 162, 'hills').setAlpha(0.3);

        this.add.text(480, 180, 'IL CONTADINO', {
            fontFamily: 'Georgia, serif',
            fontSize: '56px',
            color: '#2B1810',
            stroke: '#C8A951',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(480, 243, 'Un\'avventura nei campi', {
            fontFamily: 'Georgia, serif',
            fontSize: '22px',
            color: '#5C3A1E',
            fontStyle: 'italic',
        }).setOrigin(0.5);

        this.add.image(320, 324, 'platform').setScale(1.5);
        this.add.image(640, 324, 'platform').setScale(1.5);

        const startText = this.add.text(480, 414, 'CLICCA PER INIZIARE', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#5C3A1E',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        this.add.text(480, 477, 'WASD / Frecce = muoviti   |   Spazio = salta   |   Sopra i nemici = schiacciali', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#5C3A1E',
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
