import mainScene from "./mainScene.js"

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: 'rgba(56,105,146,255)',
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