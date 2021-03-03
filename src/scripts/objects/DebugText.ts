export default class DebugText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 10, 30, '', { color: 'black', fontSize: '28px' });
    scene.add.existing(this);
    this.setOrigin(0);
  }

  update(car: Phaser.Physics.Arcade.Sprite) {
    this.x = car.x - 100;
    this.y = car.y - 100;
  }
}
