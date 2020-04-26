import Phaser from "phaser";

export class CoinGroup {

    constructor(scene, locationArr, group, player) {
        this.scene = scene
        this.locationArr = locationArr
        this.numberOfCoins = this.locationArr.length;
        this.numberOfCoinsCollected = 0
        this.group = group
        this.player = player
    }

    createCoins() {
        this.numberOfCoinsCollected = 0
        this.group.clear(true, true)
        for (let i = 0; i < this.locationArr.length; i ++) {
            let point = this.locationArr[i]
            let c = this.scene.add.sprite(point.x, point.y)
            this.group.add(c)
            this.scene.physics.world.enable(c)
            c.body.setCircle(6)
            this.scene.physics.add.overlap(c, this.player, () => {
                // this.sound.play('hit')
                this.numberOfCoinsCollected ++
                c.destroy()
            })   
        }
        return this.group
    }

}