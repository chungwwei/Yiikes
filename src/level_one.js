import Phaser from "phaser";
import tilesImg from "./assets/yiikes_tiles.png"
import pauseImg from "./assets/pause_black_48x48.png"
import playImg from "./assets/play_arrow_black_48x48.png"
import homeImg from "./assets/home_black_48x48.png"
import level_1_JSON from "./assets/level1.json";
import { Player } from "./player";
import { gameState } from ".";


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
            immovable: true
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
            r.body.immovable = true
            this.speed = -150
            r.body.setVelocityY(this.speed)
            
            // this.physics.add.collider(r, this.foregroundLayer)
            this.physics.add.collider(r, this.foregroundLayer, (r) => {
                this.speed *= -1
                r.body.setVelocityY(this.speed)
            })

            this.physics.add.collider(r, this.player, () => {
                this.player.body.x = this.startpoint.x
                this.player.body.y = this.startpoint.y
            })   

            // 1 for play, 0 for pause
            this.switch = 1

            // scene controls
            this.btHome  = this.add.image(100, 100, 'home')
            this.btSwitch = this.add.image(860, 100)
            this.btSwitch.setTexture('pause')
            
            this.btHome.setInteractive()
            this.btSwitch.setInteractive()

            this.btHome.on('pointerdown', () => {
                this.scene.start('main_screen')
            })

            // this.btSwitch.on('pointerdown', () => {
            //     if (this.switch === 1) {
            //         this.switch = 0
            //         this.btSwitch.setTexture("__MISSING") 
            //         this.btSwitch.setTexture("pause", 1) 
            //         console.log(this.btSwitch.texture)
            //         // this.scene.pause()
            //     } else {
            //         this.switch = 1
            //         this.btSwitch.setTexture("__MISSING") 
            //         this.btSwitch.setTexture('play', 1) 
            //         console.log(this.btSwitch.texture)
            //         // this.scene.run()
            //     }
            // })

            var keys = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE']
            for(let i = 0; i < keys.length; i++){
                this[keys[i]] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[i]]);
            }
        }
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

        if (this.switch === 1) {
            this.btSwitch.setTexture('pause') 
        } else {
            this.btSwitch.setTexture("play") 
        }
        
        if (Phaser.Geom.Rectangle.Contains(this.endpoint, this.player.x, this.player.y)) {
            console.log("reach end")
            gameState.levelCompletion[1] = true
            this.scene.start('level2')
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

    }
}