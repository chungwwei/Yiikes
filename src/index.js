import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import { Level1 } from "./level_one";
import { Level2 } from "./level_two";
import { Level3 } from "./level_three";
import { Level4 } from "./level_four";
import { Level5 } from "./level_five";
import { Level6 } from "./level_six";
import { Level7 } from "./level_seven";
import { Level8 } from "./level_eight";
import { Level9 } from "./level_nine";
import { LevelSelectScene } from "./level_select";
import { ControlScene } from "./control_screen";
import { HelpScene } from "./help_screen";
import { MainScene } from "./main_screen";
import { LoadScene } from "./load_screen";
import { Level10 } from "./level_ten";
import { Level11 } from "./level_eleven";
import { Level12 } from "./level_twelve";
import { StarSystem } from "./star_system";
//TODO: ADD PAUSE MENU
//TODO: ADD NEXT LEVEL MENU*

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 960,
  height: 960,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0},
        debug: false
    }
  },
  // scene: [MenuScene, ControlScene, Level1]
  scene: [LoadScene, MainScene, LevelSelectScene, ControlScene, HelpScene, Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9, Level10, Level11, Level12],
};

export const game = new Phaser.Game(config);
export var gameState = {
  levelCompletion: [true, false, false, 
                      false, false, false,
                      false, false, false,
                      false, false, false],
  volume: 0.5,
  death: 0,
  starSystem: new StarSystem()
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
