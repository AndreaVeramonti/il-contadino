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
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        if (this.victory) {
            this.add.text(512, 200, 'LIVELLO COMPLETATO!', {
                fontFamily: 'Georgia, serif',
                fontSize: '48px',
                color: '#FFD700',
                stroke: '#5C3A1E',
                strokeThickness: 6,
            }).setOrigin(0.5);

            this.add.image(512, 320, 'exit').setScale(2);
        } else {
            this.add.text(512, 200, 'GAME OVER', {
                fontFamily: 'Georgia, serif',
                fontSize: '56px',
                color: '#FF4444',
                stroke: '#2B1810',
                strokeThickness: 6,
            }).setOrigin(0.5);

            this.add.text(512, 300, 'Il corvo ha vinto...', {
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                color: '#CCCCCC',
                fontStyle: 'italic',
            }).setOrigin(0.5);
        }

        this.add.text(512, 420, `Punteggio: ${this.finalScore}`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#FFFFFF',
        }).setOrigin(0.5);

        const restartText = this.add.text(512, 500, 'CLICCA PER RICOMINCIARE', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#FFD700',
            stroke: '#2B1810',
            strokeThickness: 4,
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
