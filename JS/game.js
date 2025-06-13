import mainScene from "./mainScene.js"

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1e90ff',
    scene: [mainScene],
    pixelArt: true,
    physics:{
        default: 'arcade',
        arcade:{
            debug: false,
        },
    },
};
new Phaser.Game(config);