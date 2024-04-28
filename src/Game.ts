import WebSocket from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, MOVE, INIT_GAME } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private startTime: Date;
  private moveCount=0

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: "white",
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: "black",
      })
    );
  }

  public makeAMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    //is it valid move
    //is it this user mover
    // all above using zod
    if (this.moveCount % 2 == 0 && socket !== this.player1) {
      return;
    }
    if (this.moveCount % 2 == 1 && socket !== this.player2) {
      return;
    }
    try {
      this.board.move(move);
    } catch (e) {
        console.log(e)
      return;
    }
    //is it check mate  draw or stale
    //update the board
    //push the move
    // send the board to both players
    if (this.board.isGameOver()) {
      this.player1.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() == "w" ? "black" : "white",
          },
        })
      );
      this.player2.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() == "w" ? "black" : "white",
          },
        })
      );
      return;
    }
    if (this.moveCount % 2 == 0) {
      this.player2.send(      
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })

      );
    }
    this.moveCount++
  }
}
