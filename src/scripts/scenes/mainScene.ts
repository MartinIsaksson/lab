import EasyStar, { js } from 'easystarjs';
import { Car } from '../objects/Car';
import FpsText from '../objects/fpsText';
export type MyMatterBodyConfig = Phaser.Types.Physics.Matter.MatterBodyConfig & {
  shape?: any;
};

interface Tween {
  targets: Phaser.Physics.Matter.Sprite;
  x: { value: number; duration: number };
  y: { value: number; duration: number };
}

export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  car: Car;
  followCircle: Phaser.Physics.Matter.Sprite;
  target: Phaser.Math.Vector2;
  map: Phaser.Tilemaps.Tilemap;
  finder: js;
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
    this.finder = new EasyStar.js();
    // this.scale.setGameSize(this.map.widthInPixels, this.map.heightInPixels);

    const { width, height, autoCenter } = this.scale;
    console.log('scale', this.scale);

    const roads = this.buildMap();
    this.enableDebug(roads);

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY < 0) {
        this.cameras.main.zoom *= 1.1;
      }
      if (deltaY > 0) {
        this.cameras.main.zoom *= 0.9;
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
          // // this.cameras.main.startFollow(this.car.sprite, true);
          break;
        }
        case 'target':
          const position = this.twoDToIso(new Phaser.Math.Vector2(x, y));
          // this.target = position;
          break;
      }
    });

    //Playing
    const circle = this.add.circle(400, 400, 30, 0x00ff00);
    this.followCircle = this.matter.add.gameObject(circle) as Phaser.Physics.Matter.Sprite; // Trick it
    this.fpsText = new FpsText(this);
    // this.cameras.main.setSize(1920, 1080);
    // this.cameras.main.zoom = 0.5;
    // this.cameras.main.x -= 300;
    // this.cameras.main.y -= 200;

    this.input.on('gameobjectdown', (pointer: any, gameObject: any) => {
      console.log('clicked!', pointer, gameObject);
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log('pointer down', pointer);
      console.log('x, y', pointer.position);
      console.log('world x,y', pointer.worldX, pointer.worldY);
      // this.target = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      this.handleClick(pointer);
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
    this.buildPathfindingMap(roads);
    // this.findAcceptableTiles(roadsTileset);
  }

  private buildMap() {
    const naturePaths = this.map.addTilesetImage('nature-path-sheet', 'paths');
    const roadsTileset = this.map.addTilesetImage('roads', 'roads-sheet');
    const treesTileset = this.map.addTilesetImage('trees', 'trees');
    const mountaintileSet = this.map.addTilesetImage('mountain', 'mountain');
    const bottom = this.map.createLayer('bottom', naturePaths);
    const roads = this.map.createLayer('middle', [naturePaths, roadsTileset]);
    const trees = this.map.createLayer('trees', treesTileset);
    const mountain = this.map.createLayer('mountain_bottom', mountaintileSet);
    bottom.setCollisionByProperty({ collides: true }); // just when we add the car.
    this.matter.world.convertTilemapLayer(bottom);

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
        if (object.polygon || object.polyline) {
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
        }
      }
    });
    return roads;
  }

  private enableDebug(roads: Phaser.Tilemaps.TilemapLayer) {
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
    const graphics = this.add.graphics();
    const tileA = roads.getTileAt(0, 0);
    const tileB = roads.getTileAt(31, 0);
    const tileC = roads.getTileAt(31, 31);
    const tileD = roads.getTileAt(0, 31);

    graphics.lineBetween(tileA.pixelX, tileA.pixelY, tileB.pixelX, tileB.pixelY);
    graphics.lineBetween(tileB.pixelX, tileB.pixelY, tileC.pixelX, tileC.pixelY);
    graphics.lineBetween(tileC.pixelX, tileC.pixelY, tileD.pixelX, tileD.pixelY);
    graphics.lineBetween(tileD.pixelX, tileD.pixelY, tileA.pixelX, tileA.pixelY);
  }

  buildPathfindingMap(tileLayer: Phaser.Tilemaps.TilemapLayer) {
    console.log('Building map');
    let grid: number[][] = [];
    let acceptableTiles: number[] = [];

    for (let r = 0; r < tileLayer.layer.data.length; r++) {
      const row = tileLayer.layer.data[r];
      const currentRow: number[] = [];
      for (let c = 0; c < row.length; c++) {
        const col = row[c];
        currentRow.push(col.index);
        if (col.properties.type === 'road') acceptableTiles.push(col.index);
      }
      grid.push(currentRow);
    }

    this.finder.setGrid(grid);
    this.finder.setAcceptableTiles(acceptableTiles);
  }

  handleClick(pointer: Phaser.Input.Pointer) {
    let x = this.cameras.main.scrollX + pointer.x;
    let y = this.cameras.main.scrollY + pointer.y;
    this.map.setLayer('middle');
    const currentCarTile = this.map.getTileAtWorldXY(
      this.car.sprite.x - this.tileOffset.x + this.map.tileWidth / 2,
      this.car.sprite.y - this.tileOffset.y + this.map.tileHeight / 2
    );
    const graphics = this.add.graphics();
    // graphics.fillCircle(currentCarTile.pixelX + this.tileOffset.x, currentCarTile.pixelY + this.tileOffset.y, 100);
    const clickedTile = this.map.getTileAtWorldXY(
      pointer.worldX - this.tileOffset.x + this.map.tileWidth / 2,
      pointer.worldY - this.tileOffset.y + this.map.tileHeight / 2
    );
    // graphics.fillCircle(clickedTile.pixelX + this.tileOffset.x, clickedTile.pixelY + this.tileOffset.y, 50);
    let toX = clickedTile.x;
    let toY = clickedTile.y;
    // this.car.sprite.x = currentCarTile.pixelX + this.tileOffset.x;
    // this.car.sprite.y = currentCarTile.pixelY + this.tileOffset.y;
    console.log(x, y, toX, toY);
    let fromX = currentCarTile.x;
    let fromY = currentCarTile.y;
    console.log('going from (' + fromX + ',' + fromY + ') to (' + toX + ',' + toY + ')');
    const scene = this;
    this.map.getTileAt(toX, toY, false, 'middle')?.setAlpha(0.5);
    this.map.getTileAt(fromX, fromY, false, 'middle')?.setAlpha(0.5);
    this.finder.findPath(fromX, fromY, toX, toY, (path) => {
      if (path === null) {
        console.warn('Path was not found.');
      } else {
        console.log(path);
        scene.moveCharacter(path);
      }
    });
    this.finder.calculate();
  }

  moveCharacter(path) {
    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    let tweens: Tween[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      let ex = path[i + 1].x;
      let ey = path[i + 1].y;
      const tile = this.map.tileToWorldXY(ex, ey);
      tweens.push({
        targets: this.car.sprite,
        x: { value: tile.x + this.tileOffset.x, duration: 200 },
        y: { value: tile.y + this.tileOffset.y, duration: 200 }
      });
    }

    this.tweens.timeline({
      tweens: tweens
    });
  }

  update() {
    this.fpsText.update();
    // const { velX: xDirSpeed, velY: yDirSpeed } = velocityToTarget(this.car.sprite.body.position, this.target, 2, 1);
    // this.car.update(xDirSpeed, yDirSpeed);
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
