import Phaser from 'phaser';
import { tileOffset } from '../infrastructure/constants';
import { GameEvents, sharedInstance as events } from '../infrastructure/EventCenter';
import { Tween } from '../infrastructure/interfaces';
import { Vector2 } from './../infrastructure/types';
import { Pathfinder } from './pathfinder';
export type MyMatterBodyConfig = Phaser.Types.Physics.Matter.MatterBodyConfig & {
  shape?: any;
};

export class Car {
  public sprite: Phaser.Physics.Matter.Sprite;
  private lastSetFrame: string;
  private gfx: Phaser.GameObjects.Graphics;
  pathFinder: Pathfinder;
  constructor(
    public scene: Phaser.Scene,
    private initialX: number,
    private initialY: number,
    private roadsTilemap: Phaser.Tilemaps.TilemapLayer,
    private map: Phaser.Tilemaps.Tilemap
  ) {
    this.init(initialX, initialY);
    this.pathFinder = new Pathfinder();
    this.pathFinder.buildPathfindingMap(roadsTilemap);
    this.gfx = this.scene.add.graphics();
  }
  private init(x: number, y: number) {
    this.sprite = this.scene.matter.add.sprite(x, y, 'car', 'sedan_W.png', {
      render: { sprite: { yOffset: 0.07, xOffset: 0.00 } }
    });
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
    events.on(GameEvents.BatteryEmpty, this.stop, this);
  }
  public setupCollision(target: Phaser.Physics.Matter.Sprite) {
    this.sprite.setOnCollideWith(target.body, (data: MatterJS.ICollisionPair) => {
      console.log('collision with target', data);
    });
  }
  collissionHandler(data: MatterJS.ICollisionPair) {
    //    console.log('collistion', data);
    // Handle when colliding with the road (stop?)
  }
  stop() {
    //Do something else
    this.sprite.setStatic(true);
    this.scene.tweens.pauseAll();
  }
  goToTarget(target: Vector2) {
    const tile = this.roadsTilemap.getTileAtWorldXY(
      this.sprite.x - tileOffset.x + this.map.tileWidth / 2,
      this.sprite.y - tileOffset.y + this.map.tileHeight / 2
    );
    const targetTile = this.roadsTilemap.getTileAtWorldXY(
      target.x - tileOffset.x + this.map.tileWidth / 2,
      target.y - tileOffset.y + this.map.tileHeight / 2
    );
    const graphics = this.scene.add.graphics();
    graphics.strokeRect(
      target.x - tileOffset.x + this.map.tileWidth / 2,
      target.y - tileOffset.y + this.map.tileHeight / 2,
      50,
      50
    );
    const car = this;
    // this.pathFinder.buildPathfindingMap(this.roadsTilemap);
    this.pathFinder.findPath(tile.x, tile.y, targetTile.x, targetTile.y, (path) => {
      // path.forEach((tile, idx, self) => {
      //   const tilePos = this.roadsTilemap.tileToWorldXY(tile.x, tile.y);
      //   let nextTile = self[idx + 1];
      //   if (!nextTile) nextTile = tile;
      //   const nextTilePos = this.roadsTilemap.tileToWorldXY(nextTile.x, nextTile.y);
      //   this.gfx.lineStyle(3, 0xff0000, 1);
      //   this.gfx.lineBetween(
      //     tilePos.x + tileOffset.x,
      //     tilePos.y + tileOffset.y,
      //     nextTilePos.x + tileOffset.x,
      //     nextTilePos.y + tileOffset.y
      //   );
      // });
      car.moveCar(path);
    });
    this.pathFinder.calculate();
  }
  setRotation(tileA: Vector2, tileB: Vector2) {
    if (tileA.x === tileB.x && tileA.y === tileB.y) return;
    const angle = (((Phaser.Math.Angle.BetweenPoints(tileA, tileB) * Phaser.Math.PI2 * 100) % 360) + 360) % 360;
    let dir = 'E';
    if (angle >= 0 && angle < 90) dir = 'NE';
    if (angle >= 90 && angle < 180) dir = 'NW';
    if (angle >= 180 && angle < 270) dir = 'SW';
    if (angle >= 270 && angle < 360) dir = 'SE';

    this.sprite.setFrame(`sedan_${dir}.png`);
  }

  moveCar(path: { x: number; y: number }[]) {
    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    let tweens: Tween[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      let thisPath = path[i + 1];
      let nextPath = path[i + 2] || thisPath;
      const tile = this.roadsTilemap.tileToWorldXY(thisPath.x, thisPath.y);
      const nextTile = this.roadsTilemap.tileToWorldXY(nextPath.x, nextPath.y);
      const car = this;
      tweens.push({
        targets: this.sprite,
        onComplete: (tween) => {
          events.emit(GameEvents.BatteryDrain);
          car.setRotation(tile, nextTile);
        },
        x: { value: tile.x + tileOffset.x, duration: 200 },
        y: { value: tile.y + tileOffset.y, duration: 200 }
      });
    }
    this.scene.tweens.timeline({ tweens: tweens });
  }

  update() {
    // this.sprite.setVelocity(xVel, yVel);
  }
}
