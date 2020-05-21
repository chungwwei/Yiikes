import Phaser from "phaser";
import { gameState } from ".";

export class StarSystem {
    constructor() {
        this.stars = 3
        this.level = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }

    setStars(level, stars) {
        this.level[level - 1] = stars
    }

    getLevel(level) {
        return this.level[level - 1]
    }
}