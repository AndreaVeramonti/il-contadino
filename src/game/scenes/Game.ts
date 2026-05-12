import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Coin } from '../objects/Coin';
import { Enemy } from '../objects/Enemy';
import { EnemyType } from '../objects/EnemyTypes';
import { PowerUp, getPowerUpLabel, PowerUpType } from '../objects/PowerUp';
import { LEVEL_1, LEVEL_1_WIDTH, parseLevel } from '../levels/Level1';
import { LEVEL_2, LEVEL_2_WIDTH } from '../levels/Level2';
import { LEVEL_3, LEVEL_3_WIDTH } from '../levels/Level3';
import { SoundManager } from '../systems/SoundManager';

const TILE = 32;

export class Game extends Scene {
    private player!: Player;
    private enemies: Enemy[] = [];
    private coins: Coin[] = [];
    private powerups: PowerUp[] = [];
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private exitSprite!: Phaser.Physics.Arcade.Sprite;
    private levelComplete: boolean = false;
    private score: number = 0;
    private coinCount: number = 0;
    private lives: number = 3;
    private comboCount: number = 0;
    private comboText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private coinText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;
    private respawning: boolean = false;
    private soundManager!: SoundManager;
    private exitIndicator!: Phaser.GameObjects.Text;
    private currentLevel: number = 1;
    private waterGroup!: Phaser.Physics.Arcade.StaticGroup;
    private breakableBlocks!: Phaser.Physics.Arcade.StaticGroup;

    constructor() { super('Game'); }

    init(data: { level?: number }): void {
        this.currentLevel = data?.level ?? 1;
    }

    create(): void {
        this.levelComplete = false;
        this.respawning = false;
        this.enemies = [];
        this.coins = [];
        this.powerups = [];

        this.soundManager = new SoundManager();

        let levelData: ReturnType<typeof parseLevel>;
        let worldW: number;
        const worldH = 18 * TILE;

        switch (this.currentLevel) {
            case 2:
                worldW = LEVEL_2_WIDTH * TILE;
                levelData = parseLevel(LEVEL_2, TILE);
                break;
            case 3:
                worldW = LEVEL_3_WIDTH * TILE;
                levelData = parseLevel(LEVEL_3, TILE);
                break;
            default:
                worldW = LEVEL_1_WIDTH * TILE;
                levelData = parseLevel(LEVEL_1, TILE);
                break;
        }
        this.physics.world.setBounds(0, 0, worldW, worldH);

        this.add.image(400, 300, 'bg').setScrollFactor(0);
        const hillsBg = this.add.tileSprite(0, worldH - 240, 800, 160, 'hills');
        hillsBg.setOrigin(0, 0).setScrollFactor(0.3).setAlpha(0.5);

        // Build platforms
        this.platforms = this.physics.add.staticGroup();
        for (const p of levelData.platforms) {
            const type = p.type === 'dirt' ? 'dirt' : p.type === 'platform' ? 'platform' : 'ground';
            this.platforms.create(p.x, p.y, type);
        }
        this.platforms.refresh();

        const levelCols = Math.floor(worldW / TILE);
        for (let col = 4; col < levelCols; col += 18) {
            const tx = col * TILE + TILE / 2;
            const ty = 13 * TILE + TILE / 2 - 24;
            this.add.image(tx, ty, 'tree').setDepth(5);
        }
        for (let col = 2; col < levelCols; col += 7) {
            const fx = col * TILE + TILE / 2;
            const fy = 13 * TILE + TILE / 2 - 18;
            this.add.image(fx, fy, 'flower').setDepth(4).setAlpha(0.8);
        }

        // Coins
        for (const c of levelData.coins) {
            this.coins.push(new Coin(this, c.x, c.y));
        }

        // Powerups
        for (const u of levelData.powerups) {
            this.powerups.push(new PowerUp(this, u.x, u.y, u.type as PowerUpType));
        }

        // Water tiles (death zone)
        this.waterGroup = this.physics.add.staticGroup();
        for (const w of levelData.water) {
            this.waterGroup.create(w.x, w.y, 'water').setTint(0x3388FF).setAlpha(0.7).setDepth(1);
        }
        this.waterGroup.refresh();

        // Breakable blocks (?)
        this.breakableBlocks = this.physics.add.staticGroup();
        for (const b of levelData.breakables) {
            this.breakableBlocks.create(b.x, b.y, 'dirt').setTint(0xFFD700).setDepth(2);
        }
        this.breakableBlocks.refresh();

        if (levelData.exit) {
            this.exitSprite = this.physics.add.sprite(levelData.exit.x, levelData.exit.y - 16, 'exit');
            const body = this.exitSprite.body as Phaser.Physics.Arcade.Body;
            body.allowGravity = false;
            body.setSize(48, 48);
            this.exitSprite.setImmovable(true);
            this.exitSprite.setOrigin(0.5, 1);
            this.exitSprite.setDepth(10);
        }

        // Player
        this.player = new Player({
            scene: this,
            x: levelData.playerSpawn.x,
            y: levelData.playerSpawn.y - 18,
        });

        // Enemies (after player so they can reference it)
        for (const e of levelData.enemies) {
            this.enemies.push(new Enemy(this, e.x, e.y, (e.type as EnemyType) || 'crow', this.player));
        }

        // Camera
        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 50);

        // Physics collisions
        this.physics.add.collider(this.player.sprite, this.platforms);
        for (const e of this.enemies) {
            this.physics.add.collider(e.sprite, this.platforms);
            this.physics.add.overlap(this.player.sprite, e.sprite, () => this.playerEnemyCollision(e));
        }
        for (const c of this.coins) {
            this.physics.add.overlap(this.player.sprite, c.sprite, () => this.collectCoin(c));
        }
        for (const p of this.powerups) {
            this.physics.add.overlap(this.player.sprite, p.sprite, () => this.collectPowerup(p));
        }
        if (this.exitSprite) {
            this.physics.add.overlap(this.player.sprite, this.exitSprite, () => this.reachExit());
        }
        // Breakable blocks (collider so player stands on them)
        this.physics.add.collider(this.player.sprite, this.breakableBlocks, (_obj1, block) => {
            const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
            // Break from below: player hitting block while moving up
            if (pBody.velocity.y < 0) {
                const bs = block as Phaser.Physics.Arcade.Sprite;
                this.breakBlock(bs);
            }
        });

        // Water collision = death
        if (this.waterGroup.getLength() > 0) {
            this.physics.add.overlap(this.player.sprite, this.waterGroup, () => this.onWaterTouch());
        }

        // Exit indicator
        this.exitIndicator = this.add.text(0, 0, '▼', {
            fontFamily: 'Arial', fontSize: '24px', color: '#00FF00',
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

        this.createHUD();
        this.events.on('player-hit', (dmg: number) => this.onPlayerHit(dmg));
        this.events.on('player-died', () => this.onPlayerDied());

        this.soundManager.startMusic();

        this.events.on('player-jumped', () => this.soundManager.playJump());
    }

    update(): void {
        if (this.levelComplete || this.respawning) return;
        this.player.update();
        for (const e of this.enemies) if (e.alive) e.update();
        this.updateExitIndicator();
    }

    private updateExitIndicator(): void {
        if (!this.exitSprite) { this.exitIndicator.setVisible(false); return; }
        const exitX = this.exitSprite.x;
        const exitY = this.exitSprite.y;
        const cam = this.cameras.main;
        const margin = 40;
        const insideX = exitX > cam.scrollX + margin && exitX < cam.scrollX + cam.width - margin;
        const insideY = exitY > cam.scrollY + margin && exitY < cam.scrollY + cam.height - margin;
        if (insideX && insideY) {
            this.exitIndicator.setVisible(false);
            return;
        }
        const cx = cam.width / 2;
        const cy = cam.height / 2;
        const dx = exitX - (cam.scrollX + cx);
        const dy = exitY - (cam.scrollY + cy);
        const angle = Math.atan2(dy, dx);
        const edgeX = cx + Math.cos(angle) * (cx - margin);
        const edgeY = cy + Math.sin(angle) * (cy - margin);
        this.exitIndicator.setPosition(edgeX, edgeY).setVisible(true);
        this.exitIndicator.setRotation(angle + Math.PI / 2);
    }

    private breakBlock(block: Phaser.Physics.Arcade.Sprite): void {
        const bx = block.x;
        const by = block.y;
        this.spawnParticles(bx, by, 10, 0xFFD700, 'particle');
        block.destroy();
        this.score += 5;
        this.comboCount++;
        this.updateHUD();
        this.soundManager.playCoin();
        this.showFloatingScore(bx, by, '+5', 0xFFD700);
    }

    private spawnParticles(x: number, y: number, count: number, color: number, textureKey: string = 'particle'): void {
        const emitter = this.add.particles(x, y, textureKey, {
            speed: { min: 60, max: 180 },
            angle: { min: 200, max: 340 },
            scale: { start: 1.2, end: 0 },
            lifespan: 600,
            gravityY: 250,
            quantity: count,
            tint: color,
            emitting: false,
        });
        emitter.explode(count);
        this.time.delayedCall(700, () => { if (emitter && emitter.active) emitter.destroy(); });
    }

    private showFloatingScore(x: number, y: number, text: string, color: number = 0xFFFFFF): void {
        const label = this.add.text(x, y - 10, text, {
            fontFamily: 'Arial', fontSize: '16px', color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000', strokeThickness: 3, fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(200);
        this.tweens.add({
            targets: label, y: y - 60, alpha: 0, duration: 800, ease: 'Power2',
            onComplete: () => label.destroy(),
        });
    }

    private collectCoin(coin: Coin): void {
        if (coin.collected || this.respawning) return;
        coin.collect();
        this.coinCount++;
        this.comboCount++;
        const bonus = Math.min(this.comboCount, 5);
        const multiplier = this.player.doublePoints ? 2 : 1;
        this.score += 10 * bonus * multiplier;
        this.updateHUD();
        this.soundManager.playCoin();
        this.spawnParticles(coin.sprite.x, coin.sprite.y, 8, 0xFFD700);
        this.cameras.main.shake(50, 0.003);
        this.showFloatingScore(coin.sprite.x, coin.sprite.y, `+${10 * bonus * multiplier}`, 0xFFD700);
        if (this.comboCount >= 3) {
            const label = multiplier > 1 ? `+${10 * bonus * multiplier} (x${this.comboCount}) DOPPIO!` : `+${10 * bonus} (x${this.comboCount})`;
            this.showCombo(label);
        }
    }

    private playerEnemyCollision(enemy: Enemy): void {
        if (!enemy.alive || !this.player.alive || this.respawning) return;

        // Kill mode: any contact kills the enemy (bypasses stompable check)
        if (this.player.killMode) {
            enemy.kill();
            const pts = this.player.doublePoints ? 100 : 50;
            this.score += pts;
            this.comboCount++;
            this.updateHUD();
            this.player.sprite.setVelocityY(-200);
            this.spawnParticles(enemy.sprite.x, enemy.sprite.y, 10, 0xFF4444);
            this.soundManager.playStomp();
            this.showCombo(`+${pts} FALCE!`);
            return;
        }

        const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        const eBody = enemy.sprite.body as Phaser.Physics.Arcade.Body;
        if (pBody.velocity.y > 0 && (pBody.y + pBody.height) < (eBody.y + 20) && enemy.stompable) {
            enemy.stomp();
            const pts = this.player.doublePoints ? 100 : 50;
            this.score += pts;
            this.comboCount++;
            this.updateHUD();
            this.player.sprite.setVelocityY(-300);
            this.soundManager.playStomp();
            this.spawnParticles(enemy.sprite.x, enemy.sprite.y, 12, 0xFF4444);
            this.cameras.main.shake(100, 0.005);
            this.showCombo(`+${pts}`);
        } else if (!this.player.invincible) {
            this.comboCount = 0;
            this.player.hit(1);
        }
    }

    private onWaterTouch(): void {
        if (this.respawning) return;
        this.soundManager.playHit();
        this.lives = 0;
        this.updateHUD();
        this.player.die();
    }

    private collectPowerup(powerup: PowerUp): void {
        if (powerup.collected || this.respawning) return;
        powerup.collect();

        let color = 0x00FF00;
        switch (powerup.type) {
            case 'invincible': color = 0x00FF00; this.player.activatePowerup(); break;
            case 'speed':      color = 0xFFFF00; this.player.activateSpeedBoost(); break;
            case 'kill':       color = 0xFF4444; this.player.activateKillMode(); break;
            case 'points':     color = 0xFFA500; this.player.activateDoublePoints(); break;
        }

        const label = getPowerUpLabel(powerup.type);
        this.score += 30;
        this.updateHUD();
        this.soundManager.playPowerup();
        this.spawnParticles(powerup.sprite.x, powerup.sprite.y, 10, color);
        this.showCombo(`+30 ${label}`);
    }

    private reachExit(): void {
        if (this.levelComplete || this.respawning) return;
        this.levelComplete = true;
        this.score += this.lives * 100;
        this.soundManager.playLevelComplete();
        if (this.currentLevel < 3) {
            this.time.delayedCall(1500, () => {
                this.scene.start('Game', { level: this.currentLevel + 1 });
            });
        } else {
            this.time.delayedCall(1500, () => {
                this.scene.start('GameOver', { victory: true, score: this.score });
            });
        }
    }

    private onPlayerHit(damage: number): void {
        this.comboCount = 0;
        this.lives -= damage;
        this.updateHUD();
        this.soundManager.playHit();
        this.tweens.add({
            targets: this.livesText,
            scaleX: 1.4, scaleY: 1.4,
            duration: 150, yoyo: true, ease: 'Back.easeOut',
        });
        if (this.lives <= 0) this.player.die();
        else this.player.makeInvincible(1500);
    }

    private onPlayerDied(): void {
        if (this.respawning) return;
        this.respawning = true;
        this.time.delayedCall(1500, () => {
            this.scene.start('GameOver', { victory: false, score: this.score });
        });
    }

    shutdown(): void {
        this.soundManager.stopMusic();
    }

    private createHUD(): void {
        const s: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Arial, sans-serif', fontSize: '18px',
            color: '#FFFFFF', stroke: '#000000', strokeThickness: 4,
        };
        this.scoreText = this.add.text(16, 16, 'Punteggio: 0', s).setScrollFactor(0).setDepth(100);
        this.coinText = this.add.text(16, 42, 'Monete: 0', s).setScrollFactor(0).setDepth(100);
        this.livesText = this.add.text(16, 68, '♥♥♥', {
            fontFamily: 'Arial', fontSize: '20px', color: '#FF4444',
            stroke: '#000000', strokeThickness: 3,
        }).setScrollFactor(0).setDepth(100);
        this.comboText = this.add.text(400, 300, '', {
            fontFamily: 'Arial', fontSize: '28px', color: '#FFD700',
            stroke: '#000000', strokeThickness: 5, fontStyle: 'bold',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);
    }

    private updateHUD(): void {
        this.scoreText.setText(`Punteggio: ${this.score}`);
        this.coinText.setText(`Monete: ${this.coinCount}`);
        this.livesText.setText('♥'.repeat(Math.max(0, this.lives)));
    }

    private showCombo(text: string): void {
        this.comboText.setText(text).setAlpha(1).setY(300);
        this.tweens.add({ targets: this.comboText, y: 250, alpha: 0, duration: 800, ease: 'Power2' });
    }
}
