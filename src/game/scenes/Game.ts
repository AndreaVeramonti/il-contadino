import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Coin } from '../objects/Coin';
import { Enemy } from '../objects/Enemy';
import { PowerUp, getPowerUpLabel, PowerUpType } from '../objects/PowerUp';
import { LEVEL_1, LEVEL_1_WIDTH, parseLevel } from '../levels/Level1';

const TILE = 32;
const LEVEL_1_HEIGHT = 18;

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

    constructor() { super('Game'); }

    create(): void {
        this.levelComplete = false;
        this.respawning = false;
        this.enemies = [];
        this.coins = [];
        this.powerups = [];

        const worldW = LEVEL_1_WIDTH * TILE;
        const worldH = LEVEL_1_HEIGHT * TILE;
        this.physics.world.setBounds(0, 0, worldW, worldH);

        // Background parallax layers
        this.add.image(400, 300, 'bg').setScrollFactor(0);
        const hillsBg = this.add.tileSprite(0, worldH - 240, 800, 160, 'hills');
        hillsBg.setOrigin(0, 0).setScrollFactor(0.3).setAlpha(0.5);

        const levelData = parseLevel(LEVEL_1, TILE);

        // Build platforms
        this.platforms = this.physics.add.staticGroup();
        for (const p of levelData.platforms) {
            const type = p.type === 'dirt' ? 'dirt' : p.type === 'platform' ? 'platform' : 'ground';
            this.platforms.create(p.x, p.y, type);
        }
        this.platforms.refresh();

        // Decorative trees on top of ground (col 5, 15, 25, 35, ...)
        for (let col = 4; col < LEVEL_1_WIDTH; col += 18) {
            const tx = col * TILE + TILE / 2;
            const ty = 13 * TILE + TILE / 2 - 24; // above ground
            this.add.image(tx, ty, 'tree').setDepth(5);
        }
        // Flowers here and there
        for (let col = 2; col < LEVEL_1_WIDTH; col += 7) {
            const fx = col * TILE + TILE / 2;
            const fy = 13 * TILE + TILE / 2 - 18;
            this.add.image(fx, fy, 'flower').setDepth(4).setAlpha(0.8);
        }

        // Coins
        for (const c of levelData.coins) {
            this.coins.push(new Coin(this, c.x, c.y));
        }

        // Enemies
        for (const e of levelData.enemies) {
            this.enemies.push(new Enemy(this, e.x, e.y));
        }

        // Powerups
        for (const u of levelData.powerups) {
            this.powerups.push(new PowerUp(this, u.x, u.y, u.type as PowerUpType));
        }

        // Exit
        if (levelData.exit) {
            this.exitSprite = this.physics.add.sprite(levelData.exit.x, levelData.exit.y - 16, 'exit');
            const body = this.exitSprite.body as Phaser.Physics.Arcade.Body;
            body.allowGravity = false;
            this.exitSprite.setImmovable(true);
        }

        // Player
        this.player = new Player({
            scene: this,
            x: levelData.playerSpawn.x,
            y: levelData.playerSpawn.y - 18,
        });

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

        this.createHUD();
        this.events.on('player-hit', (dmg: number) => this.onPlayerHit(dmg));
        this.events.on('player-died', () => this.onPlayerDied());
    }

    update(): void {
        if (this.levelComplete || this.respawning) return;
        this.player.update();
        for (const e of this.enemies) if (e.alive) e.update();
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
        if (this.comboCount >= 3) {
            const label = multiplier > 1 ? `+${10 * bonus * multiplier} (x${this.comboCount}) DOPPIO!` : `+${10 * bonus} (x${this.comboCount})`;
            this.showCombo(label);
        }
    }

    private playerEnemyCollision(enemy: Enemy): void {
        if (!enemy.alive || !this.player.alive || this.respawning) return;

        // Kill mode: any contact kills the enemy
        if (this.player.killMode) {
            enemy.stomp();
            const pts = this.player.doublePoints ? 100 : 50;
            this.score += pts;
            this.comboCount++;
            this.updateHUD();
            this.player.sprite.setVelocityY(-200);
            this.showCombo(`+${pts} FALCE!`);
            return;
        }

        const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        const eBody = enemy.sprite.body as Phaser.Physics.Arcade.Body;
        if (pBody.velocity.y > 0 && (pBody.y + pBody.height) < (eBody.y + 20)) {
            enemy.stomp();
            const pts = this.player.doublePoints ? 100 : 50;
            this.score += pts;
            this.comboCount++;
            this.updateHUD();
            this.player.sprite.setVelocityY(-300);
            this.showCombo(`+${pts}`);
        } else if (!this.player.invincible) {
            this.comboCount = 0;
            this.player.hit(1);
        }
    }

    private collectPowerup(powerup: PowerUp): void {
        if (powerup.collected || this.respawning) return;
        powerup.collect();

        const label = getPowerUpLabel(powerup.type);
        this.score += 30;
        this.updateHUD();
        this.showCombo(`+30 ${label}`);

        switch (powerup.type) {
            case 'invincible':
                this.player.activatePowerup();
                break;
            case 'speed':
                this.player.activateSpeedBoost();
                break;
            case 'kill':
                this.player.activateKillMode();
                break;
            case 'points':
                this.player.activateDoublePoints();
                break;
        }
    }

    private reachExit(): void {
        if (this.levelComplete || this.respawning) return;
        this.levelComplete = true;
        this.score += this.lives * 100;
        this.scene.start('GameOver', { victory: true, score: this.score });
    }

    private onPlayerHit(damage: number): void {
        this.comboCount = 0;
        this.lives -= damage;
        this.updateHUD();
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
