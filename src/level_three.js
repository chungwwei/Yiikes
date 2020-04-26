import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import gearImg from "./assets/gear.png"
import blueCircle from "./assets/blue_circle.png"
import level_3_JSON from "./assets/level3.json";
import { Player } from "./player";
import { gameState } from ".";
import homeImg from "./assets/home_black_48x48.png"
import pauseImg from "./assets/pause_black_48x48.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import dyingSheet from "./assets/dying.png"
import idleSheet from "./assets/idle.png"
import walkingSheet from "./assets/walking.png"
import characterImg from './assets/character.png'
import coinImg from './assets/coin.png'
import { CoinGroup } from "./coin_system";


export class Level3 extends Phaser.Scene {
    
    constructor() {
        super('level3')
        this.player = null
        this.spacebar = null
        this.bullet = null
    }

    preload() {
        console.log('loading')
        this.load.image('tiles', tilesImg)
        this.load.image('gear', gearImg)
        this.load.image('blue_circle', blueCircle)
        this.load.tilemapTiledJSON('map3', level_3_JSON)
        this.load.image('play', playImg)
        this.load.image('pause', pauseImg)
        this.load.image('home', homeImg)
        this.load.spritesheet('dying_sheet', dyingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('idle_sheet', idleSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('walk_sheet', walkingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.image('character', characterImg)
        this.load.image('coin', coinImg)
    }

    create() {
        const map = this.make.tilemap({key: 'map3'})
        const tiles = map.addTilesetImage('yiikes_tiles', 'tiles')
        this.backgroundLayer = map.createStaticLayer('background', tiles)
        this.foregroundLayer = map.createStaticLayer('foreground', tiles)
        this.laserLayer = map.createStaticLayer('lasers', tiles)


        const start_end_points = map.getObjectLayer('start_end_points')['objects']
        const pointA = start_end_points[0]
        const pointB = start_end_points[1]
        
        this.startpoint = this.add.rectangle(pointA.x, pointA.y, pointA.width, pointA.height)
        this.endpoint = this.add.rectangle(pointB.x, pointB.y, pointB.width, pointB.height, '0xff0000')
        this.endpoint.setOrigin(0)

        this.player = new Player(this, this.startpoint.x, this.startpoint.y, 
                                    25, 25, this.foregroundLayer)
        this.physics.add.existing(this.player)
        this.player.setTexture('character')
        this.player.body.setSize(25, 25)
        // create animations
        this.walkAnimation = this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('walk_sheet'),
            frameRate: 10,
            start:0,
            end: 4,
            repeat: -1
        })

        this.dyingAnimation = this.anims.create({
            key: 'dying',
            frames: this.anims.generateFrameNumbers('dying_sheet'),
            start: 0,
            end: 5,
            frameRate: 60,
            repeat: 0
        })

        this.idleAnimation = this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('dying_sheet'),
            frameRate: 6,
            repeat: -1
        })

        this.player.anims.load('walk')
        this.player.anims.load('idle')
        this.player.anims.load('dying')


        this.player.body.collideWorldBounds = true

        this.foregroundLayer.setCollisionBetween(-1, 1, true, true)
        this.physics.add.collider(this.player, this.foregroundLayer, ()=>{
            console.log("collision")
        })

        this.laserLayer.setCollisionBetween(21, 25, true, true)

        this.physics.add.collider(this.player, this.laserLayer, () => {
            this.resetPlayer()
        })

        this.player.setInteractive()
        this.cursors = this.input.keyboard.createCursorKeys()

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.pointsGroup = this.physics.add.group({
            allowGravity: false,
        })

        var circlePath_1 = new Phaser.Curves.Path(400, 500).circleTo(50)
        var circlePath_2 = new Phaser.Curves.Path(450, 400).circleTo(120)
        var circlePath_3 = new Phaser.Curves.Path(550, 350).circleTo(130)
        var circlePath_4 = new Phaser.Curves.Path(500, 300).circleTo(100)

        var ball1 = this.add.follower(circlePath_1, 700, 500, 'blue_circle');
        var ball2 = this.add.follower(circlePath_2, 450, 600, 'blue_circle')
        var ball3 = this.add.follower(circlePath_3, 500, 350, 'blue_circle');
        var ball4 = this.add.follower(circlePath_4, 400, 300, 'blue_circle');


        this.physics.world.enable(ball1)
        this.physics.world.enable(ball2)
        this.physics.world.enable(ball3)
        this.physics.world.enable(ball4)

        ball1.body.setCircle(32)
        ball2.body.setCircle(32)
        ball3.body.setCircle(32)
        ball4.body.setCircle(32)

        ball1.startFollow({
            repeat: 100000,
            duration: 3000,
        });
        ball2.startFollow({
            repeat: 100000,
            duration: 3000,
        });
        ball3.startFollow({
            repeat: 100000,
            duration: 3000,
        });
        ball4.startFollow({
            repeat: 100000,
            duration: 3000,
        });
        

        this.physics.add.overlap(ball1, this.player, () => {
            this.resetPlayer()
        })
        this.physics.add.overlap(ball2, this.player, () => {
            this.resetPlayer()
        })
        this.physics.add.overlap(ball3, this.player, () => {
            this.resetPlayer()
        })
        this.physics.add.overlap(ball4, this.player, () => {
            this.resetPlayer()
        })
        
        this.btHome  = this.add.image(100, 100, 'home')
        this.btSwitch = this.add.image(860, 100, 'pause')
        
        this.btHome.setInteractive()
        this.btSwitch.setInteractive()

        this.btHome.on('pointerdown', () => {
            this.scene.start('main_screen')
        })

        this.toggle = 1
        this.btSwitch.on('pointerdown', () => {
            // game is on, like to pause it
            if (this.toggle === 1) {
                ball1.pauseFollow()
                ball2.pauseFollow()
                ball3.pauseFollow()
                ball4.pauseFollow()
                this.toggle = 0
                this.btSwitch.setTexture('play')
            } else {
                ball1.resumeFollow()
                ball2.resumeFollow()
                ball3.resumeFollow()
                ball4.resumeFollow()
                this.toggle = 1
                this.btSwitch.setTexture('pause')
            }
        })
        var keys = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE']
        for(let i = 0; i < keys.length; i++){
            this[keys[i]] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[i]]);
        }

        this.shotText = this.add.text(200, 100, 'Number of Shots: 3')
        this.coinText = this.add.text(400, 100, 'Coins collected: 0')

        const coinPoints = map.getObjectLayer('coins')['objects']
        this.coins = this.add.group()
        console.log(typeof(this.coins))
        this.coinGroup = new CoinGroup(this, coinPoints, this.coins, this.player)
        this.coins = this.coinGroup.createCoins()
        this.coins.children.iterate((c) => { c.setTexture('coin') })
    }


    update() {
        // this.physics.collide(this.player, this.spikesGroup, () => {this.player.x = 0; this.player.y = 0})
        // this.physics.collide(this.player, this.foregroundLayer)
        if (this.cursors.left.isDown) {
            this.player.play('walk')
            this.player.update(-1)
        } if (this.cursors.right.isDown) {
            this.player.play('walk')
            this.player.update(1)
        } if (this.cursors.up.isDown) {
            this.player.play('walk')
            this.player.update(2)
        } if (this.cursors.down.isDown) {
            this.player.play('walk')
            this.player.update(3)
        } else if (this.cursors.up.isUp && this.cursors.down.isUp &&
            this.cursors.left.isUp && this.cursors.right.isUp) {
            this.player.update(4)
        } else {
            this.player.update()
        }

        if (this.cursors.up.isUp && this.cursors.down.isUp) {
            this.player.body.setVelocityY(0)
        }

        if (this.cursors.left.isUp && this.cursors.right.isUp) {
            this.player.body.setVelocityX(0)
        }

        if (Phaser.Geom.Rectangle.Contains(this.endpoint, this.player.x, this.player.y) &&
            this.coinGroup.numberOfCoinsCollected >= this.coinGroup.numberOfCoins) {
            console.log("reach end")
            gameState.levelCompletion[3] = true
            this.scene.start('level4')
        }
        if(this.ONE.isDown) this.scene.start('level1')
        if(this.TWO.isDown) this.scene.start('level2')
        if(this.THREE.isDown) this.scene.start('level3')
        if(this.FOUR.isDown) this.scene.start('level4')
        if(this.FIVE.isDown) this.scene.start('level5')
        if(this.SIX.isDown) this.scene.start('level6')
        if(this.SEVEN.isDown) this.scene.start('level7')
        if(this.EIGHT.isDown) this.scene.start('level8')
        if(this.NINE.isDown) this.scene.start('level9')

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            console.log("IM CALLED")
            let bullet = this.player.getBullet()
            console.log("bullet is null?: " + bullet)
            if (bullet == null && this.player.numberOfShots > 0) {
                this.player.numberOfShots --
                this.player.fireBullet()
            }
            else
                this.player.blink()
        }

        this.shotText.setText('Number of Shots: ' + this.player.numberOfShots)
        this.coinText.setText('Coins collected: ' + this.coinGroup.numberOfCoinsCollected)
    }

    resetPlayer() {
        this.player.numberOfShots = 3
        // this.sound.play('hit')
        this.coinGroup.createCoins()
        this.coins.children.iterate((c) => { c.setTexture('coin') })
        this.player.body.x = this.startpoint.x
        this.player.body.y = this.startpoint.y
    }
}