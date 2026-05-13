import Phaser from 'phaser';

export class Key {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public collected: boolean = false;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'coin');
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.sprite.setImmovable(true);
        this.sprite.setTint(0xFFD700);
        this.sprite.setScale(0.9);
    }

    collect(): void {
        if (this.collected) return;
        this.collected = true;

        this.sprite.body!.enable = false;

        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 30,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => { this.sprite.destroy(); }
        });
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
