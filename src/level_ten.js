import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import pauseImg from "./assets/pause_black_48x48.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import homeImg from "./assets/home_black_48x48.png"
import level_10_JSON from "./assets/level10.json";
import { Player } from "./player";
import { gameState } from ".";
import blueCircle from "./assets/blue_circle.png"
import squareImg from "./assets/square.png"
import dyingSheet from "./assets/dying.png"
import idleSheet from "./assets/idle.png"
import walkingSheet from "./assets/walking.png"
import characterImg from './assets/character.png'
import coinImg from './assets/coin.png'
import { CoinGroup } from "./coin_system";
import { createSplineAccelerateFollower, createLaserTriggerFollower, createSplineFollower } from "./followers/polygon_follower";
import { setUpBridgeTriggers, setUpEnemyTriggers, resetPlayerWithTilesRemoved } from "./triggers/triggers";
var pickupSound = require('./assets/audio/pickup.wav')
var hitSound = require('./assets/audio/hit.ogg')
var clickSound = require('./assets/audio/click.wav')
var levelMusic = require('./assets/audio/IttyBitty8Bit.mp3')
export class Level10 extends Phaser.Scene {
    
    constructor() {
        super('level10')
        this.player = null
        this.spacebar = null
        this.bullet = null
    }

    preload() {
        console.log('loading')
        this.load.image('tiles', tilesImg)
        this.load.tilemapTiledJSON('map', level_10_JSON)
        this.load.image('play', playImg)
        this.load.image('pause', pauseImg)
        this.load.image('home', homeImg)
        this.load.image('blue_circle', blueCircle)
        this.load.image('square', squareImg)
        this.load.spritesheet('dying_sheet', dyingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('idle_sheet', idleSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('walk_sheet', walkingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.image('character', characterImg)
        this.load.image('coin', coinImg)

        this.load.audio('hit', hitSound)
        this.load.audio('click', clickSound)
        this.load.audio('pickup', pickupSound)
        this.load.audio('music', levelMusic)
    }

    create() {
        const map = this.make.tilemap({key: 'map'})
        const tiles = map.addTilesetImage('yiikes_tiles', 'tiles')
        this.backgroundLayer = map.createDynamicLayer('background', tiles)
        this.foregroundLayer = map.createDynamicLayer('foreground', tiles, 0, 0, 60 * 16, 60 * 16, 16, 16)
        this.bridgeLayer     = map.createBlankDynamicLayer('bridges', tiles, 0, 0, 60 * 16, 60 * 16, 16, 16)


        const start_end_points = map.getObjectLayer('start_end_points')['objects']
        const pointA = start_end_points[0]
        const pointB = start_end_points[1]
        
        this.startpoint = this.add.rectangle(pointA.x, pointA.y, pointA.width, pointA.height)
        this.endpoint = this.add.rectangle(pointB.x, pointB.y, pointB.width, pointB.height, '0xff0000')
        this.endpoint.setOrigin(0)
        this.physics.add.existing(this.endpoint)

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

        this.player.setInteractive()
        this.cursors = this.input.keyboard.createCursorKeys()

        // audio
        this.hitAudio = this.sound.add('hit')
        this.pickupAudio = this.sound.add('pickup')
        this.clickAudio = this.sound.add('click')
        this.levelMusic = this.sound.add('music')
        this.levelMusic.play({loop: true, voluem: gameState.volume })

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.pointsGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })
        
        this.followers = []
        
        var keys = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE']
        for(let i = 0; i < keys.length; i++){
            this[keys[i]] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[i]]);
        }

        this.setUpHud()
        this.muteMusicSetUp()
        const coinPoints = map.getObjectLayer('coins')['objects']
        this.coins = this.add.group()
        this.coinGroup = new CoinGroup(this, coinPoints, this.coins, this.player, this.pickupAudio)
        this.coins = this.coinGroup.createCoins()
        this.coins.children.iterate((c) => { c.setTexture('coin') })

        this.wallPoints = map.getObjectLayer('wall_points')['objects']
        this.triggers = map.getObjectLayer('wall_triggers')['objects']
        this.bridgeTriggers = map.getObjectLayer('bridge_triggers')['objects']
        this.bridgeRects    = map.getObjectLayer('bridges')['objects']
        const splinePoints = map.getObjectLayer('spline_points')['objects']
        this.follower = createSplineFollower(this, splinePoints, 6000, 'square')
        this.enemiesGroup = this.add.group()
        this.bridgeTriggerGroup = this.add.group()
        this.bridges = this.add.group()
        setUpBridgeTriggers(this, this.bridgeTriggers, this.bridgeRects, this.foregroundLayer, this.bridgeTriggerGroup, this.bridges, this.player)
        setUpEnemyTriggers(this, this.triggers, this.wallPoints, this.player, this.enemiesGroup)
        this.physics.add.overlap(this.enemiesGroup, this.player, () => { this.resetPlayer() })
        this.physics.add.overlap(this.follower, this.player, () => { this.resetPlayer() })  

    }
 

    update() {
        this.factor -= 0.3
        if (this.factor > 3) this.factor = 2
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
            this.player.update(100)
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
            gameState.levelCompletion[1] = true
            this.killMusic()
            this.scene.start('main_screen')
        }
        
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
        if(this.ONE.isDown) this.switchLevel('level1')
        if(this.TWO.isDown) this.switchLevel('level2')
        if(this.THREE.isDown) this.switchLevel('level3')
        if(this.FOUR.isDown) this.switchLevel('level4')
        if(this.FIVE.isDown) this.switchLevel('level5')
        if(this.SIX.isDown) this.switchLevel('level6')
        if(this.SEVEN.isDown) this.switchLevel('level7')
        if(this.EIGHT.isDown) this.switchLevel('level8')
        if(this.NINE.isDown) this.switchLevel('level9')

        this.shotText.setText('Number of Shots: ' + this.player.numberOfShots)
        this.coinText.setText('Coins collected: ' + this.coinGroup.numberOfCoinsCollected)

    }
    switchLevel(level) {
        this.killMusic()
        this.scene.start(level)
    }

    resetPlayer() {
        resetPlayerWithTilesRemoved(this.hitAudio, this.coinGroup, this.coins, this.player, this.startpoint)
        setUpBridgeTriggers(this, this.bridgeTriggers, this.bridgeRects, this.foregroundLayer, this.bridgeTriggerGroup, this.bridges, this.player)
        this.enemiesGroup.clear(true, true)
        setUpEnemyTriggers(this, this.triggers, this.wallPoints, this.player, this.enemiesGroup)
    }

    pauseMusic() { this.levelMusic.pause() }
    resumeMusic() { this.levelMusic.resume() }
    killMusic() { this.levelMusic.destroy() }

    setUpHud() {
        // 1 for play, 0 for pause
        this.btHome  = this.add.image(100, 100, 'home')
        this.btSwitch = this.add.image(860, 100, 'pause')
        
        this.btHome.setInteractive()
        this.btSwitch.setInteractive()

        this.btHome.on('pointerdown', () => {
            this.clickAudio.play()
            this.killMusic()
            this.scene.start('main_screen')
        })

        this.toggle = 1
        this.btSwitch.on('pointerdown', () => {
            // game is on, like to pause it
            if (this.toggle === 1) {
                this.follower.pauseFollow()
                this.enemiesGroup.children.iterate(f => { f.pauseFollow()})
                this.pauseMusic()
                this.toggle = 0
                this.btSwitch.setTexture('play')
            } else {
                this.follower.resumeFollow()
                this.enemiesGroup.children.iterate(f => { f.resumeFollow()})
                this.resumeMusic()
                this.toggle = 1
                this.btSwitch.setTexture('pause')
            }
        })

        this.shotText = this.add.text(200, 100, 'Number of Shots: 3')
        this.coinText = this.add.text(400, 100, 'Coins collected: 0')
    }

    muteMusicSetUp() {
        this.mKey = this.input.keyboard.addKey('M')
        this.jKey = this.input.keyboard.addKey('J')
        this.kKey = this.input.keyboard.addKey('K')
        this.mKey.addListener('down', () => {
            gameState.volume = 0
            this.levelMusic.volume = 0
            this.hitAudio.volume = 0
            this.clickAudio.volume = 0
            this.pickupAudio.volume = 0
        })

        this.jKey.addListener('down', () => {
            gameState.volume = gameState.volume - 0.1
            if (gameState.volume <= 0) gameState.volume = 0
            this.levelMusic.volume = gameState.volume
            this.hitAudio.volume = gameState.volume
            this.clickAudio.volume = gameState.volume
            this.pickupAudio.volume = gameState.volume
        })

        this.kKey.addListener('down', () => {
            gameState.volume = gameState.volume + 0.1
            if (gameState.volume >= 1) gameState.volume = 1
            this.levelMusic.volume = gameState.volume
            this.hitAudio.volume = gameState.volume
            this.clickAudio.volume = gameState.volume
            this.pickupAudio.volume = gameState.volume
        })
    }
}