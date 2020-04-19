import Phaser from "phaser";
import { Projectile } from "./projectile";

export class Player extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, width, height, foreground) {
        super(scene, x, y, width, height, '0xff23ff')
        this.speed = 80;
        this.jumpSpeed = 150;
        this.bullet = null
        this.scene = scene
        this.direction = 1
        this.fireCoolDown = 0
        this.foregroundLayer = foreground
        scene.add.existing(this)
    }

    getBullet() {
        return this.bullet
    }

    fireBullet() {
        console.log(this.bullet)
        if (this.fireCoolDown <= 0 && this.bullet === null) {
            console.log("fire bullet")
            this.bullet = new Projectile(this.scene, this.x, this.y, 20, 20, this.direction)
            this.fireCoolDown = 30
            this.scene.physics.add.collider(
                this.bullet, 
                this.foregroundLayer, 
                (bullet, layer) => {
                    console.log("collide with wall: " + this.bullet)
                    this.bullet.destroy()
                    this.bullet = null
                    this.fireCoolDown = -1;
                })
        }


    }

    blink() {
        if (this.bullet !== null && this.fireCoolDown > 0) {
            console.log(this.bullet)
            this.x = this.bullet.body.x + 10
            this.y = this.bullet.body.y + 10
            this.bullet.destroy()
            console.log("blink")
            this.bullet = null
            this.fireCoolDown = -1
        }
    }

    update(direction) {

        if (this.bullet !== null) {
            this.fireCoolDown -= 0.5
        }
        // reset
        if (this.fireCoolDown <= 0 && this.bullet !== null) {
            this.bullet.destroy()
            this.bullet = null;
        }

        if (direction === -1) {
            this.direction = -1
            this.body.setVelocityX(-this.speed) // left
        } else if (direction === 1) {
            this.direction = 1
            this.body.setVelocityX(this.speed) //right
        } if (direction === 2) {
            this.direction = -2
            this.body.setVelocityY(-this.speed) // up
        } else if (direction === 3) {
            this.direction = 2
            this.body.setVelocityY(this.speed) // down
        } 

        if (direction === 4) {
            this.body.setVelocityX(0)
            this.body.setVelocityY(0)
        }


        if (this.bullet !== null)
            this.bullet.update()


    }
}