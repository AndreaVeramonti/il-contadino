import Phaser from 'phaser';

export type PowerUpType = 'invincible' | 'speed' | 'kill' | 'points';

const POWERUP_CONFIG: Record<PowerUpType, {
    texture: string;
    color: number;
    duration: number;
    label: string;
    svg: string;
}> = {
    invincible: { texture: 'powerup', color: 0x00FF00, duration: 10000, label: 'INVINCIBILITÀ!', svg: 'powerup' },
    speed:     { texture: 'pu-speed', color: 0xFFFF00, duration: 8000,  label: 'SUPER VELOCITÀ!', svg: 'thunder' },
    kill:      { texture: 'pu-kill',  color: 0xFF4444, duration: 8000,  label: 'FALCE MORTALE!', svg: 'scissor' },
    points:    { texture: 'pu-points',color: 0xFFA500, duration: 10000, label: 'PUNTI DOPPI!', svg: 'food' },
};

export class PowerUp {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public collected: boolean = false;
    public readonly type: PowerUpType;
    public readonly config: typeof POWERUP_CONFIG[PowerUpType];
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType = 'invincible') {
        this.scene = scene;
        this.type = type;
        this.config = POWERUP_CONFIG[type];

        this.sprite = scene.physics.add.sprite(x, y, this.config.texture);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.allowGravity = false;
        this.sprite.setImmovable(true);
        this.sprite.setTint(this.config.color);

        scene.tweens.add({
            targets: this.sprite,
            y: y - 8,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        scene.tweens.add({
            targets: this.sprite,
            alpha: 0.5,
            duration: 500,
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
            scaleX: 1.8,
            scaleY: 1.8,
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

export function getPowerUpLabel(type: PowerUpType): string {
    return POWERUP_CONFIG[type].label;
}
