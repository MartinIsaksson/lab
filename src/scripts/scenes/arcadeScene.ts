export default class ArcadeScene extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  car: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  lastSetFrame: any;
  constructor() {
    super({ key: 'ArcadeScene' });
  }
  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  preload() {
    this.load.setPath('../../assets');
    this.load.atlas('isoblocks', 'isoblocks.png', 'isoblocks.json');
    this.load.atlas('car', 'sedan-sheet.png', 'sedan-sheet.json');
    this.load.tilemapTiledJSON('roadsMap', 'map.json');
    this.load.image('roads-sheet', 'city-roads-sheet.png'); //Its the roads sheet
    this.load.image('paths', 'nature-path-sheet.png'); //Paths and base sheet
    this.load.image('trees', 'trees-sheet.png');
    this.load.image('mountain', 'mountain-sheet.png');
  }

  create() {

    
    const map = this.add.tilemap('roadsMap');
    const naturePaths = map.addTilesetImage('nature-path-sheet', 'paths');
    const roadsTileset = map.addTilesetImage('roads', 'roads-sheet');
    const treesTileset = map.addTilesetImage('trees', 'trees');
    const mountaintileSet = map.addTilesetImage('mountain', 'mountain');
    const bottom = map.createLayer('bottom', naturePaths);
    bottom.setCollisionByProperty({ collides: true });
    // this.matter.world.convertTilemapLayer(bottom);
    const roads = map.createLayer('middle', [roadsTileset, naturePaths]);

    const trees = map.createLayer('trees', treesTileset);
    const mountain = map.createLayer('mountain_bottom', mountaintileSet);
    // this.matter.world.convertTilemapLayer(roads);


    this.physics.world.bounds.setTo(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.createDebugGraphic();
    this.physics.world.drawDebug = true;

    this.car = this.physics.add.sprite(0, 0, 'car', 'sedan_W.png').setScale(0.5).refreshBody();
    this.car.setCollideWorldBounds(true);
    this.cameras.main.setSize(1920, 1080);
    this.cameras.main.zoom = 0.5;
    this.cameras.main.x -= 300;
    this.cameras.main.y -= 200;
    this.cameras.main.startFollow(this.car, true);

  
  }

  update() {
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
    const velY = carFrame.includes('N') ? -200 : carFrame.includes('S') ? 200 : 0;
    const velX = carFrame.includes('E') ? 200 : carFrame.includes('W') ? -200 : 0;
    this.car.setVelocity(velX, velY);
    this.car.setFrame(`sedan_${this.lastSetFrame}.png`);
  }
}
