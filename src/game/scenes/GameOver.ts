import { Scene } from 'phaser';

export class GameOver extends Scene {
    private victory: boolean = false;
    private finalScore: number = 0;
    constructor() {
        super('GameOver');
    }
    init(data: { victory?: boolean; score?: number }): void {
        this.victory = data?.victory ?? false;
        this.finalScore = data?.score ?? 0;
    }
    create(): void {
        this.cameras.main.setBackgroundColor('#F7F6F0');

        if (this.victory) {
            this.add.text(480, 170, 'LIVELLO COMPLETATO!', {
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '48px',
                color: '#3D6B35',
                stroke: '#1A1A1A',
                strokeThickness: 2,
            }).setOrigin(0.5);
            this.add.image(480, 270, 'exit').setScale(2);
        } else {
            this.add.text(480, 180, 'GAME OVER', {
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '56px',
                color: '#CC2200',
                stroke: '#1A1A1A',
                strokeThickness: 2,
            }).setOrigin(0.5);
            this.add.text(480, 260, 'Il corvo ha vinto...', {
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '24px',
                color: '#3D6B35',
                fontStyle: 'italic',
            }).setOrigin(0.5);
        }

        this.add.text(480, 370, `PUNTEGGIO: ${this.finalScore}`, {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '28px',
            color: '#1A1A1A',
        }).setOrigin(0.5);

        const restartText = this.add.text(480, 440, 'CLICCA PER RICOMINCIARE', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '22px',
            color: '#CC2200',
            stroke: '#1A1A1A',
            strokeThickness: 2,
        }).setOrigin(0.5);
        this.tweens.add({
            targets: restartText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainMenu');
        });
        this.input.keyboard?.once('keydown-ENTER', () => {
            this.scene.start('MainMenu');
        });
    }
}
