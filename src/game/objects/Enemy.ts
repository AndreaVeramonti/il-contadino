import Phaser from 'phaser';
import { EnemyType, ENEMY_CONFIG } from './EnemyTypes';
import { Player } from './Player';

export class Enemy {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public alive: boolean = true;
    public readonly enemyType: EnemyType;
    public readonly stompable: boolean;
    private scene: Phaser.Scene;
    private config: ReturnType<typeof this.getConfig>;
    private speed: number;
    private patrolLeft: number;
    private patrolRight: number;
    private moveTimer: Phaser.Time.TimerEvent;
    private playerRef?: Player;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        type: EnemyType = 'crow',
        player?: Player,
        patrolRange?: number,
    ) {
        this.scene = scene;
        this.enemyType = type;
        this.config = ENEMY_CONFIG[type];
        this.speed = this.config.speed;
        this.stompable = this.config.stompable;
        this.playerRef = player;

        const range = patrolRange ?? this.config.patrolRange;
        this.patrolLeft = x - range;
        this.patrolRight = x + range;

        this.sprite = scene.physics.add.sprite(x, y, this.config.texture);
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

    private getConfig() {
        return ENEMY_CONFIG[this.enemyType];
    }

    update(): void {
        if (!this.alive) return;

        const body = this.sprite.body as Phaser.Physics.Arcade.Body;

        // Boar charge behavior
        if (this.enemyType === 'boar' && this.playerRef?.alive) {
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.playerRef.sprite.x, this.playerRef.sprite.y,
            );
            if (dist < this.config.chargeRange) {
                // Charge toward player
                const dir = this.playerRef.sprite.x < this.sprite.x ? -1 : 1;
                this.sprite.setVelocityX(dir * this.config.chargeSpeed);
                this.sprite.setFlipX(dir > 0);
                return; // Skip normal patrol when charging
            }
        }

        // Patrol behavior (crow, snail, or boar not in charge range)
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

    stomp(): boolean {
        if (!this.stompable) return false;

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
        return true;
    }

    kill(): void {
        this.alive = false;
        this.sprite.body!.enable = false;
        this.moveTimer.destroy();
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 300,
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
