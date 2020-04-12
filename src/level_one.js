import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import level_1_JSON from "./assets/level1.json";
import { Player } from "./player";


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
        
        const points = map.getObjectLayer('patrol_points')['objects']

        for (let i = 0; i <points.length; i ++) {
            let point = points[i]
            const p = this.pointsGroup.create(
                point.x,
                point.y,
            )
            p.setAlpha(0) // make it invisible

            var r = this.add.rectangle(p.x - 8, p.y - 8, 16, 16, '0x1fffff')
            this.physics.add.existing(r)
            this.speed = -150
            r.body.setVelocityY(this.speed)
            
            // this.physics.add.collider(r, this.foregroundLayer)
            this.physics.add.collider(r, this.foregroundLayer, (r) => {
                this.speed *= -1
                r.body.setVelocityY(this.speed)
            })

            this.physics.add.overlap(r, this.player, () => {
                this.player.body.x = this.startpoint.x
                this.player.body.y = this.startpoint.y
            })   
        }

        this.rectangle = this.add.rectangle(400, 300, 10, 200, "0x1fffff")  
        this.physics.add.existing(this.rectangle)
        
        // this.physics.add.overlap(this.rectangle, this.player, () => {
        //     this.player.body.x = this.startpoint.x
        //     this.player.body.y = this.startpoint.y
        // })

        this.rectangle.body.debugShowBody = true;
        this.rectangle.body.angle = 1
        
        const debugGraphics = this.add.graphics().setAlpha(0.75);

        this.player.body.debugShowBody = true
        this.foregroundLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });

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


        // fanImage rotation
        this.rectangle.angle += 1
        this.rectangle.body.angle += 30
        // this.polygon.angle += 1
    }
}