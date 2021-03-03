import EasyStar, { js } from 'easystarjs';

export class Pathfinder extends js {
 constructor() {
     super()
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

    this.setGrid(grid);
    this.setAcceptableTiles(acceptableTiles);
  }
}
