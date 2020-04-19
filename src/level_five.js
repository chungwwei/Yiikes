import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import blueCircle from './assets/blue_circle.png';
import level_5_JSON from "./assets/level5.json";
import { Player } from "./player";
import { gameState } from ".";
import homeImg from "./assets/home_black_48x48.png";
import squareImg from "./assets/square.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import pauseImg from "./assets/pause_black_48x48.png"


export class Level5 extends Phaser.Scene {
    
    constructor() {
        super('level5')
        this.player = null
        this.spacebar = null
        this.bullet = null
    }

    preload() {
        console.log('loading')
        this.load.image('tiles', tilesImg)
        this.load.image('blue_circle', blueCircle)
        this.load.tilemapTiledJSON('map5', level_5_JSON)
        this.load.image('home', homeImg)
        this.load.image('square', squareImg)
        this.load.image('play', playImg)
        this.load.image('pause', pauseImg)
    }

    create() {
        const map = this.make.tilemap({key: 'map5'})
        const tiles = map.addTilesetImage('yiikes_tiles', 'tiles')
        this.backgroundLayer = map.createStaticLayer('background', tiles)
        this.foregroundLayer = map.createStaticLayer('foreground', tiles)
        this.laserLayer = map.createStaticLayer('lasers', tiles)


        const start_end_points = map.getObjectLayer('start_end_points')['objects']
        const pointA = start_end_points[0]
        const pointB = start_end_points[1]
        
        this.startpoint = this.add.rectangle(pointA.x, pointA.y, pointA.width, pointA.height)
        this.endpoint = this.add.rectangle(pointB.x, pointB.y, pointB.width, pointB.height)

        this.player = new Player(this, this.startpoint.x, this.startpoint.y, 
                                    25, 25, this.foregroundLayer)
        this.physics.add.existing(this.player)


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
            this.player.body.x = pointA.x
            this.player.body.y = pointA.y
        })

        this.player.setInteractive()
        this.cursors = this.input.keyboard.createCursorKeys()

        // follow player
        // this.cameras.main.setBounds(0, 0, 500, 450)
        // this.cameras.main.startFollow(this.player)
        // this.cameras.main.zoomTo(1.3)

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.pointsGroup = this.physics.add.group({
            allowGravity: false,
        })
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
                this.player.body.x = this.startpoint.x
                this.player.body.y = this.startpoint.y
            })   
        }

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
                this.player.body.x = this.startpoint.x
                this.player.body.y = this.startpoint.y
            })   
        }

        

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
                this.xFollower.forEach((f) => {
                    f.pauseFollow()
                })
                this.yFollower.forEach((f) => {
                    f.pauseFollow()
                })
                this.toggle = 0
                this.btSwitch.setTexture('play')
            } else {
                this.xFollower.forEach((f) => {
                    f.resumeFollow()
                })
                this.yFollower.forEach((f) => {
                    f.resumeFollow()
                })
                this.toggle = 1
                this.btSwitch.setTexture('pause')
            }
        })
        var keys = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE']
        for(let i = 0; i < keys.length; i++){
            this[keys[i]] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[i]]);
        }
    }


    update() {
        this.physics.collide(this.player, this.spikesGroup, () => {this.player.x = 0; this.player.y = 0})
        this.physics.collide(this.player, this.foregroundLayer)
        if (this.cursors.left.isDown) {
            this.player.update(-1)
        } else if (this.cursors.right.isDown) {
            this.player.update(1)
        } else if (this.cursors.up.isDown) {
            this.player.update(2)
        } else if (this.cursors.down.isDown) {
            this.player.update(3)
        } else if (this.cursors.up.isUp && this.cursors.down.isUp &&
            this.cursors.left.isUp && this.cursors.right.isUp) {
            this.player.update(4)
        } else {
            this.player.update()
        }

        if (Phaser.Geom.Rectangle.Contains(this.endpoint, this.player.x, this.player.y)) {
            console.log("reach end")
            gameState.levelCompletion[5] = true
            this.scene.start('level6')
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
            if (bullet == null)
                this.player.fireBullet()
            else
                this.player.blink()
        }
        
    }
}