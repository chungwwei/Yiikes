import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import blueCircle from './assets/blue_circle.png';
import level_6_JSON from "./assets/level6.json";
import { Player } from "./player";
import { gameState } from ".";
import homeImg from "./assets/home_black_48x48.png";
import squareImg from "./assets/square.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import pauseImg from "./assets/pause_black_48x48.png"
import coinImg from './assets/coin.png'
import { CoinGroup } from "./coin_system";
import dyingSheet from "./assets/dying.png"
import idleSheet from "./assets/idle.png"
import walkingSheet from "./assets/walking.png"
import characterImg from './assets/character.png'
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

export class Level6 extends Phaser.Scene {
    
    constructor() {
        super('level6')
        this.player = null
        this.spacebar = null
        this.starThreshold = {oneStar: 30, twoStar: 12, threeStar: 8}
        this.shotsFire = 0
        this.waterSpeed = 1
    }

    preload() {
        this.load.image('tiles', tilesImg)
        this.load.tilemapTiledJSON('map6', level_6_JSON)
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
        const map = this.make.tilemap({key: 'map6'})
        const tiles = map.addTilesetImage('yiikes_tiles', 'tiles')
        this.backgroundLayer = map.createStaticLayer('background', tiles)
        this.foregroundLayer = map.createStaticLayer('foreground', tiles)
        this.laserLayer = map.createStaticLayer('lasers', tiles)
        this.levelCompleted = false
        // Spawn Points
        const start_end_points = map.getObjectLayer('start_end_points')['objects']
        const pointA = start_end_points[0]
        const pointB = start_end_points[1]
        const pointC = start_end_points[2]
        this.startpoint = this.add.rectangle(pointA.x, pointA.y, pointA.width, pointA.height)
        this.endpoint = this.add.rectangle(pointB.x, pointB.y, pointB.width, pointB.height)
        this.endpoint.setOrigin(0)
        this.checkpoint = this.add.rectangle(pointC.x, pointC.y, pointC.width, pointC.height)
        this.checkpoint.setOrigin(.5)
        this.physics.add.existing(this.endpoint)
        // Player
        this.player = new Player(this, this.startpoint.x, this.startpoint.y, 
                                    25, 25, this.foregroundLayer)
        this.player.numberOfShots = this.numberofbullets
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
        this.laserLayer.setCollisionBetween(21, 25, true, true)
        this.physics.add.collider(this.player, this.laserLayer, () => {
            this.resetPlayer()
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

        this.pointsGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })
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
                duration: 1500,
                yoyo: true
            })
            this.yFollower.push(patrolFollower)
            this.physics.world.enable(patrolFollower)
            this.physics.add.collider(patrolFollower, this.player, () => {
                this.resetPlayer()
            })   
        }
        // X patrols
        const x_points = map.getObjectLayer('patrol_points_x')['objects']
        this.xFollower = []
        for (let i = 0; i < x_points.length; i += 2) {
            let point_1 = x_points[i]
            let point_2 = x_points[i + 1]
            let x_1 = point_1.x, x_2 = point_2.x
            let y_1 = point_1.y, y_2 = point_2.y
            let path = new Phaser.Curves.Path(x_1, y_1).lineTo(x_2, y_2)
            var patrolFollower = this.add.follower(path, x_1, y_2, 'square');
            patrolFollower.startFollow({
                repeat: -1,
                duration: 1500,
                yoyo: true
            })
            this.xFollower.push(patrolFollower)
            this.physics.world.enable(patrolFollower)
            this.physics.add.collider(patrolFollower, this.player, () => {
                this.resetPlayer()
            })   
        }
        // ball patrols
        var circlePath_1 = new Phaser.Curves.Path(100, 300).circleTo(90)
        var circlePath_2 = new Phaser.Curves.Path(400, 800).circleTo(100)
        var circlePath_3 = new Phaser.Curves.Path(400, 800).circleTo(100)
        var circlePath_4 = new Phaser.Curves.Path(400, 800).circleTo(100)

        this.ball1 = this.add.follower(circlePath_1, 190, 425, 'blue_circle');
        this.ball2 = this.add.follower(circlePath_2, 800, 625, 'blue_circle');
        this.ball3 = this.add.follower(circlePath_3, 550, 625, 'blue_circle');
        this.ball4 = this.add.follower(circlePath_4, 300, 625, 'blue_circle');

        this.physics.world.enable(this.ball1)
        this.physics.world.enable(this.ball2)
        this.physics.world.enable(this.ball3)
        this.physics.world.enable(this.ball4)

        this.ball1.body.setCircle(32)
        this.ball2.body.setCircle(32)
        this.ball3.body.setCircle(32)
        this.ball4.body.setCircle(32)

        this.ball1.startFollow({
            repeat: 100000,
            duration: 3000,
        });
        this.ball2.startFollow({
            repeat: 100000,
            duration: 3000,
        });
        this.ball3.startFollow({
            repeat: 100000,
            duration: 3000,
        });
        this.ball4.startFollow({
            repeat: 100000,
            duration: 3000,
        });

        this.physics.add.overlap(this.ball1, this.player, () => {
            this.resetPlayer()
        })
        this.physics.add.overlap(this.ball2, this.player, () => {
            this.resetPlayer()
        })
        this.physics.add.overlap(this.ball3, this.player, () => {
            this.resetPlayer()
        })
        this.physics.add.overlap(this.ball4, this.player, () => {
            this.resetPlayer()
        })
        // Waterpaths
        const water_down = map.getObjectLayer('water_down')['objects']
        let water_down1 = water_down[0]
        this.wd1 = this.add.rectangle(water_down1.x, water_down1.y, water_down1.width, water_down1.height)
        
        const water_right = map.getObjectLayer('water_right')['objects']
        let water_right1 = water_right[0]
        let water_right2 = water_right[1]
        let water_right3 = water_right[2]
        this.wr1 = this.add.rectangle(water_right1.x, water_right1.y, water_right1.width, water_right1.height)
        this.wr2 = this.add.rectangle(water_right2.x, water_right2.y, water_right2.width, water_right2.height)
        this.wr3 = this.add.rectangle(water_right3.x, water_right3.y, water_right3.width, water_right3.height)
        
        const water_left = map.getObjectLayer('water_left')['objects']
        let water_left1 = water_left[0]
        this.wl1 = this.add.rectangle(water_left1.x, water_left1.y, water_left1.width, water_left1.height)
        let water_left2 = water_left[1]
        this.wl2 = this.add.rectangle(water_left2.x, water_left2.y, water_left2.width, water_left2.height)

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
                    if(gameState.starSystem.getLevel(6) < 1){
                        gameState.starSystem.setStars(6, 1)
                    }
                }
                else if(this.shotsFire <= this.starThreshold.threeStar){
                    if(gameState.starSystem.getLevel(6) < 3){
                        gameState.starSystem.setStars(6, 3)
                    }
                }
                else if((this.shotsFire > this.starThreshold.threeStar) && (this.shotsFire < this.starThreshold.twoStar)){
                    if(gameState.starSystem.getLevel(6) < 2){
                        gameState.starSystem.setStars(6, 2)
                    }
                } else {
                    if(gameState.starSystem.getLevel(6) < 1){
                        gameState.starSystem.setStars(6, 1)
                    }
                }
                this.levelCompleted = true
                this.menu = this.add.sprite(960/2, 960/2, 'menu');
                this.choiceLabel = this.add.text(960/2 - 100, 960/2-200, 'Level 6 Completed!', { font: '30px Arial', fill: '#000' });
                if(gameState.starSystem.getLevel(6) == 3){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'star')
                } else if (gameState.starSystem.getLevel(6) == 2){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins or Only Use 8 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                } else if (gameState.starSystem.getLevel(6) == 1){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins or Only Use 8 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                } else {
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'empty_star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins or Only Use 8 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                }
                this.playButton = this.add.sprite(960/2 + 175, 650, 'play_button')
                this.restartButton = this.add.sprite(960/2, 650, 'restart_button')
                this.homeButton = this.add.sprite(960/2 - 175, 650, 'home_button')
                this.playButton.setInteractive()
                this.restartButton.setInteractive()
                this.homeButton.setInteractive()
                this.playButton.on('pointerdown', () => {
                    this.switchLevel('level7')
                })
                this.homeButton.on('pointerdown', () => {
                    this.killMusic()
                    this.scene.start('main_screen')
                })
                this.restartButton.on('pointerdown', () => {
                    this.switchLevel('level6')
                })
            }
        }
        if (Phaser.Geom.Rectangle.Contains(this.checkpoint, this.player.x, this.player.y) 
            ) {
            this.startpoint = this.checkpoint
            this.player.numberOfShots = this.numberofbullets
        }
        if (Phaser.Geom.Rectangle.Contains(this.wd1, this.player.x, this.player.y)){
            this.player.y += this.waterSpeed
        }
        if (Phaser.Geom.Rectangle.Contains(this.wr1, this.player.x, this.player.y) ||
            Phaser.Geom.Rectangle.Contains(this.wr2, this.player.x, this.player.y) ||
            Phaser.Geom.Rectangle.Contains(this.wr3, this.player.x, this.player.y)){
            this.player.x += this.waterSpeed
        }
        if (Phaser.Geom.Rectangle.Contains(this.wl1, this.player.x, this.player.y) ||
            Phaser.Geom.Rectangle.Contains(this.wl2, this.player.x, this.player.y)){
            this.player.x -= this.waterSpeed
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
        this.hitAudio.play()
        this.coinGroup.createCoins()
        this.coins.children.iterate((c) => { c.setTexture('coin') })
        this.player.body.x = this.startpoint.x
        this.player.body.y = this.startpoint.y
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
                this.waterSpeed = 0
                this.xFollower.forEach((f) => {
                    f.pauseFollow()
                })
                this.yFollower.forEach((f) => {
                    f.pauseFollow()
                })
                this.ball1.pauseFollow()
                this.ball2.pauseFollow()
                this.ball3.pauseFollow()
                this.ball4.pauseFollow()
                this.menu = this.add.sprite(960/2, 960/2, 'menu');
                this.choiceLabel = this.add.text(960/2 - 50, 960/2-200, 'Pause', { font: '30px Arial', fill: '#000' });
                if(gameState.starSystem.getLevel(6) == 3){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'star')
                } else if (gameState.starSystem.getLevel(6) == 2){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                } else if (gameState.starSystem.getLevel(6) == 1){
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
                    this.switchLevel('level5')
                    this.shotsFire = 0
                })
                this.player.speed = 0
                this.toggle = 0
                this.pauseMusic()
                this.btSwitch.setTexture('play')
            } else {
                this.unpause()
            }
        })
    }
    unpause(){
        this.waterSpeed = 1
        this.xFollower.forEach((f) => {
            f.resumeFollow()
        })
        this.yFollower.forEach((f) => {
            f.resumeFollow()
        })
        this.ball1.resumeFollow()
        this.ball2.resumeFollow()
        this.ball3.resumeFollow()
        this.ball4.resumeFollow()
        this.player.speed = 80
        this.toggle = 1
        this.resumeMusic()
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