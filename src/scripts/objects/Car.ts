import carPhysicShapes from '../../assets/car-physic-shapes.json';
export class Car {
  public sprite: Phaser.Physics.Matter.Sprite;
  private lastSetFrame: string;
  constructor(public scene: Phaser.Scene, x: number, y: number) {
    this.init(x, y);
  }
  private init(x: number, y: number) {
    this.sprite = this.scene.matter.add.sprite(x, y, 'car', 'sedan_W.png');
    this.sprite.setInteractive();
    this.sprite.setBody(carPhysicShapes.sedan_W);
    this.sprite.setDisplaySize(128, 128);
    this.sprite.setFixedRotation();
    this.lastSetFrame = 'W';
    this.setupCollision();
    // this.setInteractive({ shape: carPhysicShapes.sedan_W });
  }
  private setupCollision() {
    // this.sprite.on("")
    // this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
    //   console.log('collision', data);
    // });
  }
  reset() {
    this.scene.scene.restart();
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
