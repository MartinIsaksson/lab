import { sharedInstance } from '../infrastructure/EventCenter';

export const GAME_COMPLETED_EVENT = 'game-completed';
interface PlayedGame {
  timestamp: number;
  player: string;
  score: number;
}

const marginHorizontal = 100;
const marginVertical = 50;
export default class HighscoreScene extends Phaser.Scene {
  batteryLevelText: Phaser.GameObjects.Text;
  private backgroundRect: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'ui' });
  }
  init() {
    sharedInstance.on(GAME_COMPLETED_EVENT, this.showHighscore, this);
  }

  drawBackground() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(
      marginHorizontal,
      marginVertical,
      this.sys.canvas.width - marginHorizontal * 2,
      this.sys.canvas.height - marginVertical * 2
    );
  }

  drawTitle() {
    this.batteryLevelText = this.add.text(this.sys.canvas.width / 2, 100, 'HIGHSCORE', {
      fontFamily: 'Comfortaa',
      fontSize: '5em'
    });
    this.batteryLevelText.setOrigin(0.5);
  }

  drawHighscoreHeaders(x: number, y: number) {
    this.add.text(x, y, `#`, {
      fontFamily: 'Comfortaa',
      fontSize: '3em'
    });
    this.add.text(x + 600, y, 'Date', {
      fontFamily: 'Comfortaa',
      fontSize: '3em'
    });
    this.add.text(x + 30, y, 'Name', {
      fontFamily: 'Comfortaa',
      fontSize: '3em'
    });
    this.drawTextRightJustified(this.sys.canvas.width - 150, y, 'Score', {
      fontFamily: 'Comfortaa',
      fontSize: '3em'
    });
  }

  showHighscore(val) {
    console.log(val);
    this.drawBackground();
    this.drawTitle();
    const allGamesJson = localStorage.getItem('all-games');
    const allGames: PlayedGame[] = allGamesJson ? JSON.parse(allGamesJson) : [];
    const currentGame = {
      timestamp: new Date().getTime(),
      player: 'Markus',
      score: val
    };
    allGames.push(currentGame);
    const newHighscores = allGames.sort((a, b) => a.score - b.score).slice(0, 10);
    const startX = 150;
    const startY = 160;
    this.drawHighscoreHeaders(startX, startY);
    const entriesStartY = startY + 50;
    newHighscores.forEach((game, index) => {
      const fontColor = game === currentGame ? '#fcffb3' : 'white';
      this.add.text(startX, entriesStartY + index * 45, `${index + 1}. `, {
        fontFamily: 'Roboto',
        fontSize: '2em',
        color: fontColor
      });
      this.add.text(startX + 30, entriesStartY + index * 45, `${game.player}`, {
        fontFamily: 'Roboto',
        fontSize: '2em',
        color: fontColor
      });
      this.add.text(startX + 600, entriesStartY + index * 45, `${new Date(game.timestamp).toLocaleString()} `, {
        fontFamily: 'Roboto',
        fontSize: '2em',
        color: fontColor
      });
      this.drawTextRightJustified(this.sys.canvas.width - 150, entriesStartY + index * 45, `${game.score}`, {
        fontFamily: 'Roboto',
        fontSize: '2em',
        color: fontColor
      });
    });
    localStorage.setItem('all-games', JSON.stringify(newHighscores));
  }

  drawTextRightJustified(xEnd: number, y: number, text: string, style: any) {
    const textObject = this.add.text(xEnd, y, text, style);
    textObject.setPosition(textObject.x - textObject.width, textObject.y);
  }

  create() {}
}
