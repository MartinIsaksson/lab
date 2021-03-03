export interface Tween {
  targets: Phaser.Physics.Matter.Sprite;
  x: { value: number; duration: number };
  y: { value: number; duration: number };
}
