import Phaser from 'phaser';

const sharedInstance = new Phaser.Events.EventEmitter();
export { sharedInstance };

export enum GameEvents {
  CarOutsideOfBounds = 'CarOutside'
}
