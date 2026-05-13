import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Coin } from '../objects/Coin';
import { Enemy } from '../objects/Enemy';
import { EnemyType } from '../objects/EnemyTypes';
import { PowerUp, getPowerUpLabel, PowerUpType } from '../objects/PowerUp';
import { Projectile } from '../objects/Projectile';
import { Key as KeyObj } from '../objects/Key';
import { Door } from '../objects/Door';
import { LEVEL_1, parseLevel } from '../levels/Level1';
import { LEVEL_2 } from '../levels/Level2';
import { LEVEL_3 } from '../levels/Level3';
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
    private projectiles: Projectile[] = [];
    private keys: KeyObj[] = [];
    private doors: Door[] = [];
    private secretWallGroup!: Phaser.Physics.Arcade.StaticGroup;
    private mountainBg!: Phaser.GameObjects.TileSprite;
    private mountainFg!: Phaser.GameObjects.TileSprite;

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
        this.projectiles = [];
        this.keys = [];
        this.doors = [];
        this.soundManager = new SoundManager();

        let levelData: ReturnType<typeof parseLevel>;
        let worldW: number;
        const worldH = 18 * TILE;

        switch (this.currentLevel) {
            case 2:
                levelData = parseLevel(LEVEL_2, TILE);
                worldW = Math.max(...LEVEL_2.map(r => r.length)) * TILE;
                break;
            case 3:
                levelData = parseLevel(LEVEL_3, TILE);
                worldW = Math.max(...LEVEL_3.map(r => r.length)) * TILE;
                break;
            default:
                levelData = parseLevel(LEVEL_1, TILE);
                worldW = Math.max(...LEVEL_1.map(r => r.length)) * TILE;
                break;
        }

        this.physics.world.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setBackgroundColor('#E8E4D4');

        // --- CLOUDS ---
        const cloudGfx = this.add.graphics();
        cloudGfx.setScrollFactor(0).setDepth(0);
        cloudGfx.fillStyle(0xFFFFFF, 0.7);
        cloudGfx.fillEllipse(160, 70, 180, 50);
        cloudGfx.fillEllipse(480, 110, 220, 60);
        cloudGfx.fillEllipse(760, 50, 160, 45);
        cloudGfx.fillEllipse(320, 180, 140, 35);
        cloudGfx.fillEllipse(640, 160, 190, 50);

        // --- MOUNTAIN PARALLAX (decorative background at horizon) ---
        const groundSurfaceY = 13 * TILE;
        this.mountainBg = this.add.tileSprite(0, groundSurfaceY, 2880, 180, 'mountain-bg');
        this.mountainBg.setOrigin(0, 1).setScrollFactor(0.1).setDepth(-1).setAlpha(0.9);

        this.mountainFg = this.add.tileSprite(0, groundSurfaceY + 4, 2880, 150, 'mountain-fg');
        this.mountainFg.setOrigin(0, 1).setScrollFactor(0.2).setDepth(-0.5).setAlpha(0.95);

        // --- PLATFORMS & TERRAIN ---
        this.platforms = this.physics.add.staticGroup();
        const terrainGrid = new Set<string>();
        for (const p of levelData.platforms) {
            this.platforms.create(p.x, p.y, 'terreno');
            const col = Math.round((p.x - TILE / 2) / TILE);
            const row = Math.round((p.y - TILE / 2) / TILE);
            terrainGrid.add(`${col},${row}`);
        }
        this.platforms.refresh();

        // Grass patches on top edges of terrain
        for (const p of levelData.platforms) {
            const col = Math.round((p.x - TILE / 2) / TILE);
            const row = Math.round((p.y - TILE / 2) / TILE);
            if (!terrainGrid.has(`${col},${row - 1}`)) {
                const gx = p.x;
                const gy = p.y - TILE;
                this.add.image(gx, gy, 'bg-grass').setDepth(3).setAlpha(0.85);
            }
        }

        // --- SCENIC DECORATIONS ---
        const levelCols = Math.floor(worldW / TILE);
        const groundY = 13 * TILE + TILE / 2; // Center of ground surface row

        // Far trees (tree-2, further back, parallax 0.5)
        for (let col = 4; col < levelCols - 3; col += 16 + Math.floor(Math.random() * 5)) {
            const tx = col * TILE + TILE / 2;
            const ty = groundY - 40;
            this.add.image(tx, ty, 'tree-2').setDepth(5).setScrollFactor(0.5).setAlpha(0.7);
        }

        // Near trees (tree, closer, parallax 0.7)
        for (let col = 2; col < levelCols - 2; col += 22 + Math.floor(Math.random() * 6)) {
            const tx = col * TILE + TILE / 2;
            const ty = groundY - 55;
            this.add.image(tx, ty, 'tree').setDepth(6).setScrollFactor(0.7);
        }

        // Flowers along ground surface
        for (let col = 3; col < levelCols; col += 8 + Math.floor(Math.random() * 4)) {
            const fx = col * TILE + TILE / 2;
            const fy = groundY - 18;
            const useVar = Math.random() > 0.5;
            this.add.image(fx, fy, useVar ? 'flower-3' : 'flower').setDepth(4).setAlpha(0.9);
        }

        // Apecar at level start (centered on ground)
        if (this.currentLevel === 1) {
            const car = this.add.image(3 * TILE + TILE / 2, groundY - 14, 'car');
            car.setDepth(7).setScrollFactor(1);
        }

        // --- GAME OBJECTS ---
        for (const c of levelData.coins) {
            this.coins.push(new Coin(this, c.x, c.y));
        }

        for (const u of levelData.powerups) {
            this.powerups.push(new PowerUp(this, u.x, u.y, u.type as PowerUpType));
        }

        this.waterGroup = this.physics.add.staticGroup();
        for (const w of levelData.water) {
            this.waterGroup.create(w.x, w.y, 'water').setTint(0x3388FF).setAlpha(0.6).setDepth(1);
        }
        this.waterGroup.refresh();

        this.breakableBlocks = this.physics.add.staticGroup();
        for (const b of levelData.breakables) {
            this.breakableBlocks.create(b.x, b.y, 'terreno').setTint(0xD4A017).setDepth(2);
        }
        this.breakableBlocks.refresh();

        for (const k of levelData.keys) {
            this.keys.push(new KeyObj(this, k.x, k.y));
        }

        this.secretWallGroup = this.physics.add.staticGroup();
        for (const s of levelData.secretWalls) {
            this.secretWallGroup.create(s.x, s.y, 'terreno').setTint(0x888888).setDepth(2);
        }
        this.secretWallGroup.refresh();

        if (levelData.exit) {
            this.exitSprite = this.physics.add.sprite(levelData.exit.x, levelData.exit.y + 16, 'exit');
            const body = this.exitSprite.body as Phaser.Physics.Arcade.Body;
            body.allowGravity = false;
            this.exitSprite.setImmovable(true);
            this.exitSprite.setDepth(10);
        }

        this.player = new Player({
            scene: this,
            x: levelData.playerSpawn.x,
            y: levelData.playerSpawn.y - 18,
        });

        for (const e of levelData.enemies) {
            this.enemies.push(new Enemy(this, e.x, e.y, (e.type as EnemyType) || 'crow', this.player));
        }

        for (const d of levelData.doors) {
            this.doors.push(new Door(this, d.x, d.y, this.player));
        }

        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 50);

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

        this.physics.add.collider(this.player.sprite, this.breakableBlocks, (_obj1, block) => {
            const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
            if (pBody.velocity.y < 0) {
                const bs = block as Phaser.Physics.Arcade.Sprite;
                this.breakBlock(bs);
            }
        });

        if (this.secretWallGroup.getLength() > 0) {
            this.physics.add.collider(this.player.sprite, this.secretWallGroup);
        }

        for (const k of this.keys) {
            this.physics.add.overlap(this.player.sprite, k.sprite, () => this.collectKey(k));
        }

        for (const d of this.doors) {
            this.physics.add.overlap(this.player.sprite, d.sprite, () => this.checkDoor(d));
        }

        if (this.waterGroup.getLength() > 0) {
            this.physics.add.overlap(this.player.sprite, this.waterGroup, () => this.onWaterTouch());
        }

        // --- EXIT INDICATOR ---
        this.exitIndicator = this.add.text(0, 0, '▼', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '28px',
            color: '#CC2200',
            stroke: '#1A1A1A',
            strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

        this.createHUD();

        this.events.on('player-hit', (dmg: number) => this.onPlayerHit(dmg));
        this.events.on('player-died', () => this.onPlayerDied());
        this.events.on('player-attacked', (data: { x: number; y: number; direction: number }) => {
            this.spawnPlayerProjectile(data);
        });
        this.events.on('enemy-shot', (data: { x: number; y: number; direction: number }) => {
            this.spawnEnemyProjectile(data);
        });
        this.events.on('boss-slam', (data: { x: number; y: number }) => {
            this.onBossSlam(data.x, data.y);
        });

        this.soundManager.startMusic();
        this.events.on('player-jumped', () => this.soundManager.playJump());
    }

    update(): void {
        if (this.levelComplete || this.respawning) return;
        this.player.update();
        for (const e of this.enemies) if (e.alive) e.update();
        this.updateProjectiles();
        this.checkProjectileHits();
        this.updateExitIndicator();
        this.checkExitDistance();

        // Parallax mountain tile position
        const cam = this.cameras.main;
        if (this.mountainBg) this.mountainBg.tilePositionX = cam.scrollX * 0.1;
        if (this.mountainFg) this.mountainFg.tilePositionX = cam.scrollX * 0.2;
    }

    // ---------- EXIT ----------
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

    private checkExitDistance(): void {
        if (!this.exitSprite || this.levelComplete || this.respawning) return;
        const dist = Math.abs(this.player.sprite.x - this.exitSprite.x);
        if (dist < 48) {
            this.reachExit();
        }
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

    // ---------- BREAKABLE BLOCKS ----------
    private breakBlock(block: Phaser.Physics.Arcade.Sprite): void {
        const bx = block.x;
        const by = block.y;
        this.spawnParticles(bx, by, 10, 0xD4A017, 'particle');
        block.destroy();
        this.score += 5;
        this.comboCount++;
        this.updateHUD();
        this.soundManager.playCoin();
        this.showFloatingScore(bx, by, '+5', 0xD4A017);
        const roll = Math.random();
        if (roll < 0.4) {
            const c = new Coin(this, bx, by - 16);
            this.coins.push(c);
            this.physics.add.overlap(this.player.sprite, c.sprite, () => this.collectCoin(c));
        } else if (roll < 0.6) {
            const types: PowerUpType[] = ['invincible', 'speed', 'kill', 'points'];
            const p = new PowerUp(this, bx, by - 16, types[Math.floor(Math.random() * types.length)]);
            this.powerups.push(p);
            this.physics.add.overlap(this.player.sprite, p.sprite, () => this.collectPowerup(p));
        }
    }

    private breakSecretWall(wall: Phaser.Physics.Arcade.Sprite): void {
        this.spawnParticles(wall.x, wall.y, 8, 0x888888);
        wall.destroy();
        this.score += 5;
        this.showCombo('MURO SEGRETO!');
    }

    // ---------- PARTICLES & VISUAL FX ----------
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
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '18px',
            color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#1A1A1A',
            strokeThickness: 3,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(200);
        this.tweens.add({
            targets: label, y: y - 60, alpha: 0, duration: 800, ease: 'Power2',
            onComplete: () => label.destroy(),
        });
    }

    // ---------- COLLECTIBLES ----------
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
        this.spawnParticles(coin.sprite.x, coin.sprite.y, 8, 0xD4A017);
        this.cameras.main.shake(50, 0.003);
        this.showFloatingScore(coin.sprite.x, coin.sprite.y, `+${10 * bonus * multiplier}`, 0xD4A017);
        if (this.comboCount >= 3) {
            const label = multiplier > 1 ? `+${10 * bonus * multiplier} (x${this.comboCount}) DOPPIO!` : `+${10 * bonus} (x${this.comboCount})`;
            this.showCombo(label);
        }
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

    private collectKey(key: KeyObj): void {
        if (key.collected) return;
        key.collect();
        this.player.hasKey = true;
        this.showCombo('OTTENUTA CHIAVE!');
        this.soundManager.playCoin();
        this.score += 20;
        this.updateHUD();
    }

    private checkDoor(door: Door): void {
        if (door.opened) return;
        if (door.tryOpen()) {
            this.showCombo('PORTA APERTA!');
            this.soundManager.playLevelComplete();
            this.score += 50;
            this.updateHUD();
        } else {
            this.showCombo('SERVE UNA CHIAVE!');
        }
    }

    // ---------- COMBAT ----------
    private playerEnemyCollision(enemy: Enemy): void {
        if (!enemy.alive || !this.player.alive || this.respawning) return;
        if (this.player.killMode) {
            enemy.kill();
            const pts = this.player.doublePoints ? 100 : 50;
            this.score += pts;
            this.comboCount++;
            this.updateHUD();
            this.player.sprite.setVelocityY(-200);
            this.spawnParticles(enemy.sprite.x, enemy.sprite.y, 10, 0xCC2200);
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
            this.spawnParticles(enemy.sprite.x, enemy.sprite.y, 12, 0xCC2200);
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

    // ---------- PROJECTILES ----------
    private spawnPlayerProjectile(data: { x: number; y: number; direction: number }): void {
        const proj = new Projectile({
            scene: this, x: data.x, y: data.y - 16,
            direction: data.direction, fromPlayer: true,
            texture: 'proj-player',
        });
        this.projectiles.push(proj);
        this.soundManager.playShoot();
    }

    private spawnEnemyProjectile(data: { x: number; y: number; direction: number }): void {
        const proj = new Projectile({
            scene: this, x: data.x, y: data.y,
            direction: data.direction, fromPlayer: false,
            texture: 'proj-enemy',
        });
        this.projectiles.push(proj);
        this.soundManager.playShoot();
    }

    private updateProjectiles(): void {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (!p.active) {
                this.projectiles.splice(i, 1);
                continue;
            }
            p.update();
            const pBody = p.sprite.body as Phaser.Physics.Arcade.Body;
            if (pBody.blocked.left || pBody.blocked.right || pBody.blocked.down || pBody.blocked.up) {
                p.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    private checkProjectileHits(): void {
        if (this.respawning) return;
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (!p.active) continue;
            if (p.fromPlayer) {
                let hitSomething = false;
                for (const e of this.enemies) {
                    if (!e.alive) continue;
                    const dist = Phaser.Math.Distance.Between(
                        p.sprite.x, p.sprite.y, e.sprite.x, e.sprite.y,
                    );
                    if (dist < 28) {
                        e.takeDamage(this.player.killMode ? 3 : 1);
                        this.spawnParticles(p.sprite.x, p.sprite.y, 5, 0xCC2200);
                        this.soundManager.playEnemyHit();
                        p.destroy();
                        this.projectiles.splice(i, 1);
                        if (!e.alive) {
                            const pts = this.player.doublePoints ? 100 : 50;
                            this.score += pts;
                            this.comboCount++;
                            this.updateHUD();
                            this.showCombo(`+${pts} FORKA!`);
                        }
                        hitSomething = true;
                        break;
                    }
                }
                if (!hitSomething && this.secretWallGroup) {
                    const walls = this.secretWallGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
                    for (const wall of walls) {
                        if (!wall.active) continue;
                        const dist = Phaser.Math.Distance.Between(
                            p.sprite.x, p.sprite.y, wall.x, wall.y,
                        );
                        if (dist < 28) {
                            this.breakSecretWall(wall);
                            p.destroy();
                            this.projectiles.splice(i, 1);
                            hitSomething = true;
                            break;
                        }
                    }
                }
            } else {
                const dist = Phaser.Math.Distance.Between(
                    p.sprite.x, p.sprite.y,
                    this.player.sprite.x, this.player.sprite.y,
                );
                if (dist < 24) {
                    this.onProjectileHitPlayer(p);
                    p.destroy();
                    this.projectiles.splice(i, 1);
                }
            }
        }
    }

    private onProjectileHitPlayer(proj: Projectile): void {
        if (!this.player.alive || this.player.invincible) return;
        this.comboCount = 0;
        this.player.hit(1);
        this.spawnParticles(proj.sprite.x, proj.sprite.y, 5, 0xCC2200);
    }

    private onBossSlam(x: number, y: number): void {
        this.cameras.main.shake(200, 0.01);
        this.spawnParticles(x, y, 20, 0xFF6600);
        this.soundManager.playHit();
        const dist = Phaser.Math.Distance.Between(x, y, this.player.sprite.x, this.player.sprite.y);
        if (dist < 100 && !this.player.invincible && this.player.alive) {
            this.comboCount = 0;
            this.player.hit(1);
        }
    }

    // ---------- HUD ----------
    private createHUD(): void {
        const fontStyle = {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '20px',
            color: '#1A1A1A',
        };
        const strokeStyle = {
            ...fontStyle,
            stroke: '#FFFFFF',
            strokeThickness: 2,
        };

        // Semi-transparent cream bar at top
        const hudBg = this.add.rectangle(480, 24, 960, 48, 0xE8E4D4, 0.85);
        hudBg.setScrollFactor(0).setDepth(99);

        this.scoreText = this.add.text(16, 10, 'PUNTEGGIO: 0', strokeStyle).setScrollFactor(0).setDepth(100);
        this.coinText = this.add.text(16, 30, 'MONETE: 0', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '16px',
            color: '#3D6B35',
        }).setScrollFactor(0).setDepth(100);

        this.livesText = this.add.text(944, 14, '♥♥♥', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#CC2200',
            stroke: '#1A1A1A',
            strokeThickness: 2,
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        this.comboText = this.add.text(480, 300, '', {
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '28px',
            color: '#CC2200',
            stroke: '#1A1A1A',
            strokeThickness: 4,
            fontStyle: 'italic',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);
    }

    private updateHUD(): void {
        this.scoreText.setText(`PUNTEGGIO: ${this.score}`);
        this.coinText.setText(`MONETE: ${this.coinCount}`);
        this.livesText.setText('♥'.repeat(Math.max(0, this.lives)));
    }

    private showCombo(text: string): void {
        this.comboText.setText(text).setAlpha(1).setY(300);
        this.tweens.add({ targets: this.comboText, y: 250, alpha: 0, duration: 800, ease: 'Power2' });
    }

    shutdown(): void {
        this.soundManager.stopMusic();
    }
}
