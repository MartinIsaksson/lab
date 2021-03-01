import PhaserLogo from '../objects/phaserLogo';
import FpsText from '../objects/fpsText';
import carPhysicShapes from '../../assets/car-physic-shapes.json';
import tileMap from '../../assets/map.json';
export type MyMatterBodyConfig = Phaser.Types.Physics.Matter.MatterBodyConfig & {
  shape?: any;
};

export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  car: Phaser.Physics.Matter.Sprite;
  private lastSetFrame: string;
  followCircle: Phaser.Physics.Matter.Sprite;
  constructor() {
    super({ key: 'MainScene' });
  }
  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  preload() {
    this.load.setPath('../../assets');
    this.load.tilemapTiledJSON('roadsMap', 'map.json');
    
    // Import image sheets for the tilemap
    this.load.image('roads-sheet', 'city-roads-sheet.png'); //Its the roads sheet
    this.load.image('paths', 'nature-path-sheet.png'); //Paths and base sheet
    this.load.image('trees', 'trees-sheet.png');
    this.load.image('mountain', 'mountain-sheet.png');

    //Import car images and json sheet
    this.load.atlas('car', 'sedan-sheet.png', 'sedan-sheet.json');
  }
  create() {
    
    const map = this.add.tilemap('roadsMap');
    const naturePaths = map.addTilesetImage('nature-path-sheet', 'paths');
    const roadsTileset = map.addTilesetImage('roads', 'roads-sheet');
    const treesTileset = map.addTilesetImage('trees', 'trees');
    const mountaintileSet = map.addTilesetImage('mountain', 'mountain');
    const bottom = (map as any).createStaticLayer('bottom', naturePaths);
    bottom.setCollisionByProperty({ collides: true });
    const roads = map.createLayer('middle', [roadsTileset, naturePaths]);
    const trees = map.createLayer('trees', treesTileset);
    const mountain = map.createLayer('mountain_bottom', mountaintileSet);
    roads.setCollisionByProperty({ collides: true }); // just when we add the car.

    //Playing
    const circle = this.add.circle(400, 400, 30, 0x00ff00);
    this.followCircle = this.matter.add.gameObject(circle) as Phaser.Physics.Matter.Sprite; // Trick it

    this.car = this.matter.add.sprite(0, 0, 'car', 'sedan_W.png');
    this.car.setBody(carPhysicShapes.sedan_W); //Sets the physics shape at start
    this.car.setDisplaySize(256, 256);
    this.car.setFixedRotation();
    this.car.setInteractive({ shape: carPhysicShapes.sedan_W });
    // this.car.setIgnoreGravity(true);

    this.lastSetFrame = 'W';
    this.fpsText = new FpsText(this);

    this.cameras.main.setSize(1920, 1080);
    // this.cameras.main.zoom = 0.5;
    this.cameras.main.x -= 300;
    this.cameras.main.y -= 200;
    this.cameras.main.startFollow(this.car, true);

    this.matter.world.convertTilemapLayer(bottom);
    this.matter.world.convertTilemapLayer(roads);
    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
  }

  update() {
    this.fpsText.update();
    let carFrame = '';

    if (this.cursors.up.isDown) {
      carFrame += 'N';
    } else if (this.cursors.down.isDown) {
      carFrame += 'S';
    }
    if (this.cursors.left.isDown) {
      carFrame += 'W';
    } else if (this.cursors.right.isDown) {
      carFrame += 'E';
    }
    this.lastSetFrame = carFrame || this.lastSetFrame;
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
    
    //#endregion car physics
    // this.car.setDisplaySize(256, 256);
    //TODO: Acceleration, deceleration
    const velY = carFrame.includes('N') ? -2 : carFrame.includes('S') ? 2 : 0;
    const velX = carFrame.includes('E') ? 2 : carFrame.includes('W') ? -2 : 0;
    this.car.setVelocity(velX, velY);
    // this.car.setFixedRotation();
    this.car.setFrame(`sedan_${this.lastSetFrame}.png`);
    const { velX: xDirSpeed, velY: yDirSpeed } = velocityToTarget(
      this.followCircle.body.position,
      this.car.body.position,
      1
    );
    // this.followCircle.setVelocity(xDirSpeed, yDirSpeed);
  }
}

const velocityToTarget = (
  from: Phaser.Math.Vector2 | MatterJS.Vector,
  to: Phaser.Math.Vector2 | MatterJS.Vector,
  speed = 1,
  followLength = 160
): VelocityToTarget => {
  const distanceX = Phaser.Math.Difference(from.x, to.x) > followLength;
  const distanceY = Phaser.Math.Difference(from.y, to.y) > followLength;
  const direction = Math.atan((to.x - from.x) / (to.y - from.y));
  const speed2 = to.y >= from.y ? speed : -speed;

  return {
    velX: distanceX ? speed2 * Math.sin(direction) : 0,
    velY: distanceY ? speed2 * Math.cos(direction) : 0
  };
};
interface VelocityToTarget {
  velX: number;
  velY: number;
}
