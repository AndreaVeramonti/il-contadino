import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Coin } from '../objects/Coin';
import { Enemy } from '../objects/Enemy';
import { PowerUp } from '../objects/PowerUp';
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

    constructor() {
        super('Game');
    }

    create(): void {
        this.levelComplete = false;
        this.respawning = false;
        this.enemies = [];
        this.coins = [];
        this.powerups = [];

        const worldW = LEVEL_1_WIDTH * TILE;
        const worldH = LEVEL_1_HEIGHT * TILE;
        this.physics.world.setBounds(0, 0, worldW, worldH);

        this.add.image(400, 300, 'bg').setScrollFactor(0);

        const hillsBg = this.add.tileSprite(0, worldH - 240, 800, 160, 'hills');
        hillsBg.setOrigin(0, 0);
        hillsBg.setScrollFactor(0.3);
        hillsBg.setAlpha(0.5);

        const levelData = parseLevel(LEVEL_1, TILE);

        this.platforms = this.physics.add.staticGroup();
        for (const p of levelData.platforms) {
            const tileType = p.type === 'dirt' ? 'dirt' : p.type === 'platform' ? 'platform' : 'ground';
            this.platforms.create(p.x, p.y, tileType);
        }
        this.platforms.refresh();

        for (const c of levelData.coins) {
            this.coins.push(new Coin(this, c.x, c.y));
        }

        for (const e of levelData.enemies) {
            this.enemies.push(new Enemy(this, e.x, e.y));
        }

        for (const u of levelData.powerups) {
            this.powerups.push(new PowerUp(this, u.x, u.y));
        }

        if (levelData.exit) {
            this.exitSprite = this.physics.add.sprite(levelData.exit.x, levelData.exit.y - 16, 'exit');
            const body = this.exitSprite.body as Phaser.Physics.Arcade.Body;
            body.allowGravity = false;
            this.exitSprite.setImmovable(true);
        }

        this.player = new Player({
            scene: this,
            x: levelData.playerSpawn.x,
            y: levelData.playerSpawn.y - 18,
        });

        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 50);

        this.physics.add.collider(this.player.sprite, this.platforms);
        for (const e of this.enemies) {
            this.physics.add.collider(e.sprite, this.platforms);
            this.physics.add.overlap(this.player.sprite, e.sprite, () => {
                this.playerEnemyCollision(e);
            });
        }

        for (const c of this.coins) {
            this.physics.add.overlap(this.player.sprite, c.sprite, () => {
                this.collectCoin(c);
            });
        }

        for (const p of this.powerups) {
            this.physics.add.overlap(this.player.sprite, p.sprite, () => {
                this.collectPowerup(p);
            });
        }

        if (this.exitSprite) {
            this.physics.add.overlap(this.player.sprite, this.exitSprite, () => {
                this.reachExit();
            });
        }

        this.createHUD();

        this.events.on('player-hit', (dmg: number) => this.onPlayerHit(dmg));
        this.events.on('player-died', () => this.onPlayerDied());
    }

    update(): void {
        if (this.levelComplete || this.respawning) return;

        this.player.update();

        for (const e of this.enemies) {
            if (e.alive) e.update();
        }
    }

    private collectCoin(coin: Coin): void {
        if (coin.collected || this.respawning) return;

        coin.collect();
        this.coinCount++;
        this.comboCount++;
        const bonus = Math.min(this.comboCount, 5);
        this.score += 10 * bonus;
        this.updateHUD();

        if (this.comboCount >= 3) {
            this.showCombo(`+${10 * bonus} (x${this.comboCount})`);
        }
    }

    private playerEnemyCollision(enemy: Enemy): void {
        if (!enemy.alive || !this.player.alive || this.respawning) return;

        const playerBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        const enemyBody = enemy.sprite.body as Phaser.Physics.Arcade.Body;
        const playerBottom = playerBody.y + playerBody.height;
        const enemyTop = enemyBody.y;
        const playerVelY = playerBody.velocity.y;

        if (playerVelY > 0 && playerBottom < enemyTop + 20) {
            enemy.stomp();
            this.score += 50;
            this.comboCount++;
            this.updateHUD();
            this.player.sprite.setVelocityY(-300);
            this.showCombo('+50');
        } else if (!this.player.invincible) {
            this.comboCount = 0;
            this.player.hit(1);
        }
    }

    private collectPowerup(powerup: PowerUp): void {
        if (powerup.collected || this.respawning) return;

        powerup.collect();
        this.player.activatePowerup();
        this.score += 30;
        this.updateHUD();
        this.showCombo('+30 POTENZIAMENTO!');
    }

    private reachExit(): void {
        if (this.levelComplete || this.respawning) return;
        this.levelComplete = true;

        this.score += this.lives * 100;
        this.scene.start('GameOver', {
            victory: true,
            score: this.score,
        });
    }

    private onPlayerHit(damage: number): void {
        this.comboCount = 0;
        this.lives -= damage;
        this.updateHUD();

        if (this.lives <= 0) {
            this.player.die();
        } else {
            this.player.makeInvincible(1500);
        }
    }

    private onPlayerDied(): void {
        if (this.respawning) return;
        this.respawning = true;

        this.time.delayedCall(1500, () => {
            this.scene.start('GameOver', {
                victory: false,
                score: this.score,
            });
        });
    }

    private createHUD(): void {
        const style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
        };

        this.scoreText = this.add.text(16, 16, 'Punteggio: 0', style)
            .setScrollFactor(0).setDepth(100);
        this.coinText = this.add.text(16, 42, 'Monete: 0', style)
            .setScrollFactor(0).setDepth(100);
        this.livesText = this.add.text(16, 68, 'Vite: 3', style)
            .setScrollFactor(0).setDepth(100);
        this.comboText = this.add.text(400, 300, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 5,
            fontStyle: 'bold',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);
    }

    private updateHUD(): void {
        this.scoreText.setText(`Punteggio: ${this.score}`);
        this.coinText.setText(`Monete: ${this.coinCount}`);
        this.livesText.setText(`Vite: ${'♥'.repeat(Math.max(0, this.lives))}`);
    }

    private showCombo(text: string): void {
        this.comboText.setText(text);
        this.comboText.setAlpha(1);
        this.comboText.setY(300);

        this.tweens.add({
            targets: this.comboText,
            y: 250,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
        });
    }
}
