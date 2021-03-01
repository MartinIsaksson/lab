import PhaserLogo from '../objects/phaserLogo';
import FpsText from '../objects/fpsText';
import carPhysicShapes from '../../assets/car-physic-shapes.json';
import tileMap from '../../assets/map.json';
import { Car } from '../objects/Car';
export type MyMatterBodyConfig = Phaser.Types.Physics.Matter.MatterBodyConfig & {
  shape?: any;
};

export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  car: Car;
  followCircle: Phaser.Physics.Matter.Sprite;
  target: Phaser.Physics.Matter.Sprite;
  map: Phaser.Tilemaps.Tilemap;
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
    // this.add.tilemap('roadsMap');
    this.map = this.make.tilemap({ key: 'roadsMap' });
    this.scale.setGameSize(this.map.widthInPixels, this.map.heightInPixels);
    const zeroPoint = new Phaser.Math.Vector2(0, 0);
    // const test = twoDToIso(zeroPoint);
    // this.matter.world.setBounds(-1800, 280, this.map.widthInPixels, this.map.heightInPixels); //aint gonna work
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
    const { width, height, autoCenter } = this.scale;
    console.log('scale', this.scale);
    const naturePaths = this.map.addTilesetImage('nature-path-sheet', 'paths');
    const roadsTileset = this.map.addTilesetImage('roads', 'roads-sheet');
    const treesTileset = this.map.addTilesetImage('trees', 'trees');
    const mountaintileSet = this.map.addTilesetImage('mountain', 'mountain');
    const bottom = this.map.createLayer('bottom', naturePaths);

    bottom.setCollisionByProperty({ collides: true });
    const roads = this.map.createLayer('middle', [roadsTileset, naturePaths]);
    const trees = this.map.createLayer('trees', treesTileset);
    const mountain = this.map.createLayer('mountain_bottom', mountaintileSet);
    roads.setCollisionByProperty({ collides: true }); // just when we add the car.
    this.matter.world.convertTilemapLayer(bottom);
    this.matter.world.convertTilemapLayer(roads);

    // this.map.setCollisionBetween(0, 1300);

    const objectsLayer = this.map.getObjectLayer('objects');
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, name, width = 0, height = 0 } = objData;
      const thatMap = this.map;

      switch (name) {
        case 'car_spawn': {
          const { x: xT, y: yT } = thatMap.tileToWorldXY(12, 31);
          this.car = new Car(this, xT + 250, yT + 310);
          this.cameras.main.startFollow(this.car.sprite, true);
          break;
        }
        case 'target': {
          const { x: xT, y: yT } = thatMap.tileToWorldXY(12, 0);
          this.target = this.matter.add.gameObject(this.add.rectangle(xT + 250, yT + 310, width, height, 0x0000ff), {
            isStatic: true,
            isSensor: true
          }) as Phaser.Physics.Matter.Sprite;
        }
      }
    });

    //Playing
    const circle = this.add.circle(400, 400, 30, 0x00ff00);
    this.followCircle = this.matter.add.gameObject(circle) as Phaser.Physics.Matter.Sprite; // Trick it

    // this.car.setIgnoreGravity(true);

    this.fpsText = new FpsText(this);

    // this.cameras.main.setSize(1920, 1080);
    this.cameras.main.zoom = 0.5;
    this.cameras.main.x -= 300;
    this.cameras.main.y -= 200;
    // this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.input.on('gameobjectdown', (pointer: any, gameObject: any) => {
      console.log('clicked!', pointer, gameObject);
    });
    this.input.on('pointerdown', (pointer: MatterJS.BodyType) => {
      console.log('pointer down', pointer);
      console.log('x, y', pointer.position);
      console.log('world x,y', (pointer as any).worldX, (pointer as any).worldY);
    });
  }

  update() {
    this.fpsText.update();
    const { velX: xDirSpeed, velY: yDirSpeed } = velocityToTarget(
      this.car.sprite.body.position,
      this.target.body.position,
      2
    );
    this.car.update(xDirSpeed, yDirSpeed);
  }
  twoDToIso(pt: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    var tempPt: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
    tempPt.x = pt.x - pt.y;
    tempPt.y = (pt.x + pt.y) / 2;
    return tempPt;
  }
}

const velocityToTarget = (
  from: Phaser.Math.Vector2 | MatterJS.Vector,
  to: Phaser.Math.Vector2 | MatterJS.Vector,
  speed = 1,
  followLength = 160
): VelocityToTarget => {
  const distanceX = true; // Phaser.Math.Difference(from.x, to.x) > followLength;
  const distanceY = true; //Phaser.Math.Difference(from.y, to.y) > followLength;
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

const isoTo2D = (pt: Phaser.Math.Vector2): Phaser.Math.Vector2 => {
  var tempPt: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  tempPt.x = (2 * pt.y + pt.x) / 2;
  tempPt.y = (2 * pt.y - pt.x) / 2;
  return tempPt;
};
