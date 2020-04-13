import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import gearImg from "./assets/gear.png"
import blueCircle from "./assets/blue_circle.png"
import level_3_JSON from "./assets/level3.json";
import { Player } from "./player";


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
        this.load.tilemapTiledJSON('map', level_3_JSON)
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
            this.player.body.x = 176
            this.player.body.y = 272
        })

        this.player.setInteractive()
        this.cursors = this.input.keyboard.createCursorKeys()

        // follow player
        // this.cameras.main.setBounds(0, 0, 500, 450)
        // this.cameras.main.startFollow(this.player)
        // this.cameras.main.zoomTo(1.3)

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.cursors.space.addListener('down', () => {
            let bullet = this.player.getBullet()
            if (bullet === null)
                this.player.fireBullet()
            else
                this.player.blink()
        })

        this.pointsGroup = this.physics.add.group({
            allowGravity: false,
        })

        var circlePath_1 = new Phaser.Curves.Path(400, 500).circleTo(50)
        var circlePath_2 = new Phaser.Curves.Path(450, 400).circleTo(120)
        var circlePath_3 = new Phaser.Curves.Path(550, 350).circleTo(130)
        var circlePath_4 = new Phaser.Curves.Path(500, 300).circleTo(100)

        var ball1 = this.add.follower(circlePath_1, 700, 500, 'blue_circle');
        var ball2 = this.add.follower(circlePath_2, 450, 600, 'blue_circle')
        var ball3 = this.add.follower(circlePath_1, 500, 350, 'blue_circle');
        var ball4 = this.add.follower(circlePath_1, 400, 300, 'blue_circle');


        this.physics.world.enable(ball1)
        ball1.body.setCircle(32)
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
            this.player.body.x = this.startpoint.x
            this.player.body.y = this.startpoint.y
        })

        
        const debugGraphics = this.add.graphics().setAlpha(0.75);

        this.player.body.debugShowBody = true
        this.foregroundLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        })
    }


    update() {
        // this.physics.collide(this.player, this.spikesGroup, () => {this.player.x = 0; this.player.y = 0})
        // this.physics.collide(this.player, this.foregroundLayer)
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

    }
}