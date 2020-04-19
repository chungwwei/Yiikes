import returnImg from "./assets/keyboard_return_black_48x48.png"

export class HelpScene extends Phaser.Scene{

    constructor() {
        super('help_scene')
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

        this.controlText = this.add.text(960 / 2, 100, 'Help')
        this.controlText.setColor('0x000000')
        this.controlText.setFontSize(50)

        this.objectiveText = this.add.text(200, 150, "Objective")
        this.objectiveText.setColor('0x000000')
        this.objectiveText.setFontSize(20)

        this.objectiveText2 = this.add.text(200, 180, "Noob’s task is to navigate through level from point A to point B, where point B\n"
            + "is the endzone. Noob will be given three shots for teleport in a level and a\n"
            + "spell \“ghost\” to boost him up. Hopefully, these abilities will allow him to\n"
            + "avoid all the crazy obstacles and to land in the endzone safely. As soon as\n"
            + "Noob lands in the endzone, he will move on to his next challenge.")
        this.objectiveText2.setColor('0x000000')

        this.gameplayText = this.add.text(200, 280, "Gameplay")
        this.gameplayText.setColor('0x000000')
        this.gameplayText.setFontSize(20)

        this.gameplayText2 = this.add.text(200, 310, "The game will work like a top down puzzle game, with Noob able to move left,\n"
            + "right, up, and down in open space.\n" 
            + "Noob will have to be extra careful because there are two different kinds of\n"
            + "surfaces, and four different kinds of obstacles. Each obstacle will damage Noob\n"
            + "and reset him back to point A of the current level." )
        this.gameplayText2.setColor('0x000000')

        this.backstoryText = this.add.text(200, 410, "Back Story")
        this.backstoryText.setColor('0x000000')
        this.backstoryText.setFontSize(20)

        this.backstoryText2 = this.add.text(200, 440, "Noob is a janitor working in the world’s largest underground crime syndicate.\n"
            + "He’s been working there for many many decades. Day after day, he clock’s in and\n"
            + "out of work, goes home, eats, sleeps and wakes up for the next day at work. His\n"
            + "life is mundane, he has spent more time cleaning out toilets than anything else.\n"
            + "Except on his 50th year in this world, he gets called in by his manager. Noob\n"
            + "has always gotten along with everyone, what does upper management need from him\n"
            + "? It turns out after 20 years of being the janitor, the crime syndicate isn’t\n"
            + "as big anymore. All of their drug dens, prostitution rings, and human\n"
            + "trafficking systems all got taken down by the government. They can’t afford a\n"
            + "janitor anymore and offers Noob a chance to make enough money to retire. Noob\n"
            + "was to steal very valuable items from banks and government facilities. Without\n"
            + "his youth, Noob finds this to be ridiculous, but technology has advanced a lot\n"
            + "since Noob’s prime. Noob was given a teleportation gun to help him on his thefts.\n"
            + "Apparently the teleportation gun only works for short distances and is taxing\n"
            + "on the body, therefore it hasn’t been very popular for practical use. He can’t\n"
            + "even teleport through solid objects. Noob has no choice but to take this job,\n"
            + "or get killed. You know because he works for criminals.")
        this.backstoryText2.setColor('0x000000')
    }

    update() {}

}

