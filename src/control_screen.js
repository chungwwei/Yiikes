import returnImg from "./assets/keyboard_return_black_48x48.png"

export class ControlScene extends Phaser.Scene{

    constructor() {
        super('control_scene')
    }

    preload() {
        this.load.image('return', returnImg)
    }

    create() {
        this.cameras.main.setBackgroundColor('0xffffff')
        this.btReturn = this.add.image(100, 100, 'return')
        this.btReturn.setInteractive()
        this.btReturn.setOrigin(0.5)
        this.btReturn.on('pointerdown', () => {
            this.scene.start('main_screen')
        })

        this.controlText = this.add.text(960 / 2, 100, 'Controls')
        this.controlText.setColor('0x000000')
        this.controlText.setFontSize(50)
        
        this.upText = this.add.text(200, 200, "W / UP - Move Up")
        this.upText.setColor('0x000000')
        this.upText.setFontSize(30)

        this.leftText = this.add.text(200, 250, "A / LEFT - Move Left")
        this.leftText.setColor('0x000000')
        this.leftText.setFontSize(30)

        this.downText = this.add.text(200, 300, "S / DOWN - Move Down")
        this.downText.setColor('0x000000')
        this.downText.setFontSize(30)

        this.rightText = this.add.text(200, 350, "D / RIGHT - Move Right")
        this.rightText.setColor('0x000000')
        this.rightText.setFontSize(30)

        this.spaceText = this.add.text(200, 400, "SPACE - Shoot a projectile")
        this.spaceText.setColor('0x000000')
        this.spaceText.setFontSize(30)
        this.spaceText2 = this.add.text(200, 430, "(Press again to teleport to the projectile) ")
        this.spaceText2.setColor('0x000000')
        this.spaceText2.setFontSize(20)

        this.pauseText = this.add.text(200, 480, "J/K - Increase/Decrease Volume")
        this.pauseText.setColor('0x000000')
        this.pauseText.setFontSize(30)

        this.pauseText = this.add.text(200, 530, "M - Mute")
        this.pauseText.setColor('0x000000')
        this.pauseText.setFontSize(30)
    }

    update(){}
}