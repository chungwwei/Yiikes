import Phaser from "phaser";
import { gameState } from ".";

export class CoinGroup {

    constructor(scene, locationArr, group, player, pickupAudio) {
        this.scene = scene
        this.locationArr = locationArr
        this.numberOfCoins = this.locationArr.length;
        this.numberOfCoinsCollected = 0
        this.group = group
        this.player = player
        this.pickupAudio = pickupAudio
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
                this.pickupAudio.play()
                this.pickupAudio.volume = gameState.volume
                this.numberOfCoinsCollected ++
                c.destroy()
            })   
        }
        return this.group
    }

}