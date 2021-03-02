import { GameEvents } from './../infrastructure/EventCenter';
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
  private readonly tileOffset = { x: 256, y: 310 };
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
    // this.load.atlas("car", "sport-car.png", "sport-car.json");
  }
  create() {
    // this.add.tilemap('roadsMap');
    this.map = this.make.tilemap({ key: 'roadsMap' });

    // this.scale.setGameSize(this.map.widthInPixels, this.map.heightInPixels);
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
    const { width, height, autoCenter } = this.scale;
    console.log('scale', this.scale);

    const naturePaths = this.map.addTilesetImage('nature-path-sheet', 'paths');
    const roadsTileset = this.map.addTilesetImage('roads', 'roads-sheet');
    const treesTileset = this.map.addTilesetImage('trees', 'trees');
    const mountaintileSet = this.map.addTilesetImage('mountain', 'mountain');
    const bottom = this.map.createLayer('bottom', naturePaths);
    const roads = this.map.createLayer('middle', [roadsTileset, naturePaths]);
    const trees = this.map.createLayer('trees', treesTileset);
    const mountain = this.map.createLayer('mountain_bottom', mountaintileSet);

    bottom.setCollisionByProperty({ collides: true }); // just when we add the car.
    this.matter.world.convertTilemapLayer(bottom);
    const graphics = this.add.graphics();

    bottom.forEachTile((tile) => {
      const tileWorldPos = bottom.tileToWorldXY(tile.x, tile.y); //this is the tile as 1,0
      const collisionGroup: any = naturePaths.getTileCollisionGroup(tile.index);
      if (!collisionGroup || collisionGroup.objects.length === 0) {
        return;
      }
      const objects = collisionGroup.objects;
      (tile.physics as any).matterBody.body.isSensor = true;
      (tile.physics as any).matterBody.body.label = 'dangerousTile';
      for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var objectX = tileWorldPos.x + object.x;
        var objectY = tileWorldPos.y + object.y;

        // When objects are parsed by Phaser, they will be guaranteed to have one of the
        // following properties if they are a rectangle/ellipse/polygon/polyline.
        if (object.rectangle) {
          graphics.strokeRect(objectX, objectY, object.width, object.height);
        } else if (object.ellipse) {
          // Ellipses in Tiled have a top-left origin, while ellipses in Phaser have a center
          // origin
          graphics.strokeEllipse(objectX + object.width / 2, objectY + object.height / 2, object.width, object.height);
        } else if (object.polygon || object.polyline) {
          var originalPoints = object.polygon ? object.polygon : object.polyline;
          var points: any[] = [];
          for (var j = 0; j < originalPoints.length; j++) {
            var point: any = originalPoints[j];
            points.push({
              x: objectX + point.x,
              y: objectY + point.y
            });
          }
          (tile.physics as any).matterBody.body = this.matter.add.fromVertices(
            tileWorldPos.x + this.tileOffset.x,
            tileWorldPos.y + this.tileOffset.y,
            points,
            {
              isStatic: true,
              isSensor: true,
              label: 'offroad'
            }
          );
          // const collisionBody = (tile.physics as any).matterBody.body as MatterJS.BodyType;
          // collisionBody.position = new Phaser.Math.Vector2(tileWorldPos.x + 250, tileWorldPos.y + 310);
          // this.matter.world.add(collisionBody);
          // this.collisionTiles.push((tile.physics as any).matterBody as Phaser.Physics.Matter.TileBody);
        }
      }
    });

    const objectsLayer = this.map.getObjectLayer('objects');
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, name, width = 0, height = 0 } = objData;
      const thatMap = this.map;

      switch (name) {
        case 'car_spawn': {
          console.log(this.twoDToIso(new Phaser.Math.Vector2(192, 166)));
          const { x: xT, y: yT } = this.twoDToIso(new Phaser.Math.Vector2(x, y));
          this.car = new Car(this, xT + this.tileOffset.x, yT + this.tileOffset.y);
          this.cameras.main.startFollow(this.car.sprite, true);
          break;
        }
        case 'target': {
          const { x: xT, y: yT } = this.twoDToIso(new Phaser.Math.Vector2(x, y));
          this.target = this.matter.add.gameObject(
            this.add.rectangle(xT + this.tileOffset.x, yT + this.tileOffset.y, width, height, 0x0000ff),
            {
              isStatic: true,
              isSensor: true
            }
          ) as Phaser.Physics.Matter.Sprite;
        }
      }
    });

    //Playing
    const circle = this.add.circle(400, 400, 30, 0x00ff00);
    this.followCircle = this.matter.add.gameObject(circle) as Phaser.Physics.Matter.Sprite; // Trick it
    this.fpsText = new FpsText(this);

    // this.cameras.main.setSize(1920, 1080);
    // this.cameras.main.zoom = 0.5;
    this.cameras.main.x -= 300;
    this.cameras.main.y -= 200;

    this.input.on('gameobjectdown', (pointer: any, gameObject: any) => {
      console.log('clicked!', pointer, gameObject);
    });
    this.input.on('pointerdown', (pointer: MatterJS.BodyType) => {
      console.log('pointer down', pointer);
      console.log('x, y', pointer.position);
      console.log('world x,y', (pointer as any).worldX, (pointer as any).worldY);
    });
    // this.matter.world.on('collisionstart', (event, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
    //   if (
    //     bodyA.label === 'offroad' &&
    //     bodyB.gameObject! instanceof Phaser.Physics.Matter.Sprite &&
    //     (this.car.sprite.body as MatterJS.BodyType).id === bodyB.id
    //   ) {
    //     // console.log('is going offroad!');
    //     // this.car.stop()
    //   }
    // });
  }

  update() {
    this.fpsText.update();
    const { velX: xDirSpeed, velY: yDirSpeed } = velocityToTarget(
      this.car.sprite.body.position,
      this.target.body.position,
      2,
      1
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
