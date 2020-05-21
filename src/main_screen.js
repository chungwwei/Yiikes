
import logoImg from "./assets/logo.png"
import { gameState, game } from ".";
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
            if(lastLevel === 9) this.scene.start('level' + (lastLevel))
            else this.scene.start('level' + (lastLevel + 1))
        })

        this.btLevelSelect.on('pointerdown', () => {
            this.scene.start('level_select_scene')
        })

        this.btControl.on('pointerdown', () => {
            this.scene.start('control_scene')
        })

        this.btHelp.on('pointerdown', () => {
            this.scene.start('help_scene')
        })

        this.btExit.on('pointerdown', () => {
            game.destroy(true, true)
        })

        var keys = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','ZERO','MINUS','PLUS']
            for(let i = 0; i < keys.length; i++){
                this[keys[i]] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[i]]);
            }
    }

    update() {
        if(this.ONE.isDown) this.scene.start('level1')
        if(this.TWO.isDown) this.scene.start('level2')
        if(this.THREE.isDown) this.scene.start('level3')
        if(this.FOUR.isDown) this.scene.start('level4')
        if(this.FIVE.isDown) this.scene.start('level5')
        if(this.SIX.isDown) this.scene.start('level6')
        if(this.SEVEN.isDown) this.scene.start('level7')
        if(this.EIGHT.isDown) this.scene.start('level8')
        if(this.NINE.isDown) this.scene.start('level9')
        if(this.ZERO.isDown) this.scene.start('level10')
        if(this.MINUS.isDown) this.scene.start('level11')
        if(this.PLUS.isDown) this.scene.start('level12')
    }
}