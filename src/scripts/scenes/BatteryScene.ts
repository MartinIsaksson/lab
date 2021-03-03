import Phaser from 'phaser';

export default class BatteryScene extends Phaser.Scene {
  private sprite: Phaser.GameObjects.Sprite;
  private chargeRect: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'BatteryScene' });
  }

  init() {}

  preload() {
    this.load.setPath('../../assets');
    this.load.image('battery', 'battery.png');
    this.load.image('battery-lightning', 'battery-lightning.png');
  }

  create() {
    // Add a new sprite in the upper right corner
    this.sprite = this.add.sprite(0, 0, 'battery');
    this.sprite.setX(this.sprite.width * 0.5);
    this.sprite.setY(this.sprite.height * 0.5);
    this.sprite.setScale(0.8, 0.8);

    this.chargeRect = new Phaser.GameObjects.Rectangle(this, 100, 100, 250, 50, 1, 0);

    this.chargeRect = this.add.rectangle(
      this.sprite.x,
      this.sprite.y,
      this.sprite.width * 0.5,
      this.sprite.height * 0.5,
      0xff0000,
      1
    );
    this.matter.add.gameObject(this.chargeRect);
  }

  update() {
    // Render the bar depending on the eventEmitters data
  }
}
