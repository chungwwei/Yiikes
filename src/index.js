import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import { Level1 } from "./level_one";
import { Level2 } from "./level_two";
import { Level3 } from "./level_three";
import { Level4 } from "./level_four";
import { Level5 } from "./level_five";
import { LevelSelectScene } from "./level_select";
import { MainScene } from "./main_screen";


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
  scene: [MainScene, LevelSelectScene, Level1, Level2, Level3, Level4, Level5],
};

export const game = new Phaser.Game(config);
export var gameState = {
  levelCompletion: [true, false, false, 
                      false, false, false,
                      false, false, false]
}

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
