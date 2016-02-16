var gameLogic;
(function (gameLogic) {
    //TODO: Allow players to determine cells.
    gameLogic.ROWS = 5;
    gameLogic.COLS = 5;
    gameLogic.BLACK = 0;
    gameLogic.WHITE = 1;
    /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = -1;
            }
        }
        return board;
    }
    //TODO: Add a parameter for handicap
    function getInitialState() {
        var whiteStones = [];
        var blackStones = [];
        return { board: getInitialBoard(), delta: null, hasPassed: false, whiteScore: 0, blackScore: 0, whiteStones: whiteStones, blackStones: blackStones };
    }
    gameLogic.getInitialState = getInitialState;
    /**
     * Returns true if the game ended in a tie because there are no empty cells.
     * E.g., isTie returns true for the following board:
     *     [['X', 'O', 'X'],
     *      ['X', 'O', 'O'],
     *      ['O', 'X', 'X']]
     */
    function isTie(board) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] === -1) {
                    // If there is an empty cell then we do not have a tie.
                    return false;
                }
            }
        }
        // No empty cells, so we have a tie!
        return true;
    }
    /**
     * TODO: IMPLEMENT THIS
     */
    function getWinner(board) {
        return '';
    }
    function isSuicide(board, row, col, oppColor) {
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                if (row + i < 0 || col + j < 0) {
                    continue;
                }
                //oppColor will be the opponent's color
                if (board[row + i][col + j] !== oppColor) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Returns whether the move doesn't break the rules
     */
    function isLegalMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        var board = stateBeforeMove.board;
        //Check if intersection is empty
        if (board[row][col] !== -1) {
            throw new Error("One can only make a move in an empty position!");
        }
        //Make sure you are not suiciding
        var color = (turnIndexBeforeMove === 1) ? 0 : 1;
        if (isSuicide(board, row, col, color)) {
            throw new Error("You cannot make a suicide move");
        }
        return true;
    }
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var board = stateBeforeMove.board;
        var endMatchScores;
        var turnIndexAfterMove;
        /**
         * MAKE SURE THE PLAY ADHERES TO RULES
         */
        var gameEnded;
        if (row === -1 && col === -1) {
            gameEnded = (stateBeforeMove.hasPassed) ? true : false;
            var delta_1 = { row: row, col: col };
            return endOfTurnMove(board, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta_1);
        }
        if (!isLegalMove(stateBeforeMove, row, col, turnIndexBeforeMove)) {
            throw Error("Not a legal move!");
        }
        // At this point everything looks good, compute scores and move on
        var boardAfterMove = angular.copy(board);
        boardAfterMove[row][col] = turnIndexBeforeMove;
        var delta = { row: row, col: col };
        return endOfTurnMove(boardAfterMove, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta);
    }
    gameLogic.createMove = createMove;
    function removeTrappedStonesBoard(trappedStones, board) {
        if (!trappedStones) {
            return;
        }
        for (var i = 0; i < trappedStones.length; i++) {
            var stone = trappedStones[i];
            board[stone.row][stone.col] = -1;
        }
    }
    function removeTrappedStones(trappedStones, stones) {
        if (!trappedStones) {
            return;
        }
        for (var i = 0; i < trappedStones.length; i++) {
            for (var j = 0; j < stones.length; j++) {
                var stone = trappedStones[i];
                if (angular.equals(stone, stones[j])) {
                    stones.splice(j, 1);
                }
            }
        }
    }
    function endOfTurnMove(boardAfterMove, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta) {
        var newWhiteScore = 0;
        var newBlackScore = 0;
        var hasPassed = false;
        if (delta.row === -1 && delta.col === -1) {
            hasPassed = true;
        }
        if (!hasPassed && turnIndexBeforeMove === gameLogic.WHITE) {
            var trappedStones = getTrapped(boardAfterMove, gameLogic.BLACK, stateBeforeMove.blackStones);
            removeTrappedStonesBoard(trappedStones, boardAfterMove);
            removeTrappedStones(trappedStones, stateBeforeMove.blackStones);
            var newStones = (trappedStones) ? trappedStones.length : 0;
            newWhiteScore = stateBeforeMove.whiteScore + newStones;
        }
        else if (!hasPassed) {
            var trappedStones = getTrapped(boardAfterMove, gameLogic.WHITE, stateBeforeMove.whiteStones);
            removeTrappedStonesBoard(trappedStones, boardAfterMove);
            removeTrappedStones(trappedStones, stateBeforeMove.whiteStones);
            var newStones = (trappedStones) ? trappedStones.length : 0;
            newBlackScore = stateBeforeMove.whiteScore + newStones;
        }
        if (hasPassed) {
            newWhiteScore = stateBeforeMove.whiteScore;
            newBlackScore = stateBeforeMove.blackScore;
        }
        var endMatchScores;
        if (gameEnded) {
            endMatchScores = [newBlackScore, newWhiteScore];
        }
        else {
            endMatchScores = null;
        }
        var newWhiteStones = [];
        var newBlackStones = [];
        if (!hasPassed) {
            newWhiteStones = (turnIndexBeforeMove === gameLogic.WHITE) ? stateBeforeMove.whiteStones.concat({ row: delta.row, col: delta.col }) : stateBeforeMove.whiteStones;
            newBlackStones = (turnIndexBeforeMove === gameLogic.BLACK) ? stateBeforeMove.blackStones.concat({ row: delta.row, col: delta.col }) : stateBeforeMove.blackStones;
        }
        else {
            newWhiteStones = stateBeforeMove.whiteStones;
            newBlackStones = stateBeforeMove.blackStones;
        }
        var stateAfterMove = {
            delta: delta,
            board: boardAfterMove,
            hasPassed: hasPassed,
            whiteScore: newWhiteScore,
            blackScore: newBlackScore,
            whiteStones: newWhiteStones,
            blackStones: newBlackStones };
        return { endMatchScores: endMatchScores, turnIndexAfterMove: (turnIndexBeforeMove == gameLogic.WHITE) ? gameLogic.BLACK : gameLogic.WHITE, stateAfterMove: stateAfterMove };
    }
    function getTrapped(board, color, colorStones) {
        var trapped = [];
        var seen = [];
        var connected = getConnected(seen, board, colorStones, color);
        while (connected && connected.length !== 0) {
            //check if connected stones have an exit
            if (stonesHaveExit(connected, board)) {
                seen = seen.concat(connected);
                connected = getConnected(seen, board, colorStones, color);
                continue;
            }
            else {
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
    /**
     * Returns a connected sequence of white stones that are not contained in Seen. Null if none.
     */
    function getConnected(seen, board, stones, color) {
        for (var i = 0; i < stones.length; i++) {
            var stone = stones[i];
            if (isStoneInArray(stone, seen)) {
                continue;
            }
            var stoneArray = [];
            return getAllConnectedFromStone(stone, board, color, stoneArray);
        }
        return null;
    }
    function getAllConnectedFromStone(stone, board, color, visited) {
        visited.push(stone);
        var x = stone.row;
        var y = stone.col;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (Math.abs(i) === Math.abs(j)) {
                    continue;
                }
                if (x + i < 0 || x + j < 0) {
                    continue;
                }
                if (board[x + i][y + j] === color) {
                    var nextStone = { row: x + i, col: y + j };
                    if (isStoneInArray(nextStone, visited)) {
                        continue;
                    }
                    var connected = getAllConnectedFromStone(nextStone, board, color, visited);
                }
            }
        }
        return visited;
    }
    function stonesHaveExit(stones, board) {
        for (var i = 0; i < stones.length; i++) {
            var stone = stones[i];
            var x = stone.row;
            var y = stone.col;
            for (var i_1 = -1; i_1 < 2; i_1++) {
                for (var j = -1; j < 2; j++) {
                    if (Math.abs(i_1) === Math.abs(j)) {
                        continue;
                    }
                    if (x + i_1 < 0 || x + j < 0) {
                        continue;
                    }
                    if (board[x + i_1][y + j] === -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function isStoneInArray(stone, arr) {
        if (!arr) {
            return false;
        }
        for (var i = 0; i < arr.length; i++) {
            var s = arr[i];
            if (angular.equals(s, stone)) {
                return true;
            }
        }
        return false;
    }
    function checkMoveOk(stateTransition) {
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that the move is OK.
        var turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
        var stateBeforeMove = stateTransition.stateBeforeMove;
        var move = stateTransition.move;
        var deltaValue = stateTransition.move.stateAfterMove.delta;
        var row = deltaValue.row;
        var col = deltaValue.col;
        var expectedMove = createMove(stateBeforeMove, row, col, turnIndexBeforeMove);
        if (!angular.equals(move, expectedMove)) {
            throw new Error("Expected move=" + angular.toJson(move, true) +
                ", but got move=" + angular.toJson(expectedMove, true));
        }
    }
    gameLogic.checkMoveOk = checkMoveOk;
    function forSimpleTestHtml() {
        var move = gameLogic.createMove(null, 0, 0, 0);
        log.log("move=", move);
        var params = {
            turnIndexBeforeMove: 0,
            stateBeforeMove: null,
            move: move,
            numberOfPlayers: 2 };
        gameLogic.checkMoveOk(params);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map