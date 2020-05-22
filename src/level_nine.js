import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import level_9_JSON from "./assets/level9.json";
import { Player } from "./player";
import { gameState } from ".";
import homeImg from "./assets/home_black_48x48.png";
import squareImg from "./assets/square.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import pauseImg from "./assets/pause_black_48x48.png"
import coinImg from "./assets/coin.png"
import keyImg from "./assets/key.png"
import { CoinGroup } from "./coin_system";
import dyingSheet from "./assets/dying.png"
import idleSheet from "./assets/idle.png"
import menu from "./assets/menu.png"
import walkingSheet from "./assets/walking.png"
import characterImg from './assets/character.png'
import starImg from "./assets/star.png"
import emptyStarImg from "./assets/empty_star.png"
import homeButtonImg from "./assets/home_button.png"
import playButtonImg from "./assets/play_button.png"
import restartButtonImg from "./assets/restart_button.png"


var pickupSound = require('./assets/audio/pickup.wav')
var hitSound = require('./assets/audio/hit.ogg')
var clickSound = require('./assets/audio/click.wav')
var levelMusic = require('./assets/audio/IttyBitty8Bit.mp3')
//Star System Lines Changed: 28-29, 60, 182, 222-236, 270, 278
export class Level9 extends Phaser.Scene {
    constructor() {
        super('level9')
        this.player = null
        this.spacebar = null
        this.starThreshold = {oneStar: 10, twoStar: 5, threeStar: 0}
        this.shotsFired = 0    
    }

    preload() {
        this.load.image('tiles', tilesImg)
        this.load.tilemapTiledJSON('map9', level_9_JSON)
        this.load.image('home', homeImg)
        this.load.image('square', squareImg)
        this.load.image('play', playImg)
        this.load.image('pause', pauseImg)
        this.load.image('coin', coinImg)
        this.load.image('key', keyImg)
        this.load.image('menu', menu)
        this.load.spritesheet('dying_sheet', dyingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('idle_sheet', idleSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('walk_sheet', walkingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.image('character', characterImg)
        this.load.image('star', starImg)
        this.load.image('empty_star', emptyStarImg)
        this.load.image('play_button', playButtonImg)
        this.load.image('home_button', homeButtonImg)
        this.load.image('restart_button', restartButtonImg)

        this.load.audio('hit', hitSound)
        this.load.audio('click', clickSound)
        this.load.audio('pickup', pickupSound)
        this.load.audio('music', levelMusic)
    }

    create() {
        const map = this.make.tilemap({key: 'map9'})
        const tiles = map.addTilesetImage('yiikes_tiles', 'tiles')
        this.backgroundLayer = map.createStaticLayer('background', tiles)
        this.foregroundLayer = map.createStaticLayer('foreground', tiles)
        this.laserLayer = map.createStaticLayer('lasers', tiles)
        this.wallLayer = map.createDynamicLayer('wall', tiles)
        this.isWallDestroyed = false
        this.shotsFired = 0
        this.levelCompleted = false 
        //Set Spawn Points
        const start_end_points = map.getObjectLayer('start_end_points')['objects']
        const pointA = start_end_points[0]
        const pointB = start_end_points[1]
        //Add Player to game
        this.startpoint = this.add.rectangle(pointA.x, pointA.y, pointA.width, pointA.height)
        this.endpoint = this.add.rectangle(pointB.x, pointB.y, pointB.width, pointB.height)
        this.player = new Player(this, this.startpoint.x, this.startpoint.y, 25, 25, this.foregroundLayer)
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
        //audio
        this.hitAudio = this.sound.add('hit', {volume: gameState.volume})
        this.pickupAudio = this.sound.add('pickup', {volume: gameState.volume})
        this.clickAudio = this.sound.add('click', {volume: gameState.volume})
        this.levelMusic = this.sound.add('music', {volume: gameState.volume})
        this.levelMusic.play({loop: true, volume: gameState.volume})
        //Initialize and texture the coins
        const coinPoints = map.getObjectLayer('coins')['objects']
        this.coins = this.add.group()
        this.coinGroup = new CoinGroup(this, coinPoints, this.coins, this.player, this.pickupAudio)
        this.coins = this.coinGroup.createCoins()
        this.coins.children.iterate((c) => { c.setTexture('coin') })
        //Add Player  Collision
        this.player.body.collideWorldBounds = true
        this.foregroundLayer.setCollisionBetween(-1, 1, true, true)
        this.physics.add.collider(this.player, this.foregroundLayer, ()=>{
            console.log("collision")
        })
        //Initialize and Texture Key
        this.keyPoints = map.getObjectLayer('key')['objects']
        this.setupKeys()
        //Add Player-Laser Collision
        // this.laserLayer.setCollisionBetween(21, 25, true, true)
        // this.physics.add.collider(this.player, this.laserLayer, () => {
        //     this.resetPlayer()
        // })
        //Add 'Wall Layer Collision
        this.wallLayer.setCollisionBetween(25, 25, true, true)
        this.physics.add.collider(this.player, this.wallLayer, () => {
        })
        this.player.setInteractive()
        //Set up Keyboard
        this.cursors = this.input.keyboard.createCursorKeys()
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        //Set up Patrol Units Y axis
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
                this.resetPlayer();
            })   
        }
        //Set up Patrol Units X
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
                duration: 1000,
                yoyo: true
            })
            this.xFollower.push(patrolFollower)
            this.physics.world.enable(patrolFollower)
            this.physics.add.collider(patrolFollower, this.player, () => {
                this.resetPlayer();
            })   
        }
        this.setUpHud()
        //Initialize Level Skip Cheats
        var keys = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','ZERO','MINUS','PLUS']
        for(let i = 0; i < keys.length; i++){
            this[keys[i]] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[i]]);
        }
        //Initialize Text UI
        this.deathText= this.add.text(200, 100, 'Death: ' + gameState.death)
        this.shotText= this.add.text(600, 100, 'Shots: ' + this.shotsFired)
        this.coinText = this.add.text(400, 100, 'Coins collected: 0')
        this.muteMusicSetUp()
    }

    update(){
        //???????
        this.physics.collide(this.player, this.foregroundLayer)
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
        if (!this.isWallDestroyed && this.numberOfKeys < 1){
            this.wallLayer.replaceByIndex(25, 17)
            this.wallLayer.setCollisionBetween(17,17, false)
        }
        //Check if player reaches end of level
        if (Phaser.Geom.Rectangle.Contains(this.endpoint, this.player.x, this.player.y) 
            && (this.numberOfKeys < 1)
            ) {
            if(this.levelCompleted == false){
                if(this.coinGroup.numberOfCoinsCollected != 9){
                    if(gameState.starSystem.getLevel(9) < 1){
                        gameState.starSystem.setStars(9, 1)
                    }
                } else if(this.shotsFired <= this.starThreshold.threeStar){
                    if(gameState.starSystem.getLevel(9) < 3){
                        gameState.starSystem.setStars(9, 3)
                    }
                } else if((this.shotsFired > this.starThreshold.threeStar) && (this.shotsFired < this.starThreshold.twoStar)){
                    if(gameState.starSystem.getLevel(9) < 2){
                        gameState.starSystem.setStars(9, 2)
                    }
                } else {
                    if(gameState.starSystem.getLevel(9) < 1){
                        gameState.starSystem.setStars(9, 1)
                    }
                }
                this.shotsFired = 0
                gameState.levelCompletion[9] = true
                this.levelCompleted = true
                this.menu = this.add.sprite(960/2, 960/2, 'menu');
                this.choiceLabel = this.add.text(960/2 - 100, 960/2-200, 'Level 8 Completed!', { font: '30px Arial', fill: '#000' });
                if(gameState.starSystem.getLevel(9) == 3){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'star')
                } else if (gameState.starSystem.getLevel(9) == 2){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins and Only Use 0 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                } else if (gameState.starSystem.getLevel(9) == 1){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins and Only Use 0 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                } else {
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'empty_star')
                    this.star2 = this.add.sprite(960/2, 400, 'empty_star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                    this.tipLabel = this.add.text(960/2 - 325, 960/2-300, 'Collect all Coins and Only Use 0 shots to get 3 stars', { font: '30px Arial', fill: '#000' });
                }
                this.playButton = this.add.sprite(960/2 + 175, 650, 'play_button')
                this.restartButton = this.add.sprite(960/2, 650, 'restart_button')
                this.homeButton = this.add.sprite(960/2 - 175, 650, 'home_button')
                this.playButton.setInteractive()
                this.restartButton.setInteractive()
                this.homeButton.setInteractive()
                this.playButton.on('pointerdown', () => {
                    this.switchLevel('level10')
                })
                this.homeButton.on('pointerdown', () => {
                    this.killMusic()
                    this.scene.start('main_screen')
                })
                this.restartButton.on('pointerdown', () => {
                    this.switchLevel('level9')
                })
            }
            
        }
        //Cheats Functionality
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
        //Player shooting and teleporting input
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            let bullet = this.player.getBullet()
            if (bullet == null) {
                //bullet collides with wall
                this.player.fireBullet()
                this.shotsFired += 1
                this.physics.add.collider(this.player.bullet, this.wallLayer, 
                    (bullet, layer) => {
                        this.player.bullet.destroy()
                        this.player.bullet = null
                        this.player.fireCoolDown = -1;
                })
            }
            else
                this.player.blink()
        }
        //Updates Shooting UI
        // this.shotText.setText('Number of Shots: ' + this.player.numberOfShots)
        this.coinText.setText('Coins collected: ' + this.coinGroup.numberOfCoinsCollected)
        this.shotText.setText('Shots: ' + this.shotsFired)
    }
    switchLevel(level) {
        this.killMusic()
        this.scene.start(level)
    }
    resetPlayer() {
        gameState.death += 1
        this.shotsFired = 0
        this.deathText.setText('Death: ' + gameState.death)
        this.hitAudio.play()
        this.coinGroup.createCoins()
        this.coins.children.iterate((c) => { c.setTexture('coin') })
        this.player.body.x = this.startpoint.x
        this.player.body.y = this.startpoint.y
        this.setupKeys()
        this.wallLayer.replaceByIndex(17, 25)
        this.wallLayer.setCollisionBetween(25, 25, true, true)
    }
    setupKeys(){
        this.numberOfKeys = this.keyPoints.length
        this.keys = this.add.group()
        this.keys.clear(true, true)
        for(let i = 0; i < this.keyPoints.length; i ++){
            let point = this.keyPoints[i]
            let c = this.add.sprite(point.x, point.y)
            this.keys.add(c)
            this.physics.world.enable(c)
            this.physics.add.overlap(c, this.player, () => {
                this.numberOfKeys--
                c.destroy()
            })  
        }
        this.keys.children.iterate((c) => { c.setTexture('key') })
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
        //Pause Mechanic
        this.toggle = 1
        this.btSwitch.on('pointerdown', () => {
            if (this.toggle === 1) {
                this.xFollower.forEach((f) => {
                    f.pauseFollow()
                })
                this.yFollower.forEach((f) => {
                    f.pauseFollow()
                })
                //Pause UI
                this.menu = this.add.sprite(960/2, 960/2, 'menu');
                this.choiceLabel = this.add.text(960/2 - 50, 960/2-200, 'Pause', { font: '30px Arial', fill: '#000' });
                if(gameState.starSystem.getLevel(9) == 3){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'star')
                } else if (gameState.starSystem.getLevel(9) == 2){
                    this.star1 = this.add.sprite(960/2 - 150, 400, 'star')
                    this.star2 = this.add.sprite(960/2, 400, 'star')
                    this.star3 = this.add.sprite(960/2 + 150, 400, 'empty_star')
                } else if (gameState.starSystem.getLevel(9) == 1){
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
                    this.switchLevel('level9')
                })
                this.toggle = 0
                this.pauseMusic()
                this.btSwitch.setTexture('play')
                this.player.speed = 0
            } else {
                this.unpause()
            }
        })
    }
    unpause() {
        this.xFollower.forEach((f) => {
            f.resumeFollow()
        })
        this.yFollower.forEach((f) => {
            f.resumeFollow()
        })
        this.menu.destroy();
        this.choiceLabel.destroy();
        this.star1.destroy();
        this.star2.destroy();
        this.star3.destroy();
        this.playButton.destroy()
        this.restartButton.destroy()
        this.homeButton.destroy()
        this.toggle = 1
        this.resumeMusic()
        this.btSwitch.setTexture('pause')
        this.player.speed = 80
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