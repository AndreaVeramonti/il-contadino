import Phaser from 'phaser';
import { EnemyType, ENEMY_CONFIG } from './EnemyTypes';
import { Player } from './Player';

export class Enemy {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public alive: boolean = true;
    public readonly enemyType: EnemyType;
    public readonly stompable: boolean;
    public hp: number;
    public readonly maxHp: number;
    private scene: Phaser.Scene;
    private config: ReturnType<typeof this.getConfig>;
    private speed: number;
    private patrolLeft: number;
    private patrolRight: number;
    private moveTimer: Phaser.Time.TimerEvent;
    private playerRef?: Player;
    private regenTimer?: Phaser.Time.TimerEvent;
    private bossPhase: 1 | 2 | 3 = 1;
    private bossSlamCooldown: number = 0;
    private bossShootCooldown: number = 0;
    private hpBar?: Phaser.GameObjects.Rectangle;
    private hpBarBg?: Phaser.GameObjects.Rectangle;

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
        this.maxHp = this.config.hp;
        this.hp = this.config.hp;
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

        if (type === 'boss') {
            const bw = this.sprite.displayWidth;
            this.hpBarBg = scene.add.rectangle(this.sprite.x, this.sprite.y - this.sprite.displayHeight - 8, bw + 4, 6, 0x333333).setDepth(50);
            this.hpBar = scene.add.rectangle(this.sprite.x, this.sprite.y - this.sprite.displayHeight - 8, bw, 4, 0xFF0000).setDepth(51);
        }

        // Skeleton: setup regen timer
        if (type === 'skeleton' && this.config.regenDelay) {
            this.regenTimer = scene.time.addEvent({
                delay: this.config.regenDelay,
                loop: true,
                callback: () => this.regenSkeleton(),
            });
        }
    }

    private getConfig() {
        return ENEMY_CONFIG[this.enemyType];
    }

    update(): void {
        if (!this.alive) return;

        const body = this.sprite.body as Phaser.Physics.Arcade.Body;

        // Fly: follow player in X and Y
        if (this.enemyType === 'fly' && this.playerRef?.alive) {
            body.allowGravity = false;
            const dx = this.playerRef.sprite.x - this.sprite.x;
            const dy = this.playerRef.sprite.y - this.sprite.y;
            const angle = Math.atan2(dy, dx);
            this.sprite.setVelocity(
                Math.cos(angle) * (this.config.flySpeed ?? 100),
                Math.sin(angle) * (this.config.flySpeed ?? 100),
            );
            this.sprite.setFlipX(dx > 0);
            return;
        }

        // Boar charge behavior
        if (this.enemyType === 'boar' && this.playerRef?.alive) {
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.playerRef.sprite.x, this.playerRef.sprite.y,
            );
            if (dist < this.config.chargeRange) {
                const dir = this.playerRef.sprite.x < this.sprite.x ? -1 : 1;
                this.sprite.setVelocityX(dir * this.config.chargeSpeed);
                this.sprite.setFlipX(dir > 0);
                return;
            }
        }

        // Ghost: sine wave vertical oscillation
        if (this.enemyType === 'ghost') {
            body.allowGravity = false;
            const waveAmp = this.config.waveAmplitude ?? 30;
            const waveFreq = this.config.waveFrequency ?? 0.003;
            const waveY = Math.sin(this.scene.time.now * waveFreq) * waveAmp;
            this.sprite.setVelocityY(waveY);
        }

        // Archer: shoot at player
        if (this.enemyType === 'archer' && this.playerRef?.alive) {
            this.checkArcherShot();
        }

        if (this.enemyType === 'boss' && this.playerRef?.alive) {
            this.updateBossHPBar();
            const dist = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.playerRef.sprite.x, this.playerRef.sprite.y,
            );
            const hpPct = this.hp / this.maxHp;
            if (hpPct <= 0.3) this.bossPhase = 3;
            else if (hpPct <= 0.6) this.bossPhase = 2;
            const dir = this.playerRef.sprite.x < this.sprite.x ? -1 : 1;
            this.sprite.setFlipX(dir > 0);

            if (this.bossPhase === 1) {
                if (dist < this.config.chargeRange) {
                    this.sprite.setVelocityX(dir * this.config.chargeSpeed);
                } else {
                    this.sprite.setVelocityX(0);
                }
                body.allowGravity = true;
            } else if (this.bossPhase === 2) {
                if (dist < this.config.chargeRange) {
                    this.sprite.setVelocityX(dir * (this.config.chargeSpeed * 0.7));
                } else {
                    this.sprite.setVelocityX(0);
                }
                this.bossShootCooldown -= this.scene.game.loop.delta;
                if (this.bossShootCooldown <= 0 && dist < (this.config.shootRange ?? 300)) {
                    this.bossShootCooldown = this.config.shootCooldown ?? 2000;
                    this.scene.events.emit('enemy-shot', {
                        x: this.sprite.x + dir * 20,
                        y: this.sprite.y - 20,
                        direction: dir,
                    });
                }
                body.allowGravity = true;
            } else if (this.bossPhase === 3) {
                body.allowGravity = true;
                const onGround = body.blocked.down;
                if (onGround) {
                    this.bossSlamCooldown -= this.scene.game.loop.delta;
                    if (dist < this.config.chargeRange) {
                        this.sprite.setVelocityX(dir * (this.config.chargeSpeed * 0.85));
                    }
                    if (this.bossSlamCooldown <= 0 && dist < 200) {
                        this.bossSlamCooldown = 4000;
                        this.sprite.setVelocityY(-350);
                        this.scene.events.emit('boss-slam', {
                            x: this.sprite.x,
                            y: this.sprite.y,
                        });
                    }
                }
            }
            return;
        }

        // Patrol behavior
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

    private lastShotTime: number = 0;

    private checkArcherShot(): void {
        if (!this.playerRef?.alive) return;
        const now = this.scene.time.now;
        const cooldown = this.config.shootCooldown ?? 2500;
        if (now - this.lastShotTime < cooldown) return;
        const dist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            this.playerRef.sprite.x, this.playerRef.sprite.y,
        );
        if (dist > (this.config.shootRange ?? 200)) return;
        this.lastShotTime = now;
        const dir = this.playerRef.sprite.x < this.sprite.x ? -1 : 1;
        this.scene.events.emit('enemy-shot', {
            x: this.sprite.x + dir * 16,
            y: this.sprite.y - 16,
            direction: dir,
        });
    }

    private reverseDirection(): void {
        if (!this.alive) return;
        this.sprite.setVelocityX(-this.sprite.body!.velocity.x);
    }

    takeDamage(amount: number): void {
        if (!this.alive) return;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.kill();
        } else {
            // Flash white briefly on hit
            this.sprite.setTint(0xFFFFFF);
            this.scene.time.delayedCall(100, () => {
                if (this.sprite.active) this.sprite.clearTint();
            });

        }
    }

    private updateBossHPBar(): void {
        if (!this.hpBar || !this.hpBarBg) return;
        const w = this.sprite.displayWidth * Math.max(0, this.hp / this.maxHp);
        this.hpBar.setSize(w, 4);
        this.hpBar.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight - 8);
        this.hpBarBg.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight - 8);
        const pct = this.hp / this.maxHp;
        if (pct > 0.6) this.hpBar.setFillStyle(0x00FF00);
        else if (pct > 0.3) this.hpBar.setFillStyle(0xFFFF00);
        else this.hpBar.setFillStyle(0xFF0000);
    }

    private regenSkeleton(): void {
        if (!this.alive || this.enemyType !== 'skeleton') return;
        if (this.hp < this.maxHp) {
            this.sprite.setTint(0x88FF88);
            // Heal 1 HP after a short visual delay
            this.scene.time.delayedCall(800, () => {
                if (!this.alive) return;
                if (this.hp < this.maxHp) {
                    this.hp++;
                    // Flash heal feedback
                    this.sprite.setTint(0x00FF00);
                    this.scene.time.delayedCall(200, () => {
                        if (this.sprite.active) this.sprite.clearTint();
                    });
                }
            });
        }
    }

    stomp(): boolean {
        if (!this.stompable) return false;
        if (this.hp <= 1) {
            // Final blow: flatten and die
            this.alive = false;
            this.sprite.body!.enable = false;
            this.sprite.setTexture('enemy-flat');
            this.sprite.setAlpha(0.7);
            if (this.moveTimer) this.moveTimer.destroy();
            if (this.regenTimer) this.regenTimer.destroy();
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
        } else {
            // Stomp does 1 damage, enemy survives
            this.takeDamage(1);
            // Bounce player up regardless
            return true;
        }
    }

    kill(): void {
        this.alive = false;
        this.sprite.body!.enable = false;
        this.moveTimer.destroy();
        if (this.regenTimer) this.regenTimer.destroy();
        if (this.hpBar) this.hpBar.destroy();
        if (this.hpBarBg) this.hpBarBg.destroy();
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
        if (this.regenTimer) this.regenTimer.destroy();
        if (this.hpBar) this.hpBar.destroy();
        if (this.hpBarBg) this.hpBarBg.destroy();
        this.sprite.destroy();
    }
}
