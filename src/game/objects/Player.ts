import Phaser from 'phaser';

export class Player {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public alive: boolean = true;
    public invincible: boolean = false;
    public hasPowerup: boolean = false;

    private scene: Phaser.Scene;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private speed: number = 200;
    private jumpSpeed: number = -420;

    constructor(config: { scene: Phaser.Scene; x: number; y: number }) {
        this.scene = config.scene;
        this.sprite = this.scene.physics.add.sprite(config.x, config.y, 'player-idle');
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setSize(20, 32);
        this.sprite.setOffset(4, 4);
        this.sprite.setCollideWorldBounds(true);
        (this.sprite.body as Phaser.Physics.Arcade.Body).setMaxVelocityY(600);
        this.setupInput();
    }

    private setupInput(): void {
        const kb = this.scene.input.keyboard!;
        this.cursors = kb.createCursorKeys();
        this.wasd = {
            W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update(): void {
        if (!this.alive) return;
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        const onGround = body.blocked.down || body.touching.down;
        const left = this.cursors.left.isDown || this.wasd.A.isDown;
        const right = this.cursors.right.isDown || this.wasd.D.isDown;

        if (left) { this.sprite.setVelocityX(-this.speed); this.sprite.setFlipX(true); }
        else if (right) { this.sprite.setVelocityX(this.speed); this.sprite.setFlipX(false); }
        else { this.sprite.setVelocityX(0); }

        const jump = this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown;
        if (jump && onGround) this.sprite.setVelocityY(this.jumpSpeed);
    }

    hit(damage: number = 1): boolean {
        if (!this.alive || this.invincible) return false;
        this.scene.events.emit('player-hit', damage);
        return true;
    }

    makeInvincible(duration: number = 1500): void {
        this.invincible = true;
        this.scene.tweens.add({
            targets: this.sprite, alpha: 0.4, duration: 100,
            yoyo: true, repeat: Math.floor(duration / 200),
            onComplete: () => { this.sprite.setAlpha(1); this.invincible = false; }
        });
    }

    activatePowerup(): void {
        this.hasPowerup = true;
        this.sprite.setTexture('player-power');
        this.scene.time.delayedCall(10000, () => {
            this.hasPowerup = false;
            this.sprite.setTexture('player-idle');
        });
    }

    die(): void {
        this.alive = false;
        this.sprite.setVelocity(0, -300);
        this.sprite.setTint(0xFF0000);
        this.scene.tweens.add({
            targets: this.sprite, alpha: 0, duration: 1000,
            onComplete: () => { this.scene.events.emit('player-died'); }
        });
    }

    destroy(): void { this.sprite.destroy(); }
}
