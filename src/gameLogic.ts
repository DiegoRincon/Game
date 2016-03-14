type Board = number[][];

interface Stone {
    row: number;
    col: number;
}

interface BoardDelta {
  row: number;
  col: number;
}
interface IState {
  board: Board;
  delta: BoardDelta;
  hasPassed: Boolean;
  whiteStones: Stone[];
  blackStones: Stone[];
  whiteScore: number;
  blackScore: number;
}

module gameLogic {
  //TODO: Allow players to determine cells.
  export let ROWS : number = 13;
  export let COLS : number = 13;
  export const BLACK = 0;
  export const WHITE = 1;

  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
  function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = -1;
      }
    }
    return board;
  }

  //TODO: Add a parameter for handicap
  export function getInitialState(): IState {
      let whiteStones: Stone[] = [];
      let blackStones: Stone[] = [];
      return { board: getInitialBoard(), delta: null, hasPassed: false, whiteScore: 0, blackScore: 0, whiteStones: whiteStones, blackStones: blackStones };
  }

  function isTie(board: Board): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] === -1) {
          // If there is an empty cell then we do not have a tie.
          return false;
        }
      }
    }
    // No empty cells, so we have a tie!
    return true;
  }
  
  function isSuicide(board: Board, row: number, col: number, oppColor: number, stateBeforeMove: IState): boolean {
      let newBoard = angular.copy(board);
      newBoard[row][col] = (oppColor == WHITE) ? BLACK : WHITE;
      
      let oppStones = (oppColor == WHITE) ? stateBeforeMove.whiteStones : stateBeforeMove.blackStones;
      let trappedStones: Stone[] = getTrapped(newBoard, oppColor, oppStones);
      if (trappedStones.length >= 0) {
          return false;
      }
            
      for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
              if (Math.abs(i) === Math.abs(j)) {
                  continue;
              }
              if (row + i < 0 || col + j < 0) {
                  continue;
              }
              if (row + i >= ROWS || col + j >= COLS) {
                  continue;
              }
              //oppColor will be the opponent's color
              if (board[row + i][col + j] !== oppColor) {
                  return false
              }
          }
      }      
      return true;
  }
  
  /**
   * Returns whether the move doesn't break the rules
   */
  function isLegalMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number): boolean {
      let board: Board = stateBeforeMove.board;
      //Check if intersection is empty
      if (board[row][col] !== -1) {
          throw new Error("One can only make a move in an empty position!");
      }
      //Make sure you are not suiciding
      let color = (turnIndexBeforeMove === 1) ? 0 : 1;
      if (isSuicide(board, row, col, color, stateBeforeMove)) {
          throw new Error("You cannot make a suicide move");
      }
      return true;
  }
  
  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) { // stateBeforeMove is null in a new match.
      stateBeforeMove = getInitialState();
    }
    let board: Board = stateBeforeMove.board;    
    let endMatchScores: number[];
    let turnIndexAfterMove: number;
    /**
     * MAKE SURE THE PLAY ADHERES TO RULES
     */
    
    let gameEnded : Boolean;
    if (row === -1 && col === -1) {
        gameEnded = (stateBeforeMove.hasPassed) ? true : false;
        let delta: BoardDelta = {row: row, col: col};
        return endOfTurnMove(board, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta);
    }
    
    if (!isLegalMove(stateBeforeMove,row,col,turnIndexBeforeMove)) {
        throw Error("Not a legal move!")
    }
    
    // At this point everything looks good, compute scores and move on
    
    let boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove;
    let delta: BoardDelta = {row: row, col: col};
    return endOfTurnMove(boardAfterMove, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta);
  }
  
  function removeTrappedStonesBoard(trappedStones: Stone[], board: Board): void {
      if (!trappedStones) {
          return;
      }
      for (let i = 0; i < trappedStones.length; i++) {
          let stone = trappedStones[i];
          board[stone.row][stone.col] = -1;
      }
  }
  
  function removeTrappedStones(trappedStones: Stone[], stones: Stone[]): void {
      if (!trappedStones) {
          return;
      }
      for (let i = 0; i < trappedStones.length; i++) {
          for (let j = 0; j < stones.length; j++) {
              let stone = trappedStones[i];
              if (angular.equals(stone, stones[j])) {
                  stones.splice(j,1);
              }
          }
      }
  }
  
  function endOfTurnMove(boardAfterMove: Board, gameEnded: Boolean, turnIndexBeforeMove: number, stateBeforeMove: IState, delta: BoardDelta): IMove {
      let newWhiteScore: number = stateBeforeMove.whiteScore;
      let newBlackScore: number = stateBeforeMove.blackScore;
      let hasPassed: boolean = false;
      if (delta.row === -1 && delta.col === -1) {
          hasPassed = true;
      }
      let newWhiteStones: Stone[] = angular.copy(stateBeforeMove.whiteStones);
      let newBlackStones: Stone[] = angular.copy(stateBeforeMove.blackStones);
      if (!hasPassed && turnIndexBeforeMove === WHITE) {
          let trappedStones = getTrapped(boardAfterMove, BLACK, stateBeforeMove.blackStones);
          removeTrappedStonesBoard(trappedStones, boardAfterMove);
          removeTrappedStones(trappedStones, newBlackStones);
          
          let newStones: number = (trappedStones) ? trappedStones.length: 0;
          newWhiteScore = stateBeforeMove.whiteScore + newStones;
      } else if (!hasPassed) {          
          let trappedStones = getTrapped(boardAfterMove, WHITE, stateBeforeMove.whiteStones);
          removeTrappedStonesBoard(trappedStones, boardAfterMove);
          removeTrappedStones(trappedStones, newWhiteStones);
          
          let newStones: number = (trappedStones) ? trappedStones.length: 0;
          newBlackScore = stateBeforeMove.blackScore + newStones;
      }
      if (hasPassed) {
          newWhiteScore = stateBeforeMove.whiteScore;
          newBlackScore = stateBeforeMove.blackScore;
      }
      let endMatchScores : number[];
      let turnIndexAfterMove: number;
      if (gameEnded) {
          endMatchScores = [newBlackScore, newWhiteScore];
          turnIndexAfterMove = -1;
      } else {
          endMatchScores = null;
          turnIndexAfterMove = (turnIndexBeforeMove == WHITE) ? BLACK : WHITE;
      }
      if (!hasPassed) {
          newWhiteStones = (turnIndexBeforeMove === WHITE) ? newWhiteStones.concat({ row: delta.row, col: delta.col }) : newWhiteStones;
          newBlackStones = (turnIndexBeforeMove === BLACK) ? newBlackStones.concat({ row: delta.row, col: delta.col }) : newBlackStones;
      }
      let stateAfterMove: IState = {
          delta: delta,
          board: boardAfterMove,
          hasPassed: hasPassed,
          whiteScore: newWhiteScore,
          blackScore: newBlackScore,
          whiteStones: newWhiteStones,
          blackStones: newBlackStones };
      return {endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
  }

  function getTrapped(board: Board, color: number, colorStones: Stone[]): Stone[] {
      let trapped: Stone[] = [];
      let seen: Stone[] = [];
      let connected = getConnected(seen, board, colorStones, color);
      while (connected && connected.length !== 0) {
          //check if connected stones have an exit
          if (stonesHaveExit(connected, board)) {
              seen = seen.concat(connected);
              connected = getConnected(seen, board, colorStones, color);
              continue;
          } else {
              //these stones are trapped!!
              //Add stones to trapped
              trapped = trapped.concat(connected);
              //add stones to seen
              seen = seen.concat(connected);
              connected = getConnected(seen, board, colorStones, color);
          }
      }
      return trapped;
      
  } 
   
  function getConnected(seen: Stone[], board: Board, stones: Stone[], color: number): Stone[] {
      for (let i = 0; i < stones.length; i++) {
          let stone: Stone = stones[i];
          if (isStoneInArray(stone, seen)) {
              continue;
          }
          let stoneArray: Stone[] = [];
          return getAllConnectedFromStone(stone, board, color, stoneArray);
      }
      return null;
  }
  
  function getTerritory(board: Board, color: number) : number {
      let seen : Stone[] = [];
      let score = 0;
      for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
              if (board[row][col] !== -1) {
                  continue;
              }
              let stone = {row: row, col: col};
              if (isStoneInArray(stone, seen)) {
                  continue;
              }
              let connected: Stone[] = [];
              getAllConnectedFromStone(stone, board, -1, connected);
              if (areStonesInTerritory(color, connected, board)) {
                  score += connected.length;
              }
              seen = seen.concat(connected);
          }
      }      
      return score;    
  }
    
  export function getWhiteTerritory(state : IState) : number {
      return getTerritory(state.board, WHITE);
  }
  
  export function getBlackTerritory(state : IState) : number { 
      return getTerritory(state.board, BLACK);
  }
    
  function getAllConnectedFromStone(stone: Stone, board: Board, color: number, visited: Stone[]): Stone[] {
      visited.push(stone);
      let x = stone.row;
      let y = stone.col;
      for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
              if (Math.abs(i) === Math.abs(j)) {
                  continue;
              }
              if (x + i < 0 || y + j < 0) {
                  continue;
              }
              if (x + i >= ROWS || y + j >= COLS) {
                  continue;
              }
              if (board[x + i][y + j] === color) {
                  let nextStone = { row: x + i, col: y + j };
                  if (isStoneInArray(nextStone, visited)) {
                      continue;
                  }
                  let connected: Stone[] = getAllConnectedFromStone(nextStone, board, color, visited);
                  //visited = visited.concat(connected);
              }
          }
      }
      return visited;
  }
  
  function areStonesInTerritory(color: number, stones: Stone[], board: Board) {
      for (let r = 0; r < stones.length; r++) {
          let stone = stones[r];
          let x = stone.row;
          let y = stone.col;
          for (let i = -1; i < 2; i++) {
              for (let j = -1; j < 2; j++) {
                  if (Math.abs(i) === Math.abs(j)) {
                      continue;
                  }
                  let newRow = x+i;
                  let newCol = y+j;
                  if (newRow < 0 || newCol < 0) {
                      continue;
                  }
                  if (newRow >= ROWS || newCol >= COLS) {
                      continue;
                  }
                  if (board[newRow][newCol] === -1) {
                      continue;
                  }
                  if (board[newRow][newCol] !== color) {
                      return false;
                  }
              }
          }
      }
      return true;
  }
  
  function stonesHaveExit(stones: Stone[], board: Board): boolean {
      for (let i = 0; i < stones.length; i++) {
          let stone = stones[i];
          let x = stone.row;
          let y = stone.col;
          for (let i = -1; i < 2; i++) {
              for (let j = -1; j < 2; j++) {
                  if (Math.abs(i) === Math.abs(j)) {
                      continue;
                  }
                  if (x + i < 0 || x + j < 0) {
                      continue;
                  }
                  if (x + i >= ROWS || y + j >= COLS) {
                      continue;
                  }
                  if (board[x + i][y + j] === -1) {
                      return true;
                  }
              }
          }
      }
      return false;
  }
  
  function isStoneInArray(stone: Stone, arr: Stone[]): boolean {
      if (!arr) {
          return false;
      }
      for (let i = 0; i < arr.length; i++) {
          let s: Stone = arr[i];
          if (angular.equals(s, stone)) {
              return true;
          }
      }
      return false;
  }

  export function checkMoveOk(stateTransition: IStateTransition): void {
      // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
      // to verify that the move is OK.
    
      let turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
      let stateBeforeMove: IState = stateTransition.stateBeforeMove;
      let move: IMove = stateTransition.move;
      let deltaValue: BoardDelta = stateTransition.move.stateAfterMove.delta;
      let row = deltaValue.row;
      let col = deltaValue.col;
      let expectedMove = createMove(stateBeforeMove, row, col, turnIndexBeforeMove);
      if (!angular.equals(move, expectedMove)) {
          throw new Error("Expected move=" + angular.toJson(move, true) +
              ", but got move=" + angular.toJson(expectedMove, true))
      }
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
    var params: IStateTransition = {
      turnIndexBeforeMove: 0,
      stateBeforeMove: null,
      move: move,
      numberOfPlayers: 2};
    gameLogic.checkMoveOk(params);
  }
}
