import Phaser from 'phaser';

export class Coin {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public collected: boolean = false;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'coin');
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.sprite.setImmovable(true);
        this.sprite.setScale(1.2);
    }

    collect(): void {
        if (this.collected) return;
        this.collected = true;

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            y: this.sprite.y - 30,
            duration: 300,
            onComplete: () => { this.sprite.destroy(); }
        });
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
