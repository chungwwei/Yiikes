
import logoImg from "./assets/logo.png"
import { gameState } from ".";
export class MainScene extends Phaser.Scene { 

    constructor() {
        super('main_screen')
    }

    preload() {
        
        this.load.image('logo', logoImg)
    }

    create() {

        this.cameras.main.setBackgroundColor('0xffffff')


        this.logo = this.add.image(0, 0, 'logo')
        this.logo.setOrigin(0)
        this.logo.setScale(0.65, 0.65)


        this.btContinue    = this.add.text(960 / 2, 400, 'Continue')
        this.btLevelSelect = this.add.text(960 / 2, 450, 'Level Select')
        this.btControl     = this.add.text(960 / 2, 500, 'Control')
        this.btHelp        = this.add.text(960 / 2, 550, 'Help')
        this.btExit        = this.add.text(960 / 2, 600, 'Exit')

        this.btContinue.setInteractive()
        this.btLevelSelect.setInteractive()
        this.btControl.setInteractive()
        this.btHelp.setInteractive()
        this.btExit.setInteractive()

        this.btContinue.setOrigin(0.5)
        this.btLevelSelect.setOrigin(0.5)
        this.btControl.setOrigin(0.5)
        this.btHelp.setOrigin(0.5)
        this.btExit.setOrigin(0.5)

        this.btContinue.setColor('0x000000')
        this.btLevelSelect.setColor('0x000000')
        this.btControl.setColor('0x000000')
        this.btHelp.setColor('0x000000')
        this.btExit.setColor('0x000000')

        this.btContinue.on('pointerdown', () => {
            var lastLevel;
            for (let i = 0; i < gameState.levelCompletion.length; i ++) {
                if (gameState.levelCompletion[i] === true) {
                    lastLevel = i
                }
            }
            console.log(lastLevel)
            this.scene.start('level' + (lastLevel + 1))
        })

        this.btLevelSelect.on('pointerdown', () => {
            this.scene.start('level_select_scene')
        })

        this.btControl.on('pointerdown', () => {
            this.scene.start('control_scene')
        })

        this.btHelp.on('pointerdown', () => {

        })

        this.btExit.on('pointerdown', () => {

        })

        
    }
}