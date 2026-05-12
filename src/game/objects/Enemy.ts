import Phaser from 'phaser';

export class Enemy {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public alive: boolean = true;
    private scene: Phaser.Scene;
    private speed: number = 60;
    private patrolLeft: number;
    private patrolRight: number;
    private moveTimer: Phaser.Time.TimerEvent;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        patrolRange: number = 80
    ) {
        this.scene = scene;
        this.patrolLeft = x - patrolRange;
        this.patrolRight = x + patrolRange;

        this.sprite = scene.physics.add.sprite(x, y, 'enemy');
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setSize(22, 20);
        this.sprite.setOffset(3, 4);
        this.sprite.setVelocityX(-this.speed);

        this.moveTimer = scene.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => this.reverseDirection(),
        });
    }

    update(): void {
        if (!this.alive) return;

        const body = this.sprite.body as Phaser.Physics.Arcade.Body;

        if (this.sprite.x <= this.patrolLeft) {
            this.sprite.setVelocityX(this.speed);
            this.sprite.setFlipX(true);
        } else if (this.sprite.x >= this.patrolRight) {
            this.sprite.setVelocityX(-this.speed);
            this.sprite.setFlipX(false);
        }

        if (body.velocity.x < 0) {
            this.sprite.setFlipX(false);
        } else if (body.velocity.x > 0) {
            this.sprite.setFlipX(true);
        }
    }

    private reverseDirection(): void {
        if (!this.alive) return;
        this.sprite.setVelocityX(-this.sprite.body!.velocity.x);
    }

    stomp(): void {
        this.alive = false;
        this.sprite.body!.enable = false;
        this.sprite.setTexture('enemy-flat');
        this.sprite.setAlpha(0.7);
        this.moveTimer.destroy();

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 600,
            delay: 200,
            onComplete: () => {
                this.sprite.destroy();
            }
        });
    }

    destroy(): void {
        this.moveTimer.destroy();
        this.sprite.destroy();
    }
}
