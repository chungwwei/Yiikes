import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import { Level1 } from "./level_one";
import { Level2 } from "./level_two";


const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 960,
  height: 960,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0},
        debug: true
    }
  },
  // scene: [MenuScene, ControlScene, Level1]
  scene: [Level2],
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("logo", logoImg);
}

function create() {
  const logo = this.add.image(400, 150, "logo");

  this.tweens.add({
    targets: logo,
    y: 450,
    duration: 2000,
    ease: "Power2",
    yoyo: true,
    loop: -1
  });
}
