import 'phaser';
import ArcadeScene from './scenes/arcadeScene';
import BatteryScene from './scenes/BatteryScene';
import MainScene from './scenes/mainScene';
import PreloadScene from './scenes/preloadScene';
import HighscoreScene from './scenes/highscoreScene';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  backgroundColor: '#2fe7c5',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, MainScene, ArcadeScene, BatteryScene, HighscoreScene],
  // physics: {
  //   default: 'arcade',
  //   arcade: {
  //     debug: true
  //   }
  // }
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      gravity: {
        x: 0,
        y: 0
      }
    }
  }
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});
