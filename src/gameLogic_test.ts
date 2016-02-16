describe("In TicTacToe", function() {
  let OK = true;
  let ILLEGAL = false;
  let WHITE = gameLogic.WHITE;
  let BLACK = gameLogic.BLACK;
  let NO_ONE_TURN = -1;
  let NO_ONE_WINS: number[] = null;

  it("placing BLACK in 0x0 from initial state is legal", function() {
      let boardAfter = [[BLACK, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1], ]
      expectMove(OK, BLACK, null, null, 0, 0, boardAfter, false, [], [{ row: 0, col: 0 }], 0, 0, WHITE, null);
  });

  it("placing WHITE in taken position is illegal", function() {
      let boardBefore =
            [[BLACK, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        let whiteStones: Stone[] = [];
        let stateBeforeMove = { board: boardBefore,
                    delta: { row: 0, col: 0 },
                    hasPassed: false,
                    whiteStones: whiteStones,
                    blackStones: [{ row: 0, col: 0 }],
                    whiteScore: 0,
                    blackScore: 0 };
        let boardAfter = [[BLACK, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        expectMove(ILLEGAL, WHITE, boardBefore, stateBeforeMove, 0, 0, boardAfter, false, [], [{ row: 0, col: 0 }], 0, 0, WHITE, null);
    });
  it("Trapping WHITE stones work", function() {
      let boardBefore = [[BLACK, WHITE, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [-1, -1, -1, -1, -1],];
        let stateBeforeMove = { board: boardBefore,
                    delta: { row: 0, col: 0 },
                    hasPassed: false,
                    whiteStones: [{row:0,col:1},{row:1,col:0}, {row:2,col:0}],
                    blackStones: [{row:0,col:0}, {row:1,col:1}, {row:2,col:1}, {row:3,col:1}],
                    whiteScore: 0,
                    blackScore: 0 };
        let boardAfter = [[BLACK, WHITE, -1, -1, -1],
                         [-1, BLACK, -1, -1, -1],
                         [-1, BLACK, -1, -1, -1],
                         [-1, BLACK, -1, -1, -1],
                         [BLACK, -1, -1, -1, -1],];
        expectMove(OK, BLACK, boardBefore, stateBeforeMove, 4, 0, boardAfter, false,
        [{row:0,col:1}], [{row:0,col:0}, {row:1,col:1}, {row:2,col:1}, {row:3,col:1}, {row:4,col:0}], 0, 3, WHITE, null);
    });
    
  it("Trapping BLACK stones work", function() {
      let boardBefore = [[BLACK, WHITE, -1, -1, -1],
                        [BLACK, WHITE, -1, -1, -1],
                        [BLACK, WHITE, -1, -1, -1],
                        [-1, BLACK, -1, -1, -1],
                        [-1, -1, -1, -1, -1],];
        let stateBeforeMove = { board: boardBefore,
                    delta: { row: 3, col: 1 },
                    hasPassed: false,
                    blackStones: [{row:0,col:0},{row:1,col:0}, {row:2,col:0}, {row:3,col:1}],
                    whiteStones: [{row:0,col:1}, {row:1,col:1}, {row:2,col:1}],
                    whiteScore: 0,
                    blackScore: 0 };
        let boardAfter = [[-1, WHITE, -1, -1, -1],
                        [-1, WHITE, -1, -1, -1],
                        [-1, WHITE, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [-1, -1, -1, -1, -1],];
        expectMove(OK, WHITE, boardBefore, stateBeforeMove, 3, 0, boardAfter, false,
            [{row:0,col:1}, {row:1,col:1}, {row:2,col:1}, {row:3,col:0}], [{row:3,col:1}], 3, 0, BLACK, null);
    });
    
  it("Recognizes row:-1, col:-1 as a pass", function() {
        let boardAfter = [[-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1]];
        expectMove(OK, BLACK, null, null, -1, -1, boardAfter, true,
            [], [], 0, 0, WHITE, null);
    });
    
  it("Not allowing suicide moves", function() {
      let boardBefore = [[-1, WHITE, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [-1, BLACK, -1, -1, -1],
                        [-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1],];
        let stateBeforeMove = { board: boardBefore,
                    delta: { row: 1, col: 1 },
                    hasPassed: false,
                    blackStones: [{row:1,col:1},{row:2,col:1}],
                    whiteStones: [{row:0,col:1}, {row:1,col:0}],
                    whiteScore: 0,
                    blackScore: 0 };
        let boardAfter= [[-1, WHITE, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [-1, BLACK, -1, -1, -1],
                        [-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1],];
        expectMove(ILLEGAL, BLACK, boardBefore, stateBeforeMove, 0, 0, boardAfter, false,
            [{row:0,col:1}, {row:1,col:0}], [{row:1,col:1},{row:2,col:1}], 0, 0, BLACK, null);
    });
    
  it("Outputs correct end game scores", function() {
      let boardBefore = [[-1, WHITE, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [-1, BLACK, -1, -1, -1],
                        [-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1],];
        let stateBeforeMove = { board: boardBefore,
                    delta: { row: -1, col: -1 },
                    hasPassed: true,
                    blackStones: [{row:1,col:1}, {row:2,col:1}],
                    whiteStones: [{row:0,col:1}, {row:1,col:0}],
                    whiteScore: 4,
                    blackScore: 8 };
        let boardAfter= [[-1, WHITE, -1, -1, -1],
                        [WHITE, BLACK, -1, -1, -1],
                        [-1, BLACK, -1, -1, -1],
                        [-1, -1, -1, -1, -1],
                        [-1, -1, -1, -1, -1],];
        expectMove(OK, WHITE, boardBefore, stateBeforeMove, -1, -1, boardAfter, true,
            [{row:0,col:1}, {row:1,col:0}], [{row:1,col:1},{row:2,col:1}], 4, 8, BLACK, [8,4]);
    });
    
  function expectMove(
      isOk: boolean,
      turnIndexBeforeMove: number,
      boardBeforeMove: Board,
      stateBeforeMove: IState,
      row: number,
      col: number,
      boardAfterMove: Board,
      hasPassed: boolean,
      whiteStones: Stone[],
      blackStones: Stone[],
      whiteScore: number,
      blackScore: number,
      turnIndexAfterMove: number,
      endMatchScores: number[]): void {
          
    let stateTransition: IStateTransition = {
      turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: {
        endMatchScores: endMatchScores,
        turnIndexAfterMove: turnIndexAfterMove,
        stateAfterMove: {
            delta: {row: row, col: col},
            board: boardAfterMove,
            hasPassed: hasPassed,
            whiteScore: whiteScore,
            blackScore: blackScore,
            whiteStones: whiteStones,
            blackStones: blackStones }
      },
      numberOfPlayers: null
    };
    if (isOk) {
      gameLogic.checkMoveOk(stateTransition);
    } else {
      // We expect an exception to be thrown :)
      let didThrowException = false;
      try {
        gameLogic.checkMoveOk(stateTransition);
      } catch (e) {
        didThrowException = true;
      }
      if (!didThrowException) {
        throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!")
      }
    }
  }
/*
  it("placing X in 0x0 from initial state is legal", function() {
    expectMove(OK, X_TURN, null, 0, 0,
      [['X', '', ''],
       ['', '', ''],
       ['', '', '']], O_TURN, NO_ONE_WINS);
  });

  it("placing X in 0x0 from initial state but setting the turn to yourself is illegal", function() {
    expectMove(ILLEGAL, X_TURN, null, 0, 0,
      [['X', '', ''],
       ['', '', ''],
       ['', '', '']], X_TURN, NO_ONE_WINS);
  });

  it("placing X in 0x0 from initial state and winning is illegal", function() {
    expectMove(ILLEGAL, X_TURN, null, 0, 0,
      [['X', '', ''],
       ['', '', ''],
       ['', '', '']], NO_ONE_TURN, X_WIN_SCORES);
  });

  it("placing X in 0x0 from initial state and setting the wrong board is illegal", function() {
    expectMove(ILLEGAL, X_TURN, null, 0, 0,
      [['X', 'X', ''],
       ['', '', ''],
       ['', '', '']], O_TURN, NO_ONE_WINS);
  });

  it("placing O in 0x1 after X placed X in 0x0 is legal", function() {
    expectMove(OK, O_TURN,
      [['X', '', ''],
       ['', '', ''],
       ['', '', '']], 0, 1,
      [['X', 'O', ''],
       ['', '', ''],
       ['', '', '']], X_TURN, NO_ONE_WINS);
  });

  it("placing an O in a non-empty position is illegal", function() {
    expectMove(ILLEGAL, O_TURN,
      [['X', '', ''],
       ['', '', ''],
       ['', '', '']], 0, 0,
      [['O', '', ''],
       ['', '', ''],
       ['', '', '']], X_TURN, NO_ONE_WINS);
  });

  it("cannot move after the game is over", function() {
    expectMove(ILLEGAL, O_TURN,
      [['X', 'O', ''],
       ['X', 'O', ''],
       ['X', '', '']], 2, 1,
      [['X', 'O', ''],
       ['X', 'O', ''],
       ['X', 'O', '']], X_TURN, NO_ONE_WINS);
  });

  it("placing O in 2x1 is legal", function() {
    expectMove(OK, O_TURN,
      [['O', 'X', ''],
       ['X', 'O', ''],
       ['X', '', '']], 2, 1,
      [['O', 'X', ''],
       ['X', 'O', ''],
       ['X', 'O', '']], X_TURN, NO_ONE_WINS);
  });

  it("X wins by placing X in 2x0 is legal", function() {
    expectMove(OK, X_TURN,
      [['X', 'O', ''],
       ['X', 'O', ''],
       ['', '', '']], 2, 0,
      [['X', 'O', ''],
       ['X', 'O', ''],
       ['X', '', '']], NO_ONE_TURN, X_WIN_SCORES);
  });

  it("O wins by placing O in 1x1 is legal", function() {
    expectMove(OK, O_TURN,
      [['X', 'X', 'O'],
       ['X', '', ''],
       ['O', '', '']], 1, 1,
      [['X', 'X', 'O'],
       ['X', 'O', ''],
       ['O', '', '']], NO_ONE_TURN, O_WIN_SCORES);
  });

  it("the game ties when there are no more empty cells", function() {
    expectMove(OK, X_TURN,
      [['X', 'O', 'X'],
       ['X', 'O', 'O'],
       ['O', 'X', '']], 2, 2,
      [['X', 'O', 'X'],
       ['X', 'O', 'O'],
       ['O', 'X', 'X']], NO_ONE_TURN, TIE_SCORES);
  });

  it("move without board is illegal", function() {
    expectMove(ILLEGAL, X_TURN,
      [['X', 'O', 'X'],
       ['X', 'O', 'O'],
       ['O', 'X', '']], 2, 2,
      null, NO_ONE_TURN, TIE_SCORES);
  });

  it("placing X outside the board (in 0x3) is illegal", function() {
    expectMove(ILLEGAL, X_TURN,
      [['', '', ''],
       ['', '', ''],
       ['', '', '']], 0, 3,
      [['', '', '', 'X'],
       ['', '', ''],
       ['', '', '']], O_TURN, NO_ONE_WINS);
  });
  
  */
});
