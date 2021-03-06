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
  previousBoard: Board;
  whiteScore: number;
  blackScore: number;
}

module gameLogic {
  //TODO: Allow players to determine cells.
  export const ROWS : number = 13;
  export const COLS : number = 13;
  export const BLACK = 0;
  export const WHITE = 1;
  export const BLACKTERR = 2;
  export const WHITETERR = 3;

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
      let initialBoard = getInitialBoard();
      return { board: initialBoard, delta: null, hasPassed: false,
           whiteScore: 0, blackScore: 0, whiteStones: whiteStones, blackStones: blackStones, previousBoard: initialBoard};
  }

    
  function isSuicide(board: Board, row: number, col: number, oppColor: number, stateBeforeMove: IState): boolean {
      let newBoard = angular.copy(board);
      newBoard[row][col] = (oppColor == WHITE) ? BLACK : WHITE;
      
      let oppStones = (oppColor == WHITE) ? stateBeforeMove.whiteStones : stateBeforeMove.blackStones;
      let trappedStones: Stone[] = getTrapped(newBoard, oppColor, oppStones);
      if (trappedStones.length > 0) {
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
  export function isLegalMove(
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
          
    // TODO: remove this hacky thing
    // if row == -1 and col == 0 then black resigned
    // if row == 0 and col == -1 then white resigned
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
        return endOfTurnMove(board, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta, -1);
    }
    if (row === -1 && col === 0) {
        //black resigned
        let delta: BoardDelta = {row: row, col: col};
        return endOfTurnMove(board, true, turnIndexBeforeMove, stateBeforeMove, delta, BLACK);
    }
    if (row === 0 && col === -1) {
        //white resigned
        let delta: BoardDelta = {row: row, col: col};
        return endOfTurnMove(board, true, turnIndexBeforeMove, stateBeforeMove, delta, WHITE);        
    }
    
    if (!isLegalMove(stateBeforeMove,row,col,turnIndexBeforeMove)) {
        throw Error("Not a legal move!")
    }
    
    // At this point everything looks good, compute scores and move on
    
    let boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove;
    // if (!checkKoRule(boardAfterMove, stateBeforeMove.previousBoard)) {
    //     throw Error("Cannot go back to a previous board!")
    // }
    let delta: BoardDelta = {row: row, col: col};
    return endOfTurnMove(boardAfterMove, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta, -1);
  }
  
  function checkKoRule(boardAfter: Board, boardBefore: Board): boolean {
      if (boardAfter === null || boardBefore === null) {
          return true;
      }
      if (angular.equals(boardAfter, boardBefore)) {
          return false;
      }
      return true;
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
  
  function endOfTurnMove(boardAfterMove: Board, gameEnded: Boolean, turnIndexBeforeMove: number, stateBeforeMove: IState, delta: BoardDelta, resigned: number): IMove {
      let newWhiteScore: number = stateBeforeMove.whiteScore;
      let newBlackScore: number = stateBeforeMove.blackScore;
      let hasPassed: boolean = false;
      if (delta.row === -1 && delta.col === -1) {
          hasPassed = true;
      }
      let newWhiteStones: Stone[] = angular.copy(stateBeforeMove.whiteStones);
      let newBlackStones: Stone[] = angular.copy(stateBeforeMove.blackStones);
      if (!hasPassed) {
          newWhiteStones = (turnIndexBeforeMove === WHITE) ? newWhiteStones.concat({ row: delta.row, col: delta.col }) : newWhiteStones;
          newBlackStones = (turnIndexBeforeMove === BLACK) ? newBlackStones.concat({ row: delta.row, col: delta.col }) : newBlackStones;
      }
      if (!hasPassed && turnIndexBeforeMove === WHITE) {
          let trappedStones = getTrapped(boardAfterMove, BLACK, stateBeforeMove.blackStones);
          removeTrappedStonesBoard(trappedStones, boardAfterMove);
          removeTrappedStones(trappedStones, newBlackStones);
          
          let newStones: number = (trappedStones) ? trappedStones.length: 0;
          //newWhiteScore = getWhiteTerritory(boardAfterMove, newWhiteStones.length);
          newWhiteScore = stateBeforeMove.whiteScore + newStones;
      } else if (!hasPassed) {          
          let trappedStones = getTrapped(boardAfterMove, WHITE, stateBeforeMove.whiteStones);
          removeTrappedStonesBoard(trappedStones, boardAfterMove);
          removeTrappedStones(trappedStones, newWhiteStones);
          
          let newStones: number = (trappedStones) ? trappedStones.length: 0;
          //newBlackScore = getBlackTerritory(boardAfterMove, newBlackStones.length);
          newBlackScore = stateBeforeMove.blackScore + newStones;
      }
      if (!hasPassed) {
          if (!checkKoRule(boardAfterMove, stateBeforeMove.previousBoard)) {
              throw Error("Cannot go back to a previous board!")
          }
      } else {
          newWhiteScore = stateBeforeMove.whiteScore;
          newBlackScore = stateBeforeMove.blackScore;
      }
      let endMatchScores : number[];
      let turnIndexAfterMove: number;
      if (gameEnded) {
          if (resigned === BLACK) {
              endMatchScores = [0, 1];
              boardAfterMove = placeTerritories(boardAfterMove);
              turnIndexAfterMove = -1;
          } else if (resigned === WHITE) {
              endMatchScores = [1, 0];
              boardAfterMove = placeTerritories(boardAfterMove);
              turnIndexAfterMove = -1;
          } else {
              let finalWhiteScore = getWhiteTerritory(boardAfterMove, newWhiteStones.length);
              let finalBlackScore = getBlackTerritory(boardAfterMove, newBlackStones.length);
              endMatchScores = [finalBlackScore, finalWhiteScore];
              boardAfterMove = placeTerritories(boardAfterMove);
              turnIndexAfterMove = -1;
          }
      } else {
          endMatchScores = null;
          turnIndexAfterMove = (turnIndexBeforeMove == WHITE) ? BLACK : WHITE;
      }
      let stateAfterMove: IState = {
          delta: delta,
          board: boardAfterMove,
          hasPassed: hasPassed,
          whiteScore: newWhiteScore,
          blackScore: newBlackScore,
          whiteStones: newWhiteStones,
          blackStones: newBlackStones,
          previousBoard: stateBeforeMove.board};
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
  
  function getTerritory(board: Board, color: number) : Stone[] {
      let seen : Stone[] = [];
      let territory : Stone[] = [];
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
                  territory = territory.concat(connected);
              }
              seen = seen.concat(connected);
          }
      }      
      return territory;    
  }
  
  function placeTerritories(board : Board) : Board {
      let whiteTerr = getTerritory(board, WHITE);
      let blackTerr = getTerritory(board, BLACK);
      let newBoard = angular.copy(board);
      for (let i=0; i < whiteTerr.length; i++) {
          let stone = whiteTerr[i];
          newBoard[stone.row][stone.col] = WHITETERR;
      }
      for (let i=0; i < blackTerr.length; i++) {
          let stone = blackTerr[i];
          newBoard[stone.row][stone.col] = BLACKTERR;
      }
      return newBoard;
  }
      
  export function getWhiteTerritory(board : Board, numWhiteStones: number) : number {
      return getTerritory(board, WHITE).length + numWhiteStones;
  }
  
  export function getBlackTerritory(board : Board, numBlackStones: number) : number { 
      return getTerritory(board, BLACK).length + numBlackStones;
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
      for (let s = 0; s < stones.length; s++) {
          let stone = stones[s];
          let x = stone.row;
          let y = stone.col;
          for (let i = -1; i < 2; i++) {
              for (let j = -1; j < 2; j++) {
                  if (Math.abs(i) === Math.abs(j)) {
                      continue;
                  }
                  let r = x+i;
                  let c = y+j;
                  if (r < 0 || c < 0) {
                      continue;
                  }
                  if (r >= ROWS || c >= COLS) {
                      continue;
                  }
                  if (board[r][c] === -1) {
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
