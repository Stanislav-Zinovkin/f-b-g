export default class MainScene extends Phaser.Scene {
    constructor() {
        super('mainScene');
    }
    preload(){
        this.load.spritesheet('fishAtlas', 'assets/fish1.png',{
            frameWidth: 32,
            frameHeight: 32
        });
       this.load.image('fishingHut', 'assets/bridge/Fishing_hut.png');
    }
    create () {
        this.anims.create({
            key: 'fish-blue',
            frames: this.anims.generateFrameNumbers('fishAtlas', {start: 0, end: 2}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'fish-grey',
            frames: this.anims.generateFrameNumbers('fishAtlas', {start: 3, end: 5}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'fish-red',
            frames: this.anims.generateFrameNumbers('fishAtlas', {start: 54, end: 56}),
            frameRate: 6,
            repeat: -1
        });

        this.add.text(250, 280, 'Press space, to start',{fontSize: '20px', fill: "grey",});
        this.input.keyboard.on("keydown-SPACE", () => {
            this.add.text(320,320, 'Push it!', {
                fontSize: '18px',
                fill: '#fff00',
            });
        });
        this.fishes = [];
        const fishConfig = [
            {key: 'fish-blue', count: 8},
            {key:'fish-grey', count: 8},
            {key: 'fish-red', count: 8},
        ];

        fishConfig.forEach(config => {
        for( let i = 0; i < config.count; i++){
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
        
        const hutX = -10;
        const hutY = this.scale.height;
        this.hut = this.add.image(hutX, hutY, 'fishingHut').setOrigin(0, 1).setScale(2);

        });
    }
    update (time, delta) {
        const deltaSec = delta / 1000;
        const minX = 16;
        const maxX = 784;
        const minY = 16;
        const maxY = 584;

        this.fishes.forEach( fish => {
            fish.x += fish.velocityX * deltaSec;
            fish.y += fish.velocityY * deltaSec;
            let bounced = false;
            if(fish.x < minX) {
                fish.x = minX;
                bounced = true;
            }
            else if(fish.x > maxX) {
                fish.x = maxX;
                bounced = true;
            }
            if (fish.y < minY) {
                fish.y = minY;
                bounced = true;
            }
            else if (fish.y > maxY){
                fish.y = maxY;
                bounced = true;
            }
            if (bounced){
                let angle = Phaser.Math.RadToDeg(Math.atan2(fish.velocityY, fish.velocityX));
                angle = (angle + Phaser.Math.FloatBetween(-90,90) + 360) % 360;
                const speed = Math.sqrt(fish.velocityX ** 2 + fish.velocityY **2 );
                const angleRad = Phaser.Math.DegToRad(angle);
                fish.velocityY = Math.sin(angleRad) * speed;
                fish.velocityX = Math.cos(angleRad) * speed;

                fish.rotation = Math.atan2(fish.velocityY, fish.velocityX);
                fish.rotation += Math.sin(time / 500 + fish.offset) * 0.002;
            }else{
                fish.rotation = Math.atan2(fish.velocityY, fish.velocityX) + Phaser.Math.DegToRad(-90);
            }
            
        });
            
            
        }
    }