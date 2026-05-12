import Phaser from 'phaser';

export class Coin {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public collected: boolean = false;
    private scene: Phaser.Scene;
    private spinIndex: number = 0;
    private spinTimer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'coin');
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.sprite.setImmovable(true);

        this.spinTimer = scene.time.addEvent({
            delay: 150,
            loop: true,
            callback: () => {
                this.spinIndex = (this.spinIndex + 1) % 4;
                this.sprite.setTexture(`coin-spin-${this.spinIndex}`);
            }
        });
    }

    collect(): void {
        if (this.collected) return;
        this.collected = true;
        this.spinTimer.destroy();

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            y: this.sprite.y - 30,
            duration: 300,
            onComplete: () => {
                this.sprite.destroy();
            }
        });
    }

    destroy(): void {
        this.spinTimer.destroy();
        this.sprite.destroy();
    }
}
