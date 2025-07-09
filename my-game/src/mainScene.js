import Phaser from 'phaser';
import { wish } from './wishes';
export default class MainScene extends Phaser.Scene {
    constructor() {
        super('mainScene');
        this.isFishing = false;
        this.hasCatch = false;
        this.catchText = null;
        this.fishCaughtCount = 0;
        this.caughtFish = null;
    }

    preload() {
        this.load.spritesheet('fishAtlas', 'public/fish1.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('fishingHut', 'public/bridge/Fishing_hut.png');
        this.load.image('fisherman', 'public/fisherman/GraveRobber_fish.png');
        this.load.spritesheet('fisher', 'public/fisherman/GraveRobber_hook.png', {
            frameWidth: 48,
            frameHeight: 48
        });
    }
    createPlayAgainButton() {
        const button = this.add.text(300, 350, '🔁 Play Again', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#0077cc',
            padding: { x: 10, y: 5 },
            borderRadius: 5,
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.restart();
        })
        .on('pointerover', () => button.setStyle({ fill: '#ffff00' }))
        .on('pointerout', () => button.setStyle({ fill: '#ffffff' }));
    }
    

    create() {
        this.createFishAnimations();
        this.createEnvironment();
        this.spawnFish();
        this.createFisherman();
        this.setupInput();
        this.fadeOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0)
         .setOrigin(0, 0)
         .setDepth(100);
        this.creditsText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: {width: this.scale.width * 0.8}
        }) 
          .setOrigin(0.5)
          .setDepth(101)
          .setAlpha(0);
    }
    
    showCredits(text, duration = 4000, onComplete = null) {
        this.fadeOverlay.setAlpha(0);
        this.creditsText.setText(text);
        this.creditsText.setAlpha(0);
      
        
        this.tweens.add({
          targets: this.fadeOverlay,
          alpha: 0.8,
          duration: 1000,
          onComplete: () => {
            
            this.tweens.add({
              targets: this.creditsText,
              alpha: 0.8,
              duration: 1000,
              onComplete: () => {
                
                this.time.delayedCall(duration, () => {
                  this.tweens.add({
                    targets: this.creditsText,
                    alpha: 0,
                    duration: 1000,
                  });
                  this.tweens.add({
                    targets: this.fadeOverlay,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                      this.creditsText.setText('');
                      if (onComplete) onComplete();
                    }
                  });
                });
              }
            });
          }
        });
      }
    createFishAnimations() {
        this.anims.create({ key: 'fish-blue', frames: this.anims.generateFrameNumbers('fishAtlas', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'fish-grey', frames: this.anims.generateFrameNumbers('fishAtlas', { start: 3, end: 5 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'fish-red', frames: this.anims.generateFrameNumbers('fishAtlas', { start: 54, end: 56 }), frameRate: 6, repeat: -1 });
    }

    createEnvironment() {
       this.startText = this.add.text(250, 280, 'Click to fish', { fontSize: '20px', fill: 'grey' });
        this.hut = this.add.image(-10, this.scale.height, 'fishingHut').setOrigin(0, 1).setScale(2);
        this.bobber = this.add.circle(400, 400, 8, 0xff0000).setDepth(2).setVisible(false);

        this.input.on('pointerdown', (pointer) => {
            this.startFishing(pointer);
        });
    }

    spawnFish() {
        this.fishes = [];
        const fishConfig = [
            { key: 'fish-blue', count: 8 },
            { key: 'fish-grey', count: 8 },
            { key: 'fish-red', count: 8 },
        ];

        fishConfig.forEach(config => {
            for (let i = 0; i < config.count; i++) {
                const x = Phaser.Math.Between(50, 750);
                const y = Phaser.Math.Between(50, 500);
                const speed = Phaser.Math.FloatBetween(10, 20);
                const fish = this.add.sprite(x, y, 'fishAtlas');
                fish.play(config.key);
                fish.setAlpha(0.4);
                fish.setTint(0x003366);
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                fish.rotation = angle + Phaser.Math.DegToRad(-90);
                fish.velocityX = Math.cos(angle) * speed;
                fish.velocityY = Math.sin(angle) * speed;
                fish.setScale(Phaser.Math.FloatBetween(0.8, 1.4));
                this.fishes.push(fish);
            }
        });
    }

    createFisherman() {
        this.anims.create({ key: 'fisher-cast', frames: this.anims.generateFrameNumbers('fisher', { start: 0, end: 5 }).reverse(), frameRate: 8, repeat: 0 });
        this.anims.create({ key: 'fisher-pull', frames: this.anims.generateFrameNumbers('fisher', { start: 0, end: 5 }), frameRate: 8, repeat: 0 });
        this.fisher = this.add.sprite(370, 435, 'fisher').setDepth(1).setScale(2);
    }

    setupInput() {
        this.input.keyboard.on("keydown-SPACE", () => this.tryCatchFish());
    }

    startFishing(pointer = null) {
        if (this.isFishing) return;

        if (this.startText){
            this.startText.destroy();
            this.startText = null;

        }
        if (this.wishText) {
            this.wishText.destroy();
            this.wishText = null;
        }
        if (this.wishTimer) {
            this.wishTimer.remove();
            this.wishTimer = null;
        }

        this.isFishing = true;
        this.hasCatch = false;
        this.fisher.play('fisher-cast');

        this.fisher.once('animationcomplete-fisher-cast', () => {
            if (pointer && pointer.x && pointer.y) {
                this.bobber.x = pointer.x;
                this.bobber.y = pointer.y;
            } else {
                this.bobber.x = Phaser.Math.Between(100, 700);
                this.bobber.y = Phaser.Math.Between(300, 500);
            }

            this.bobber.setVisible(true);

            const startY = this.bobber.y;

            this.tweens.add({
                targets: this.bobber,
                y: {from: startY -10, to: startY +10},
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.time.delayedCall(1000 + Phaser.Math.Between(1000, 2000), () => {
                const fishNear = this.fishes.find(fish => Phaser.Math.Distance.Between(fish.x, fish.y, this.bobber.x, this.bobber.y) < 50);
                if (fishNear) {
                    this.hasCatch = true;
                    this.caughtFish = fishNear;
                    if (this.catchText) this.catchText.destroy();
                    this.catchText = this.add.text(300, 250, 'Клює! Не спи і жми пробіл!', { fontSize: '20px', color: '#ffff00' });
                } else {
                    this.endFishing();
                }
            });
        });
    }

    tryCatchFish() {
        if (!this.isFishing || !this.hasCatch) return;
    
        if (this.caughtFish) {
            this.caughtFish.setAlpha(1);
            this.caughtFish.clearTint();
    
            this.tweens.add({
                targets: this.caughtFish,
                x: this.fisher.x,
                y: this.fisher.y,
                duration: 2000,
                ease: 'Power1',
                onComplete: () => {
                    if (this.caughtFish) {
                        this.caughtFish.setVisible(false);
                        const index = this.fishes.indexOf(this.caughtFish);
                        if (index > -1) this.fishes.splice(index, 1);
                        this.caughtFish = null;
                    }
    
                    this.endFishing();
    
                    if (this.catchText) {
                        this.catchText.destroy();
                        this.catchText = null;
                    }
    
                    this.fishCaughtCount++;
    
                    const wishes = wish;
                    const message = Phaser.Utils.Array.GetRandom(wishes);
                    this.wishText = null;
                    this.wishTimer = null;
                    if (this.wishText){
                        this.wishText.destroy();
                        this.wishText = null;
                    }
                    if (this.wishTimer){
                        this.wishTimer.remove();
                        this.wishTimer = null;
                    }
                    this.wishText = this.add.text(250, 300, message, {
                        fontSize: '24px',
                        fill: '#ffffff',
                        stroke: '#000',
                        strokeThickness: 3,
                    });

                    this.wishTimer = this.time.delayedCall(4000, () => {
                        if (this.wishText){
                            this.wishText.destroy();
                            this.wishText = null;
                        }
                        this.wishTimer = null;
                    })
    
                    if (this.fishCaughtCount >= this.fishes.length) {
                        
                        this.showCredits('Усі риби спіймані! 🎉\nЗ днем народження тебе наша красуня\nАвтори ідеї : Містер Стракт, Тьотя Шані\nЗа реалізація відповідали: Всі')
                    
                        this.createPlayAgainButton();
                    }
                    
                }
            });
        }
    }
    

    endFishing() {
        this.isFishing = false;
        this.hasCatch = false;
        this.bobber.setVisible(false);
    }

    update(time, delta) {
        const deltaSec = delta / 1000;
        const minX = 16, maxX = 784, minY = 16, maxY = 584;
    
        this.fishes.forEach(fish => {
            if (this.bobber.visible && !this.hasCatch) {
                const distanceToBobber = Phaser.Math.Distance.Between(fish.x, fish.y, this.bobber.x, this.bobber.y);
                const interestRadius = 100; 
    
                if (distanceToBobber < interestRadius) {
                   
                    const angle = Phaser.Math.Angle.Between(fish.x, fish.y, this.bobber.x, this.bobber.y);
                    const speed = 60;
    
                    fish.velocityX = Math.cos(angle) * speed;
                    fish.velocityY = Math.sin(angle) * speed;
    
                    fish.rotation = angle + Phaser.Math.DegToRad(-90);
                    if (!this.catchTimer) {
                        this.catchTimer = this.time.delayedCall(1500, () => {
                            this.hasCatch = true;
                            this.caughtFish = fish;
    
                            if (this.catchText) this.catchText.destroy();
                            this.catchText = this.add.text(300, 250, 'Клює! Не спи і жми пробіл!', { fontSize: '20px', color: '#ffff00' });
    
                            this.catchTimer = null;
                        });
                    }
                    fish.x += fish.velocityX * deltaSec;
                    fish.y += fish.velocityY * deltaSec;
    
                    return;
                }
            }
            fish.x += fish.velocityX * deltaSec;
            fish.y += fish.velocityY * deltaSec;
            let bounced = false;
    
            if (fish.x < minX || fish.x > maxX) {
                fish.velocityX *= -1;
                bounced = true;
            }
            if (fish.y < minY || fish.y > maxY) {
                fish.velocityY *= -1;
                bounced = true;
            }
            if (bounced) {
                fish.rotation = Math.atan2(fish.velocityY, fish.velocityX) + Phaser.Math.DegToRad(-90);
            }
        });
    }
    
}
