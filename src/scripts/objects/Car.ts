import Phaser from 'phaser';
import carPhysicShapes from '../../assets/car-physic-shapes.json';
import { sharedInstance as events, GameEvents } from '../infrastructure/EventCenter';
export type MyMatterBodyConfig = Phaser.Types.Physics.Matter.MatterBodyConfig & {
  shape?: any;
};

export class Car {
  public sprite: Phaser.Physics.Matter.Sprite;
  private lastSetFrame: string;
  constructor(public scene: Phaser.Scene, private initialX: number, private initialY: number) {
    this.init(initialX, initialY);
  }
  private init(x: number, y: number) {
    this.sprite = this.scene.matter.add.sprite(x, y, 'car', 'sedan_W.png');
    this.sprite.setBody({
      type: 'fromVerts',
      y: -10,
      verts:
        'M 26 111 L 28 85 L 46 69 L 50 68 L 64 66 L 78 59 L 111 59 L 135 69 L 148 111 L 121 111 L 121 97 L 108 97 L 107 111 L 62 111 L 62 97 L 51 97 L 49 111'
    });
    // this.sprite.setScale(0.5);
    this.sprite.setFixedRotation();
    this.sprite.setOnCollide(this.collissionHandler);
    this.lastSetFrame = 'W';
  }
  public setupCollision(target: Phaser.Physics.Matter.Sprite) {
    this.sprite.setOnCollideWith(target.body, (data: MatterJS.ICollisionPair) => {
      console.log('collision with target', data);
    });
  }
  collissionHandler(data: MatterJS.ICollisionPair) {
    console.log('collistion', data);
    // Handle when colliding with the road (stop?) 
  }
  stop() {
    //Do something else
    this.sprite.setPosition(this.initialX, this.initialY);
    this.sprite.setStatic(true);
    events.emit(GameEvents.CarOutsideOfBounds);
  }
  update(xVel: number, yVel: number) {
    // let carFrame = '';

    // if (this.cursors.up.isDown) {
    //   carFrame += 'N';
    // } else if (this.cursors.down.isDown) {
    //   carFrame += 'S';
    // }
    // if (this.cursors.left.isDown) {
    //   carFrame += 'W';
    // } else if (this.cursors.right.isDown) {
    //   carFrame += 'E';
    // }
    // this.lastSetFrame = carFrame || this.lastSetFrame;
    //#region car physics
    // making the car  physics based after its shape
    // const car = Object.assign({}, this.car);
    // const physShape = carPhysicShapes[`sedan_${this.lastSetFrame}`];
    // const physBody = this.matter.add.fromPhysicsEditor(this.car.x, this.car.y, physShape);
    // physBody.gameObject = car.body.gameObject;
    // physBody.ignoreGravity = true;
    // this.car.setExistingBody(physBody);
    // this.car.setDisplaySize(256, 256);
    // this.car.setScale(0.5);
    // this.car.setBody(carPhysicShapes[`sedan_${this.lastSetFrame}`], {scale: { // its working this way except for the scaling
    //   x: 256,
    //   y: 256
    // }});
    // const velY = carFrame.includes('N') ? -2 : carFrame.includes('S') ? 2 : 0;
    // const velX = carFrame.includes('E') ? 2 : carFrame.includes('W') ? -2 : 0;
    // this.car.setVelocity(velX, velY);
    // this.car.setFixedRotation();
    // this.car.setFrame(`sedan_${this.lastSetFrame}.png`);
    this.sprite.setVelocity(xVel, yVel);
  }
}
