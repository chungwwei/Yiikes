import Phaser from "phaser";

export class Projectile extends Phaser.GameObjects.Rectangle {

    constructor(scene, x, y, width, height, direction) {
        super(scene, x, y, width, height, '0x2f11ff')
        this.speed = 180;
        this.scene = scene
        this.timer = 125;
        this.direction = direction
        this.scene.physics
        scene.add.existing(this)
        scene.physics.add.existing(this)
    }

    update() {
        this.timer -= 0.5
        
        if (this.direction === 1 || this.direction === -1) {
            this.body.setVelocityX(this.direction * this.speed)
        }

        if (this.direction === 2 || this.direction === -2) {
            this.body.setVelocityY(this.direction / 2 * this.speed)
        }


    }



}