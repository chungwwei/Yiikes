
import lockImg from "./assets/lock_black_48x48.png"
import returnImg from "./assets/keyboard_return_black_48x48.png"
import unlockImg from "./assets/lock_open_black_48x48.png"
import { game, gameState } from ".";
export class LevelSelectScene extends Phaser.Scene { 

    constructor() {
        super('level_select_scene')
    }

    preload() {
        
        this.load.image('lock', lockImg)
        this.load.image('return', returnImg)
        this.load.image('unlock', unlockImg)

    }

    create() {
        this.cameras.main.setBackgroundColor('0xffffff')
        this.btReturn = this.add.image(100, 100, 'return')
        this.btReturn.setInteractive()
        this.btReturn.setOrigin(0.5)
        this.btReturn.on('pointerdown', () => {
            this.scene.start('main_screen')
        })

        this.controlText = this.add.text(310, 100, 'Level Select')
        this.controlText.setColor('0x000000')
        this.controlText.setFontSize(50)
        
        this.texts = []

        for (let i = 0; i < 9; i ++) {
            var x, y;
            if (i < 3) y = 250
            else if (i < 6) y = 400
            else if (i < 9) y = 550

            if (i % 3 === 0) x = 250
            else if (i % 3 === 1) x = 500
            else if (i % 3 === 2) x = 750

            var img
            if (gameState.levelCompletion[i] === false)
                img = this.add.image(x, y, 'lock')
            else{
                img = this.add.image(x, y, 'unlock')
                img.setInteractive()
                img.on('pointerdown', () =>{
                    this.scene.start('level' + (i + 1))
                })
            }
            let text = this.add.text(img.x, 40 + img.y, "level " + (i + 1))
            text.setOrigin(0.5)
            text.setColor('0x000000')
            text.setInteractive()

            this.texts.push(text)
        }

        for (let i = 0; i < this.texts.length; i ++) {
            var text = this.texts[i];
            console.log(text)
            if(gameState.levelCompletion[i] === true){
                text.on('pointerdown', () => {
                    this.scene.start('level' + (i + 1))
                })
            }
        }
    }

    update() {}
}