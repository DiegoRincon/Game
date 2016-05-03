describe("In Go", function () {
    var OK = true;
    var ILLEGAL = false;
    var WHITE = gameLogic.WHITE;
    var BLACK = gameLogic.BLACK;
    //   gameLogic.ROWS = 5;
    //   gameLogic.COLS = 5;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    it("placing BLACK in 0x0 from initial state is legal", function () {
        var boardBefore = [[-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        var boardAfter = [[BLACK, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        expectMove(OK, BLACK, null, null, 0, 0, boardAfter, false, [], [{ row: 0, col: 0 }], 0, 0, WHITE, null, boardBefore);
    });
    it("placing WHITE in taken position is illegal", function () {
        var boardBefore = [[BLACK, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        var whiteStones = [];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 0, col: 0 },
            hasPassed: false,
            whiteStones: whiteStones,
            blackStones: [{ row: 0, col: 0 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        var boardAfter = [[BLACK, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        expectMove(ILLEGAL, WHITE, boardBefore, stateBeforeMove, 0, 0, boardAfter, false, [], [{ row: 0, col: 0 }], 0, 0, WHITE, null, boardBefore);
    });
    it("Trapping WHITE stones work", function () {
        var boardBefore = [[BLACK, WHITE, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 0, col: 0 },
            hasPassed: false,
            whiteStones: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 0 }],
            blackStones: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        var boardAfter = [[BLACK, WHITE, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [BLACK, -1, -1, -1, -1],];
        expectMove(OK, BLACK, boardBefore, stateBeforeMove, 4, 0, boardAfter, false, [{ row: 0, col: 1 }], [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 0 }], 0, 3, WHITE, null, boardBefore);
    });
    it("Trapping BLACK stones work", function () {
        var boardBefore = [[BLACK, WHITE, -1, -1, -1],
            [BLACK, WHITE, -1, -1, -1],
            [BLACK, WHITE, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 3, col: 1 },
            hasPassed: false,
            blackStones: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 1 }],
            whiteStones: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        var boardAfter = [[-1, WHITE, -1, -1, -1],
            [-1, WHITE, -1, -1, -1],
            [-1, WHITE, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        expectMove(OK, WHITE, boardBefore, stateBeforeMove, 3, 0, boardAfter, false, [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 0 }], [{ row: 3, col: 1 }], 3, 0, BLACK, null, boardBefore);
    });
    it("Recognizes row:-1, col:-1 as a pass", function () {
        var boardAfter = [[-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1]];
        var previousBoard = [];
        expectMove(OK, BLACK, null, null, -1, -1, boardAfter, true, [], [], 0, 0, WHITE, null, boardAfter);
    });
    it("Not allowing suicide moves", function () {
        var boardBefore = [[-1, WHITE, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 1, col: 1 },
            hasPassed: false,
            blackStones: [{ row: 1, col: 1 }, { row: 2, col: 1 }],
            whiteStones: [{ row: 0, col: 1 }, { row: 1, col: 0 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        var boardAfter = [[-1, WHITE, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        expectMove(ILLEGAL, BLACK, boardBefore, stateBeforeMove, 0, 0, boardAfter, false, [{ row: 0, col: 1 }, { row: 1, col: 0 }], [{ row: 1, col: 1 }, { row: 2, col: 1 }], 0, 0, BLACK, null, boardBefore);
    });
    it("Outputs correct end game scores", function () {
        var boardBefore = [[-1, WHITE, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: -1, col: -1 },
            hasPassed: true,
            blackStones: [{ row: 1, col: 1 }, { row: 2, col: 1 }],
            whiteStones: [{ row: 0, col: 1 }, { row: 1, col: 0 }],
            whiteScore: 4,
            blackScore: 8,
            previousBoard: previousBoard };
        var boardAfter = [[gameLogic.WHITETERR, WHITE, -1, -1, -1],
            [WHITE, BLACK, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],];
        expectMove(OK, WHITE, boardBefore, stateBeforeMove, -1, -1, boardAfter, true, [{ row: 0, col: 1 }, { row: 1, col: 0 }], [{ row: 1, col: 1 }, { row: 2, col: 1 }], 4, 8, -1, [2, 3], boardBefore);
    });
    it("Trapping BLACK stones work 2", function () {
        var boardBefore = [[BLACK, -1, -1, -1, -1],
            [WHITE, BLACK, WHITE, -1, -1],
            [WHITE, BLACK, WHITE, BLACK, -1],
            [-1, WHITE, BLACK, -1, -1],
            [-1, BLACK, -1, -1, -1],];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 2, col: 3 },
            hasPassed: false,
            blackStones: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 2 }, { row: 4, col: 1 }],
            whiteStones: [{ row: 3, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        var boardAfter = [[-1, WHITE, -1, -1, -1],
            [WHITE, -1, WHITE, -1, -1],
            [WHITE, -1, WHITE, BLACK, -1],
            [-1, WHITE, BLACK, -1, -1],
            [-1, BLACK, -1, -1, -1],];
        expectMove(OK, WHITE, boardBefore, stateBeforeMove, 0, 1, boardAfter, false, [{ row: 3, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }, { row: 0, col: 1 }], [{ row: 1, col: 3 }, { row: 3, col: 2 }, { row: 4, col: 1 }], 3, 0, BLACK, null, boardBefore);
    });
    it("Trapping WHITE stones work 2", function () {
        var boardBefore = [[-1, -1, -1, WHITE, -1],
            [-1, BLACK, WHITE, BLACK, -1],
            [-1, WHITE, BLACK, WHITE, BLACK],
            [-1, -1, BLACK, WHITE, BLACK],
            [-1, -1, -1, -1, WHITE],];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 2, col: 3 },
            hasPassed: false,
            blackStones: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 3, col: 2 }, { row: 3, col: 4 }],
            whiteStones: [{ row: 0, col: 3 }, { row: 1, col: 2 }, { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 4, col: 4 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        var boardAfter = [[-1, -1, -1, WHITE, -1],
            [-1, BLACK, WHITE, BLACK, -1],
            [-1, WHITE, BLACK, -1, BLACK],
            [-1, -1, BLACK, -1, BLACK],
            [-1, -1, -1, BLACK, -1],];
        expectMove(OK, BLACK, boardBefore, stateBeforeMove, 4, 3, boardAfter, false, [{ row: 0, col: 3 }, { row: 1, col: 2 }, { row: 2, col: 1 }], [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 3, col: 2 }, { row: 3, col: 4 }, { row: 4, col: 3 }], 0, 3, WHITE, null, boardBefore);
    });
    it("Trapping BLACK stones work 3", function () {
        var boardBefore = [[-1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1],
            [WHITE, BLACK, WHITE, -1, -1],
            [-1, WHITE, BLACK, BLACK, -1],
            [BLACK, -1, -1, -1, -1],];
        var previousBoard = [];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 3, col: 3 },
            hasPassed: false,
            blackStones: [{ row: 2, col: 1 }, { row: 4, col: 0 }, { row: 3, col: 2 }, { row: 3, col: 3 }],
            whiteStones: [{ row: 2, col: 0 }, { row: 2, col: 2 }, { row: 3, col: 1 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        var boardAfter = [[-1, -1, -1, -1, -1],
            [-1, WHITE, -1, -1, -1],
            [WHITE, -1, WHITE, -1, -1],
            [-1, WHITE, BLACK, BLACK, -1],
            [BLACK, -1, -1, -1, -1],];
        expectMove(OK, WHITE, boardBefore, stateBeforeMove, 1, 1, boardAfter, false, [{ row: 2, col: 0 }, { row: 2, col: 2 }, { row: 3, col: 1 }, { row: 1, col: 1 }], [{ row: 4, col: 0 }, { row: 3, col: 2 }, { row: 3, col: 3 }], 1, 0, BLACK, null, boardBefore);
    });
    it("Testing ko rule works", function () {
        var boardBefore = [
            [BLACK, -1, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [BLACK, WHITE, BLACK, -1, -1],
            [WHITE, -1, WHITE, -1, -1],
            [-1, WHITE, -1, -1, -1],];
        var previousBoard = [
            [BLACK, -1, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [BLACK, -1, BLACK, -1, -1],
            [WHITE, BLACK, WHITE, -1, -1],
            [-1, WHITE, -1, -1, -1],];
        var boardAfter = [
            [BLACK, -1, -1, -1, -1],
            [-1, BLACK, -1, -1, -1],
            [BLACK, WHITE, BLACK, -1, -1],
            [WHITE, -1, WHITE, -1, -1],
            [-1, WHITE, -1, -1, -1],];
        var stateBeforeMove = { board: boardBefore,
            delta: { row: 2, col: 1 },
            hasPassed: false,
            blackStones: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
            whiteStones: [{ row: 2, col: 1 }, { row: 3, col: 0 }, { row: 3, col: 2 }, { row: 4, col: 1 }],
            whiteScore: 0,
            blackScore: 0,
            previousBoard: previousBoard };
        expectMove(ILLEGAL, BLACK, boardBefore, stateBeforeMove, 3, 1, boardAfter, false, [{ row: 2, col: 1 }, { row: 3, col: 0 }, { row: 3, col: 2 }, { row: 4, col: 1 }], [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }], 0, 0, BLACK, null, previousBoard);
    });
    function expectMove(isOk, turnIndexBeforeMove, boardBeforeMove, stateBeforeMove, row, col, boardAfterMove, hasPassed, whiteStones, blackStones, whiteScore, blackScore, turnIndexAfterMove, endMatchScores, previousBoard) {
        var stateTransition = {
            turnIndexBeforeMove: turnIndexBeforeMove,
            stateBeforeMove: stateBeforeMove,
            move: {
                endMatchScores: endMatchScores,
                turnIndexAfterMove: turnIndexAfterMove,
                stateAfterMove: {
                    delta: { row: row, col: col },
                    board: boardAfterMove,
                    hasPassed: hasPassed,
                    whiteScore: whiteScore,
                    blackScore: blackScore,
                    whiteStones: whiteStones,
                    blackStones: blackStones,
                    previousBoard: previousBoard }
            },
            numberOfPlayers: null
        };
        if (isOk) {
            gameLogic.checkMoveOk(stateTransition);
        }
        else {
            // We expect an exception to be thrown :)
            var didThrowException = false;
            try {
                gameLogic.checkMoveOk(stateTransition);
            }
            catch (e) {
                didThrowException = true;
            }
            if (!didThrowException) {
                throw new Error("We expect an illegal move, but checkMoveOk didn't throw any exception!");
            }
        }
    }
});
//# sourceMappingURL=gameLogic_test.js.map