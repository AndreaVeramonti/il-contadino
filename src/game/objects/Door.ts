import Phaser from 'phaser';
import { Player } from './Player';

export class Door {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public opened: boolean = false;
    private scene: Phaser.Scene;
    private playerRef: Player;

    constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
        this.scene = scene;
        this.playerRef = player;
        this.sprite = scene.physics.add.sprite(x, y, 'exit');
        this.sprite.setTint(0x8B4513);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.sprite.setImmovable(true);
        this.sprite.setDepth(10);
    }

    tryOpen(): boolean {
        if (this.opened) return true;
        if (this.playerRef.hasKey) {
            this.opened = true;
            this.playerRef.hasKey = false;
            this.sprite.setTint(0x00FF00);
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.3,
                duration: 300,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    this.sprite.destroy();
                }
            });
            return true;
        }
        return false;
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
