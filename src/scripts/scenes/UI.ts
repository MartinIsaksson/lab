import { sharedInstance } from '../infrastructure/EventCenter';

export const BATTERY_LEVEL_CHANGED_EVENT = 'battery-level-changed';

export default class UI extends Phaser.Scene {
  batteryLevelText: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ui' });
  }
  init() {
    sharedInstance.on('battery-level-changed', this.batteryLevelChanged, this);
  }

  preload() {
    this.load.setPath('../../assets');
    this.batteryLevelText = this.add.text(20, 20, 'Hello World', {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      color: 'black',
      backgroundColor: 'white'
    });
  }

  batteryLevelChanged(newLevel) {
    this.batteryLevelText.setText(`${newLevel} %`);
  }

  showHighscore() {}

  create() {}
}
