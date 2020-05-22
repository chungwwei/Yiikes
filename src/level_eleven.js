import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import blueCircle from './assets/blue_circle.png';
import level_11_JSON from "./assets/level11.json";
import { Player } from "./player";
import homeImg from "./assets/home_black_48x48.png"
import squareImg from "./assets/square.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import pauseImg from "./assets/pause_black_48x48.png"
import { gameState } from ".";
import coinImg from './assets/coin.png'
import { CoinGroup } from "./coin_system";
import dyingSheet from "./assets/dying.png"
import idleSheet from "./assets/idle.png"
import walkingSheet from "./assets/walking.png"
import characterImg from './assets/character.png'
import { createSplineAccelerateFollower, createLaserTriggerFollower, createSplineFollower } from "./followers/polygon_follower";
import { setUpBridgeTriggers, setUpEnemyTriggers, resetPlayerWithTilesRemoved } from "./triggers/triggers";
import starImg from "./assets/star.png"
import emptyStarImg from "./assets/empty_star.png"
import homeButtonImg from "./assets/home_button.png"
import playButtonImg from "./assets/play_button.png"
import restartButtonImg from "./assets/restart_button.png"
import menu from "./assets/menu.png"


var pickupSound = require('./assets/audio/pickup.wav')
var hitSound = require('./assets/audio/hit.ogg')
var clickSound = require('./assets/audio/click.wav')
var levelMusic = require('./assets/audio/IttyBitty8Bit.mp3')

export class Level11 extends Phaser.Scene {
    
    constructor() {
        super('level11')
        this.player = null
        this.spacebar = null
        this.starThreshold = {oneStar: 10, twoStar: 5, threeStar: 2}
        this.shotsFire = 0
    }

    preload() {
        this.load.image('tiles', tilesImg)
        this.load.tilemapTiledJSON('map11', level_11_JSON)
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
        this.load.image('star', starImg)
        this.load.image('empty_star', emptyStarImg)
        this.load.image('play_button', playButtonImg)
        this.load.image('home_button', homeButtonImg)
        this.load.image('restart_button', restartButtonImg)
        this.load.image('menu', menu)

        this.load.audio('hit', hitSound)
        this.load.audio('click', clickSound)
        this.load.audio('pickup', pickupSound)
        this.load.audio('music', levelMusic)
    }

    create() {
        const map = this.make.tilemap({key: 'map11'})
        const tiles = map.addTilesetImage('yiikes_tiles', 'tiles')
        this.backgroundLayer = map.createDynamicLayer('background', tiles)
        this.foregroundLayer = map.createDynamicLayer('foreground', tiles, 0, 0, 60 * 16, 60 * 16, 16, 16)
        this.bridgeLayer     = map.createBlankDynamicLayer('bridges', tiles, 0, 0, 60 * 16, 60 * 16, 16, 16)
        this.levelCompleted = false
        // Spawn Points
        console.log(map.objects)
        const start_end_points = map.getObjectLayer('start_end_points')['objects']
        const pointA = start_end_points[0]
        const pointB = start_end_points[1]
        this.startpoint = this.add.rectangle(pointA.x, pointA.y, pointA.width, pointA.height)
        this.endpoint = this.add.rectangle(pointB.x, pointB.y, pointB.width, pointB.height)
        this.endpoint.setOrigin(0)
        this.physics.add.existing(this.endpoint)
        // Player
        this.player = new Player(this, this.startpoint.x, this.startpoint.y, 
                                    25, 25, this.foregroundLayer)
        this.physics.add.existing(this.player)
        this.player.setTexture('character')
        this.player.body.setSize(25, 25)
        // Player animations
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
        // Player Collisions
        this.player.body.collideWorldBounds = true
        this.foregroundLayer.setCollisionBetween(-1, 1, true, true)
        this.physics.add.collider(this.player, this.foregroundLayer, ()=>{
            console.log("collision")
        })
        this.player.setInteractive()
        // Set up sounds and music
        this.hitAudio = this.sound.add('hit', {volume: gameState.volume})
        this.pickupAudio = this.sound.add('pickup', {volume: gameState.volume})
        this.clickAudio = this.sound.add('click', {volume: gameState.volume})
        this.levelMusic = this.sound.add('music', {volume: gameState.volume})
        this.levelMusic.play({loop: true, volume: gameState.volume})
        // Spacebar set up
        this.cursors = this.input.keyboard.createCursorKeys()
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        // Y patrols
        const points = map.getObjectLayer('patrol_points_y')['objects']
        this.yFollower = []
        for (let i = 0; i < points.length; i += 2) {
            let point_1 = points[i]
            let point_2 = points[i + 1]
            let x_1 = point_1.x, x_2 = point_2.x
            let y_1 = point_1.y, y_2 = point_2.y
            let path = new Phaser.Curves.Path(x_2, y_2).lineTo(x_1, y_1)
            var patrolFollower = this.add.follower(path, x_1, y_2, 'square');
            patrolFollower.startFollow({
                repeat: -1,
                duration: 1000,
                yoyo: true
            })
            this.yFollower.push(patrolFollower)
            this.physics.world.enable(patrolFollower)
            this.physics.add.collider(patrolFollower, this.player, () => {
                this.resetPlayer()
            })   
        }

        // SplinePoints Patrols
        const splinePoints = map.getObjectLayer('spline_points')['objects']
        const splinePoints2 = map.getObjectLayer('spline_points2')['objects']
        this.follower = createSplineFollower(this, splinePoints, 6000, 'square')
        this.follower2 = createSplineFollower(this, splinePoints2, 6000, 'square')
        this.physics.add.overlap(this.follower, this.player, () => { this.resetPlayer() })
        this.physics.add.overlap(this.follower2, this.player, () => { this.resetPlayer() })

        // Bridges
        this.bridgeTriggers = map.getObjectLayer('bridge_triggers')['objects']
        this.bridgeRects    = map.getObjectLayer('bridges')['objects']
        this.bridgeTriggerGroup = this.add.group()
        this.bridges = this.add.group()
        console.log(this.bridgeRects)
        setUpBridgeTriggers(this, this.bridgeTriggers, this.bridgeRects, this.foregroundLayer, this.bridgeTriggerGroup, this.bridges, this.player)
        
        // Coins
        const coinPoints = map.getObjectLayer('coins')['objects']
        this.coins = this.add.group()
        this.coinGroup = new CoinGroup(this, coinPoints, this.coins, this.player, this.pickupAudio)
        this.coins = this.coinGroup.createCoins()
        this.coins.children.iterate((c) => { c.setTexture('coin') })

        var keys = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','ZERO','MINUS','PLUS']
        for(let i = 0; i < keys.length; i++){
            this[keys[i]] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[i]]);
        }

        // set ui 
        this.setUpHud()
        this.deathText= this.add.text(200, 100, 'Death: ' + gameState.death)
        this.shotText= this.add.text(600, 100, 'Shots: ' + this.shotsFire)
        this.coinText = this.add.text(400, 100, 'Coins collected: 0')
        this.muteMusicSetUp()
    }


    update() {
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

        if (Phaser.Geom.Rectangle.Contains(this.endpoint, this.player.x, this.player.y)) {
            if(!this.levelCompleted){
                if(this.coinGroup.numberOfCoinsCollected != 3){
                    if(gameState.starSystem.getLevel(11) < 1){
                        gameState.starSystem.setStars(11, 1)
                    }
                }
                else if(this.shotsFire <= this.starThreshold.threeStar){
                    if(gameState.starSystem.getLevel(11) < 3){
                        gameState.starSystem.setStars(11, 3)
                    }
                }
                else if((this.shotsFire > this.starThreshold.threeStar) && (this.shotsFire < this.starThreshold.twoStar)){
                    if(gameState.starSystem.getLevel(11) < 2){
                        gameState.starSystem.setStars(11, 2)
                    }
                } else {
                    if(gameState.starSystem.getLevel(11) < 1){
                        gameState.starSystem.setStars(11, 1)
                    }
                }
                this.levelCompleted = true
                this.menu = this.add.sprite(960/2, 960/2, 'menu');
                this.choiceLabel = this.add.text(960/2 - 100, 960/2-200, 'Level 11 Completed!', { font: '30px Arial', fill: '#000' });
                if(gameState.starSystem.getLevel(11) == 3){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'star')
                } else if (gameState.starSystem.getLevel(11) == 2){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins or Only Use 2 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                } else if (gameState.starSystem.getLevel(11) == 1){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins or Only Use 2 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                } else {
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'empty_star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins or Only Use 2 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                }
                this.playButton = this.add.sprite(960/2 + 175, 650, 'play_button')
                this.restartButton = this.add.sprite(960/2, 650, 'restart_button')
                this.homeButton = this.add.sprite(960/2 - 175, 650, 'home_button')
                this.playButton.setInteractive()
                this.restartButton.setInteractive()
                this.homeButton.setInteractive()
                this.playButton.on('pointerdown', () => {
                    this.switchLevel('level12')
                })
                this.homeButton.on('pointerdown', () => {
                    this.killMusic()
                    this.scene.start('main_screen')
                })
                this.restartButton.on('pointerdown', () => {
                    this.switchLevel('level11')
                })
            }
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
        if(this.ZERO.isDown) this.switchLevel('level10')
        if(this.MINUS.isDown) this.switchLevel('level11')
        if(this.PLUS.isDown) this.switchLevel('level12')

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            console.log("IM CALLED")
            let bullet = this.player.getBullet()
            console.log("bullet is null?: " + bullet)
            if (bullet == null) {
                this.shotsFire += 1
                this.player.fireBullet()
            }
            else
                this.player.blink()
        }


        this.coinText.setText('Coins collected: ' + this.coinGroup.numberOfCoinsCollected)
        this.shotText.setText('Shots: ' + this.shotsFire)
    }
    switchLevel(level) {
        this.killMusic()
        this.scene.start(level)
    }
    resetPlayer() {
        gameState.death += 1
        this.shotsFire = 0
        this.deathText.setText('Death: ' + gameState.death)
        resetPlayerWithTilesRemoved(this.hitAudio, this.coinGroup, this.coins, this.player, this.startpoint)
        setUpBridgeTriggers(this, this.bridgeTriggers, this.bridgeRects, this.foregroundLayer, this.bridgeTriggerGroup, this.bridges, this.player)

    }

    pauseMusic() { this.levelMusic.pause() }
    resumeMusic() { this.levelMusic.resume() }
    killMusic() { this.levelMusic.destroy() }
    setUpHud() {
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
                this.yFollower.forEach((f) => {
                    f.pauseFollow()
                })
                this.follower.pauseFollow()
                this.follower2.pauseFollow()
                this.menu = this.add.sprite(960/2, 960/2, 'menu');
                this.choiceLabel = this.add.text(960/2 - 50, 960/2-200, 'Pause', { font: '30px Arial', fill: '#000' });
                if(gameState.starSystem.getLevel(11) == 3){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'star')
                } else if (gameState.starSystem.getLevel(11) == 2){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                } else if (gameState.starSystem.getLevel(11) == 1){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                } else {
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'empty_star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                }
                this.playButton = this.add.sprite(960/2 + 175, 650, 'play_button')
                this.restartButton = this.add.sprite(960/2, 650, 'restart_button')
                this.homeButton = this.add.sprite(960/2 - 175, 650, 'home_button')
                this.playButton.setInteractive()
                this.restartButton.setInteractive()
                this.homeButton.setInteractive()
                this.playButton.on('pointerdown', () => {
                    this.unpause()
                })
                this.homeButton.on('pointerdown', () => {
                    this.killMusic()
                    this.scene.start('main_screen')
                })
                this.restartButton.on('pointerdown', () => {
                    this.switchLevel('level11')
                    this.shotsFire = 0
                })
                this.player.speed = 0
                this.pauseMusic()
                this.toggle = 0
                this.btSwitch.setTexture('play')
            } else {
                this.unpause()
            }
        })
    }
    unpause(){
        this.yFollower.forEach((f) => {
            f.resumeFollow()
        })
        this.follower.resumeFollow()
        this.follower2.resumeFollow()
        this.player.speed = 80
        this.resumeMusic()
        this.toggle = 1
        this.btSwitch.setTexture('pause')
        this.menu.destroy();
        this.choiceLabel.destroy();
        this.star1.destroy();
        this.star2.destroy();
        this.star3.destroy();
        this.playButton.destroy()
        this.restartButton.destroy()
        this.homeButton.destroy()
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