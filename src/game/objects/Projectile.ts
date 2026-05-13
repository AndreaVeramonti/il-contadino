import Phaser from 'phaser';

export class Projectile {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public active: boolean = true;
    public fromPlayer: boolean;
    private scene: Phaser.Scene;
    private lifetime: number = 3000;

    constructor(config: {
        scene: Phaser.Scene;
        x: number;
        y: number;
        direction: number;
        fromPlayer: boolean;
        texture?: string;
        speed?: number;
    }) {
        this.scene = config.scene;
        this.fromPlayer = config.fromPlayer;
        const tex = config.texture ?? (config.fromPlayer ? 'proj-player' : 'proj-enemy');
        const speed = config.speed ?? (config.fromPlayer ? 350 : 200);

        this.sprite = config.scene.physics.add.sprite(config.x, config.y, tex);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.sprite.setImmovable(true);
        this.sprite.setVelocityX(config.direction * speed);
        this.sprite.setFlipX(config.direction < 0);

        if (!config.fromPlayer) {
            this.sprite.setTint(0xFF4444);
            this.sprite.setScale(0.8);
        } else {
            this.sprite.setTint(0xFFFF00);
            this.sprite.setScale(0.7);
        }

        config.scene.time.delayedCall(this.lifetime, () => {
            this.destroy();
        });
    }

    update(): void {
        if (!this.active) return;
        // Destroy if out of world bounds
        const bounds = this.scene.physics.world.bounds;
        if (
            this.sprite.x < bounds.x - 50 ||
            this.sprite.x > bounds.x + bounds.width + 50 ||
            this.sprite.y < bounds.y - 50 ||
            this.sprite.y > bounds.y + bounds.height + 50
        ) {
            this.destroy();
        }
    }

    destroy(): void {
        if (!this.active) return;
        this.active = false;
        this.sprite.destroy();
    }
}
