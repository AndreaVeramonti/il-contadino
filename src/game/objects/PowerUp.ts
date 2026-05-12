import Phaser from 'phaser';

export class PowerUp {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public collected: boolean = false;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'powerup');
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.sprite.setImmovable(true);

        scene.tweens.add({
            targets: this.sprite,
            y: y - 6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        scene.tweens.add({
            targets: this.sprite,
            alpha: 0.6,
            duration: 600,
            yoyo: true,
            repeat: -1,
        });
    }

    collect(): void {
        if (this.collected) return;
        this.collected = true;

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            onComplete: () => {
                this.sprite.destroy();
            }
        });
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
