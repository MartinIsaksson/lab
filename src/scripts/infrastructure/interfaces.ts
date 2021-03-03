export interface Tween {
  targets: Phaser.Physics.Matter.Sprite;
  onComplete?: Phaser.Types.Tweens.TweenOnCompleteCallback;
  x: { value: number; duration: number };
  y: { value: number; duration: number };
  onComplete?: Function;
}

export enum PowerPlant {
  Wind = 10,
  Solar = 11,
  Water = 12,
  Nuclear = 20,
  Coal = 40
}
