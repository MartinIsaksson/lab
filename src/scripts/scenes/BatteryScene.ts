import Phaser from 'phaser';
import { sharedInstance as events, GameEvents } from '../infrastructure/EventCenter';
import { PowerPlant } from '../infrastructure/interfaces';

export default class BatteryScene extends Phaser.Scene {
  // private sprite: Phaser.GameObjects.Sprite;
  private chargeRect: Phaser.GameObjects.Rectangle;
  private batteryLevel: number;
  private readonly batteryDrainConst = 1.5;
  private readonly batteryChargeConst = 20;
  graphics: Phaser.GameObjects.Graphics;
  image: Phaser.GameObjects.Image;
  constructor() {
    super({ key: 'BatteryScene' });
  }

  init() {
    this.batteryLevel = 100; // 78 kwh
  }

  preload() {
    this.load.setPath('../../assets');
    this.load.image('battery', 'battery.png');
    this.load.image('battery-lightning', 'battery-lightning.png');
  }

  create() {
    this.graphics = this.add.graphics();
    this.image = this.add.image(75, 75, 'battery');
    this.image.setScale(0.5);
    this.image.flipX = true;
    this.setBatteryBar(this.batteryLevel);

    events.on(GameEvents.BatteryDrain, this.drainBattery, this);
    events.on(GameEvents.BatteryCharge, this.chargeBattery, this);
    this.events.on(Phaser.Scenes.Events.DESTROY, () => {
      events.off(GameEvents.BatteryDrain);
      events.off(GameEvents.BatteryCharge);
    });
  }

  update() {
    // Render the bar depending on the eventEmitters data
  }
  private setBatteryBar(batteryLevel: number) {
    const percent = Phaser.Math.Clamp(batteryLevel, 0, 100) / 100;
    console.log('percent', percent);
    this.graphics.clear();
    if (percent > 0) {
      //TODO color the battery different
      this.graphics.fillStyle(0x00ff00);
      this.graphics.fillRect(
        this.image.x * this.image.scale - 10,
        this.image.y * this.image.scale + 15,
        (this.image.width * this.image.scale - 15) * percent,
        this.image.height * this.image.scale
      );
    }
  }
  private chargeBattery(type: PowerPlant) {
    const currentBatteryLevel = this.batteryLevel + this.batteryChargeConst;
    this.changeBatteryLevel(currentBatteryLevel);
  }
  private drainBattery() {
    const currentBatteryLevel = this.batteryLevel - this.batteryDrainConst;
    this.changeBatteryLevel(currentBatteryLevel);
    //TODO gameover
    if (this.batteryLevel <= 0) {
      events.emit(GameEvents.BatteryEmpty);
    }
  }

  private changeBatteryLevel(currentBatteryLevel: number) {
    this.tweens.addCounter({
      from: this.batteryLevel,
      to: currentBatteryLevel,
      duration: 40,
      onUpdate: (tween) => {
        const batteryLevel = tween.getValue();
        this.setBatteryBar(batteryLevel);
      }
    });
    this.batteryLevel = currentBatteryLevel;
  }
}
