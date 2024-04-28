import WebSocket from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private users: WebSocket[];
  private pendingUser: WebSocket | null;

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }
  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.handler(socket);
  }
  removeUser(socket: WebSocket) {
    this.users = this.users.filter((s) => s !== socket);
  }
  private handler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          // start game
          const game = new Game(this.pendingUser, socket);
          this.games.push(game);
          this.pendingUser = null;
        } 
        else {
          this.pendingUser = socket;
        }
      }
      if (message.type === MOVE) {
        const game=this.games.find((game)=>game.player1===socket||game.player2==socket)
        if(game){
          console.log("make move")
          game.makeAMove(socket,message.move)

          
        }
      }
    });
  }
}