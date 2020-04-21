import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import pauseImg from "./assets/pause_black_48x48.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import homeImg from "./assets/home_black_48x48.png"
import level_1_JSON from "./assets/level1.json";
import { Player } from "./player";
import { gameState } from ".";
import blueCircle from "./assets/blue_circle.png"
import squareImg from "./assets/square.png"
import dyingSheet from "./assets/dying.png"
import idleSheet from "./assets/idle.png"
import walkingSheet from "./assets/walking.png"
import characterImg from './assets/character.png'


export class Level1 extends Phaser.Scene {
    
    constructor() {
        super('level1')
        this.player = null
        this.spacebar = null
        this.bullet = null
    }

    preload() {
        console.log('loading')
        this.load.image('tiles', tilesImg)
        this.load.tilemapTiledJSON('map', level_1_JSON)
        this.load.image('play', playImg)
        this.load.image('pause', pauseImg)
        this.load.image('home', homeImg)
        this.load.image('blue_circle', blueCircle)
        this.load.image('square', squareImg)
        this.load.spritesheet('dying_sheet', dyingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('idle_sheet', idleSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.spritesheet('walk_sheet', walkingSheet, { frameWidth: 25, frameHeight: 25 })
        this.load.image('character', characterImg)
    }

    create() {
        const map = this.make.tilemap({key: 'map'})
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
        this.physics.add.existing(this.endpoint)

        this.player = new Player(this, this.startpoint.x, this.startpoint.y, 
                                    25, 25, this.foregroundLayer)
        this.physics.add.existing(this.player)
        this.player.setTexture('character')

        // create animations
        this.walkAnimation = this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('walk_sheet'),
            frameRate: 1,
            start:0,
            end: 4,
            repeat: -1
        })

        this.dyingAnimation = this.anims.create({
            key: 'dying',
            frames: this.anims.generateFrameNumbers('dying_sheet'),
            start: 0,
            end: 5,
            frameRate: 3,
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
        this.physics.overlap(this.player, this.laserLayer, () => {
            this.player.body.x = this.startpoint.x
            this.player.body.y = this.startpoint.y
        })

        this.physics.add.collider(this.player, this.laserLayer, () => {
            this.player.body.x = 176
            this.player.body.y = 272
        })

        this.player.setInteractive()
        this.cursors = this.input.keyboard.createCursorKeys()

        // audio
        // var hitAudio = this.sound.add('hit')

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.pointsGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })
        
        this.followers = []
        const points = map.getObjectLayer('patrol_points')['objects']
        
        for (let i = 0; i < points.length; i += 2) {
            let point_1 = points[i]
            let point_2 = points[i + 1]
            let x_1 = point_1.x, x_2 = point_2.x
            let y_1 = point_1.y, y_2 = point_2.y
            let path = new Phaser.Curves.Path(x_2, y_2).lineTo(x_1, y_1)
            var patrolFollower = this.add.follower(path, x_1, y_2, 'square');

            if (i === 2) {
                patrolFollower.startFollow({
                    repeat: -1,
                    duration: 1200,
                    yoyo: true
                });

            } else {
                patrolFollower.startFollow({
                    repeat: -1,
                    duration: 1000,
                    yoyo: true
                })
            }

            this.physics.world.enable(patrolFollower)
            this.followers.push(patrolFollower)
            this.physics.add.collider(patrolFollower, this.player, () => {
                this.player.play('dying')
                this.player.body.x = this.startpoint.x
                this.player.body.y = this.startpoint.y
            })   
        }
        
        // 1 for play, 0 for pause
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
                this.followers.forEach((f) => {
                    f.pauseFollow()
                })
                this.toggle = 0
                this.btSwitch.setTexture('play')
            } else {
                this.followers.forEach((f) => {
                    f.resumeFollow()
                })
                this.toggle = 1
                this.btSwitch.setTexture('pause')
            }
        })
    }


    update() {
        // this.physics.collide(this.player, this.spikesGroup, () => {this.player.x = 0; this.player.y = 0})
        // this.physics.collide(this.player, this.foregroundLayer)
        if (this.cursors.left.isDown) {
            this.player.play('walk')
            this.player.update(-1)
        } if (this.cursors.right.isDown) {
            this.player.update(1)
        } if (this.cursors.up.isDown) {
            this.player.update(2)
        } if (this.cursors.down.isDown) {
            this.player.update(3)
        } if (this.cursors.up.isUp && this.cursors.down.isUp &&
            this.cursors.left.isUp && this.cursors.right.isUp) {
            this.player.update(4)
        } else {
            this.player.update()
        }
        
        if (Phaser.Geom.Rectangle.Contains(this.endpoint, this.player.x, this.player.y)) {
            console.log("reach end")
            gameState.levelCompletion[1] = true
            this.scene.start('level2')
        }

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            console.log("IM CALLED")
            let bullet = this.player.getBullet()
            console.log("bullet is null?: " + bullet)
            if (bullet == null)
                this.player.fireBullet()
            else
                this.player.blink()
        }
    }
}