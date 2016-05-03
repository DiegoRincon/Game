var gameLogic;
(function (gameLogic) {
    //TODO: Allow players to determine cells.
    gameLogic.ROWS = 13;
    gameLogic.COLS = 13;
    gameLogic.BLACK = 0;
    gameLogic.WHITE = 1;
    gameLogic.BLACKTERR = 2;
    gameLogic.WHITETERR = 3;
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
        var initialBoard = getInitialBoard();
        return { board: initialBoard, delta: null, hasPassed: false,
            whiteScore: 0, blackScore: 0, whiteStones: whiteStones, blackStones: blackStones, previousBoard: initialBoard };
    }
    gameLogic.getInitialState = getInitialState;
    function isSuicide(board, row, col, oppColor, stateBeforeMove) {
        var newBoard = angular.copy(board);
        newBoard[row][col] = (oppColor == gameLogic.WHITE) ? gameLogic.BLACK : gameLogic.WHITE;
        var oppStones = (oppColor == gameLogic.WHITE) ? stateBeforeMove.whiteStones : stateBeforeMove.blackStones;
        var trappedStones = getTrapped(newBoard, oppColor, oppStones);
        if (trappedStones.length > 0) {
            return false;
        }
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (Math.abs(i) === Math.abs(j)) {
                    continue;
                }
                if (row + i < 0 || col + j < 0) {
                    continue;
                }
                if (row + i >= gameLogic.ROWS || col + j >= gameLogic.COLS) {
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
        if (isSuicide(board, row, col, color, stateBeforeMove)) {
            throw new Error("You cannot make a suicide move");
        }
        return true;
    }
    gameLogic.isLegalMove = isLegalMove;
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        // TODO: remove this hacky thing
        // if row == -1 and col == 0 then black resigned
        // if row == 0 and col == -1 then white resigned
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
            return endOfTurnMove(board, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta_1, -1);
        }
        if (row === -1 && col === 0) {
            //black resigned
            var delta_2 = { row: row, col: col };
            return endOfTurnMove(board, true, turnIndexBeforeMove, stateBeforeMove, delta_2, gameLogic.BLACK);
        }
        if (row === 0 && col === -1) {
            //white resigned
            var delta_3 = { row: row, col: col };
            return endOfTurnMove(board, true, turnIndexBeforeMove, stateBeforeMove, delta_3, gameLogic.WHITE);
        }
        if (!isLegalMove(stateBeforeMove, row, col, turnIndexBeforeMove)) {
            throw Error("Not a legal move!");
        }
        // At this point everything looks good, compute scores and move on
        var boardAfterMove = angular.copy(board);
        boardAfterMove[row][col] = turnIndexBeforeMove;
        // if (!checkKoRule(boardAfterMove, stateBeforeMove.previousBoard)) {
        //     throw Error("Cannot go back to a previous board!")
        // }
        var delta = { row: row, col: col };
        return endOfTurnMove(boardAfterMove, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta, -1);
    }
    gameLogic.createMove = createMove;
    function checkKoRule(boardAfter, boardBefore) {
        if (boardAfter === null || boardBefore === null) {
            return true;
        }
        if (angular.equals(boardAfter, boardBefore)) {
            return false;
        }
        return true;
    }
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
    function endOfTurnMove(boardAfterMove, gameEnded, turnIndexBeforeMove, stateBeforeMove, delta, resigned) {
        var newWhiteScore = stateBeforeMove.whiteScore;
        var newBlackScore = stateBeforeMove.blackScore;
        var hasPassed = false;
        if (delta.row === -1 && delta.col === -1) {
            hasPassed = true;
        }
        var newWhiteStones = angular.copy(stateBeforeMove.whiteStones);
        var newBlackStones = angular.copy(stateBeforeMove.blackStones);
        if (!hasPassed) {
            newWhiteStones = (turnIndexBeforeMove === gameLogic.WHITE) ? newWhiteStones.concat({ row: delta.row, col: delta.col }) : newWhiteStones;
            newBlackStones = (turnIndexBeforeMove === gameLogic.BLACK) ? newBlackStones.concat({ row: delta.row, col: delta.col }) : newBlackStones;
        }
        if (!hasPassed && turnIndexBeforeMove === gameLogic.WHITE) {
            var trappedStones = getTrapped(boardAfterMove, gameLogic.BLACK, stateBeforeMove.blackStones);
            removeTrappedStonesBoard(trappedStones, boardAfterMove);
            removeTrappedStones(trappedStones, newBlackStones);
            var newStones = (trappedStones) ? trappedStones.length : 0;
            //newWhiteScore = getWhiteTerritory(boardAfterMove, newWhiteStones.length);
            newWhiteScore = stateBeforeMove.whiteScore + newStones;
        }
        else if (!hasPassed) {
            var trappedStones = getTrapped(boardAfterMove, gameLogic.WHITE, stateBeforeMove.whiteStones);
            removeTrappedStonesBoard(trappedStones, boardAfterMove);
            removeTrappedStones(trappedStones, newWhiteStones);
            var newStones = (trappedStones) ? trappedStones.length : 0;
            //newBlackScore = getBlackTerritory(boardAfterMove, newBlackStones.length);
            newBlackScore = stateBeforeMove.blackScore + newStones;
        }
        if (!hasPassed) {
            if (!checkKoRule(boardAfterMove, stateBeforeMove.previousBoard)) {
                throw Error("Cannot go back to a previous board!");
            }
        }
        else {
            newWhiteScore = stateBeforeMove.whiteScore;
            newBlackScore = stateBeforeMove.blackScore;
        }
        var endMatchScores;
        var turnIndexAfterMove;
        if (gameEnded) {
            if (resigned === gameLogic.BLACK) {
                endMatchScores = [0, 1];
                boardAfterMove = placeTerritories(boardAfterMove);
                turnIndexAfterMove = -1;
            }
            else if (resigned === gameLogic.WHITE) {
                endMatchScores = [1, 0];
                boardAfterMove = placeTerritories(boardAfterMove);
                turnIndexAfterMove = -1;
            }
            else {
                var finalWhiteScore = getWhiteTerritory(boardAfterMove, newWhiteStones.length);
                var finalBlackScore = getBlackTerritory(boardAfterMove, newBlackStones.length);
                endMatchScores = [finalBlackScore, finalWhiteScore];
                boardAfterMove = placeTerritories(boardAfterMove);
                turnIndexAfterMove = -1;
            }
        }
        else {
            endMatchScores = null;
            turnIndexAfterMove = (turnIndexBeforeMove == gameLogic.WHITE) ? gameLogic.BLACK : gameLogic.WHITE;
        }
        var stateAfterMove = {
            delta: delta,
            board: boardAfterMove,
            hasPassed: hasPassed,
            whiteScore: newWhiteScore,
            blackScore: newBlackScore,
            whiteStones: newWhiteStones,
            blackStones: newBlackStones,
            previousBoard: stateBeforeMove.board };
        return { endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove };
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
    function getTerritory(board, color) {
        var seen = [];
        var territory = [];
        var score = 0;
        for (var row = 0; row < gameLogic.ROWS; row++) {
            for (var col = 0; col < gameLogic.COLS; col++) {
                if (board[row][col] !== -1) {
                    continue;
                }
                var stone = { row: row, col: col };
                if (isStoneInArray(stone, seen)) {
                    continue;
                }
                var connected = [];
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
    function placeTerritories(board) {
        var whiteTerr = getTerritory(board, gameLogic.WHITE);
        var blackTerr = getTerritory(board, gameLogic.BLACK);
        var newBoard = angular.copy(board);
        for (var i = 0; i < whiteTerr.length; i++) {
            var stone = whiteTerr[i];
            newBoard[stone.row][stone.col] = gameLogic.WHITETERR;
        }
        for (var i = 0; i < blackTerr.length; i++) {
            var stone = blackTerr[i];
            newBoard[stone.row][stone.col] = gameLogic.BLACKTERR;
        }
        return newBoard;
    }
    function getWhiteTerritory(board, numWhiteStones) {
        return getTerritory(board, gameLogic.WHITE).length + numWhiteStones;
    }
    gameLogic.getWhiteTerritory = getWhiteTerritory;
    function getBlackTerritory(board, numBlackStones) {
        return getTerritory(board, gameLogic.BLACK).length + numBlackStones;
    }
    gameLogic.getBlackTerritory = getBlackTerritory;
    function getAllConnectedFromStone(stone, board, color, visited) {
        visited.push(stone);
        var x = stone.row;
        var y = stone.col;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (Math.abs(i) === Math.abs(j)) {
                    continue;
                }
                if (x + i < 0 || y + j < 0) {
                    continue;
                }
                if (x + i >= gameLogic.ROWS || y + j >= gameLogic.COLS) {
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
    function areStonesInTerritory(color, stones, board) {
        for (var r = 0; r < stones.length; r++) {
            var stone = stones[r];
            var x = stone.row;
            var y = stone.col;
            for (var i = -1; i < 2; i++) {
                for (var j = -1; j < 2; j++) {
                    if (Math.abs(i) === Math.abs(j)) {
                        continue;
                    }
                    var newRow = x + i;
                    var newCol = y + j;
                    if (newRow < 0 || newCol < 0) {
                        continue;
                    }
                    if (newRow >= gameLogic.ROWS || newCol >= gameLogic.COLS) {
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
    function stonesHaveExit(stones, board) {
        for (var s = 0; s < stones.length; s++) {
            var stone = stones[s];
            var x = stone.row;
            var y = stone.col;
            for (var i = -1; i < 2; i++) {
                for (var j = -1; j < 2; j++) {
                    if (Math.abs(i) === Math.abs(j)) {
                        continue;
                    }
                    var r = x + i;
                    var c = y + j;
                    if (r < 0 || c < 0) {
                        continue;
                    }
                    if (r >= gameLogic.ROWS || c >= gameLogic.COLS) {
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
;
;
var game;
(function (game) {
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console:
    // game.state
    game.animationEnded = false;
    game.canMakeMove = false;
    game.isComputerTurn = false;
    game.move = null;
    game.state = null;
    game.isHelpModalShown = false;
    game.boardSize = gameLogic.ROWS;
    //export let boardSizeSet = true;
    game.hasKomi = false;
    game.KOMI = 6.5;
    function init() {
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'RULES_OF_GO' is " + translate('RULES_OF_GO'));
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            checkMoveOk: gameLogic.checkMoveOk,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
        setTimeout(animationEndedCallback, 1000);
        var w = window;
        if (w["HTMLInspector"]) {
            setInterval(function () {
                w["HTMLInspector"].inspect({
                    excludeRules: ["unused-classes", "script-placement"],
                });
            }, 3000);
        }
    }
    game.init = init;
    function getWinner() {
        if (getFinalBlackScore() > getFinalWhiteScore()) {
            return "Black";
        }
        return "White";
    }
    game.getWinner = getWinner;
    function getWhiteScore() {
        return game.state.whiteScore;
    }
    game.getWhiteScore = getWhiteScore;
    function getBlackScore() {
        return game.state.blackScore;
    }
    game.getBlackScore = getBlackScore;
    function isGameOngoing() {
        return game.move.turnIndexAfterMove !== -1;
    }
    game.isGameOngoing = isGameOngoing;
    function isGameOver() {
        return game.move.turnIndexAfterMove === -1;
    }
    game.isGameOver = isGameOver;
    function getFinalWhiteScore() {
        return game.move.endMatchScores[gameLogic.WHITE] + ((game.hasKomi) ? game.KOMI : 0);
    }
    game.getFinalWhiteScore = getFinalWhiteScore;
    function getFinalBlackScore() {
        return game.move.endMatchScores[gameLogic.BLACK];
    }
    game.getFinalBlackScore = getFinalBlackScore;
    function getTranslations() {
        return {
            RULES_OF_GO: {
                en: "Rules of Go",
                es: "חוקי המשחק",
            },
            RULES_SLIDE1: {
                en: "Black makes the first move, after which White and Black alternate. You can only place one stone per turn. A player can pass their turn at any time.",
                es: "Negro juega primero; después ambos jugadores juegan alternadamente. Solamente se permite poner una piedra por turno. Un jugador puede pasar su turno en cualquier momento."
            },
            RULES_SLIDE2: {
                en: "A stone or solidly connected group of stones of one color is captured and removed from the board when all the intersections directly adjacent to it are occupied by the enemy.",
                es: "Una piedra o un grupo de piedras connectadas de un color son capturadas y removidas del tabero cuando todas as intersecciones directamente adjacentes son ocupadas por piedras enemigas."
            },
            RULES_SLIDE3: {
                en: "No stone may be played so as to recreate a former board state. Two consecutive passes end the game.",
                es: "Ninguna piedra puede ser jugada de tal manera que repita un previo tablero. Cuando los dos jugadores pasan su turno el juego termina.",
            },
            RULES_SLIDE4: {
                en: "A player's territory consists of all the points the player has either occupied or surrounded. The player with more territory wins the game.",
                es: "El territorio de un jugador consiste en todos los puntos que esten ocupados o rodeados. El jugador con más territorio gana el juego.",
            },
            CLOSE: {
                en: "Close",
                es: "Cerrar"
            },
        };
    }
    function animationEndedCallback() {
        if (game.animationEnded)
            return;
        $rootScope.$apply(function () {
            log.info("Animation ended");
            game.animationEnded = true;
            sendComputerMove();
        });
    }
    function sendComputerMove() {
        if (!game.isComputerTurn) {
            return;
        }
        game.isComputerTurn = false; // to make sure the computer can only move once.
        var stone = aiService.randomMove(game.move.stateAfterMove.board);
        var validMove = confirmMove(stone);
        while (!validMove) {
            stone = aiService.randomMove(game.move.stateAfterMove.board);
            validMove = confirmMove(stone);
        }
        moveService.makeMove(validMove);
        // moveService.makeMove(aiService.findComputerMove(move));
    }
    function confirmMove(stone) {
        try {
            var nextMove = gameLogic.createMove(game.state, stone.row, stone.col, game.move.turnIndexAfterMove);
            return nextMove;
        }
        catch (e) {
            return null;
        }
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.animationEnded = false;
        game.move = params.move;
        game.state = game.move.stateAfterMove;
        if (!game.state) {
            game.state = gameLogic.getInitialState();
        }
        game.canMakeMove = game.move.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === game.move.turnIndexAfterMove; // it's my turn
        // Is it the computer's turn?
        game.isComputerTurn = game.canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (game.isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            game.canMakeMove = false;
            if (!game.state.delta) {
                sendComputerMove();
            }
            //If player passed
            if (game.state.delta.col == -1 && game.state.delta.row == -1) {
                sendComputerMove();
            }
        }
    }
    function getNumber(num) {
        var array = [];
        for (var i = 0; i < num; i++) {
            array.push(i);
        }
        return array;
    }
    game.getNumber = getNumber;
    function cellClicked(row, col) {
        log.info("Clicked on cell:", row, col);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!game.canMakeMove) {
            return;
        }
        try {
            var nextMove = gameLogic.createMove(game.state, row, col, game.move.turnIndexAfterMove);
            game.canMakeMove = false; // to prevent making another move
            moveService.makeMove(nextMove);
        }
        catch (e) {
            log.info(["That was an illegal move:", row, col]);
            return;
        }
    }
    game.cellClicked = cellClicked;
    function shouldShowImage(row, col) {
        if (!game.state.board) {
            return false;
        }
        var cell = game.state.board[row][col];
        return cell !== -1;
    }
    game.shouldShowImage = shouldShowImage;
    function getTurn() {
        if (game.move.turnIndexAfterMove === gameLogic.BLACK) {
            return "Black";
        }
        else {
            return "White";
        }
    }
    game.getTurn = getTurn;
    function resign(player) {
        // if row == -1 and col == 0 then black resigned
        // if row == 0 and col == -1 then white resigned
        if (player === "Black") {
            return cellClicked(-1, 0);
        }
        else if (player === "White") {
            return cellClicked(0, -1);
        }
        throw Error("Resign function didn't get a valid parameter");
    }
    game.resign = resign;
    function restartGame() {
        init();
        document.getElementById("boardSize").style.display = "block";
        document.getElementById("container").style.display = "none";
        return;
    }
    game.restartGame = restartGame;
    function isPieceWhite(row, col) {
        return game.state.board[row][col] === gameLogic.WHITE;
    }
    game.isPieceWhite = isPieceWhite;
    function isPieceBlack(row, col) {
        return game.state.board[row][col] === gameLogic.BLACK;
    }
    game.isPieceBlack = isPieceBlack;
    function isPieceWhiteTerritory(row, col) {
        return game.state.board[row][col] === gameLogic.WHITETERR;
    }
    game.isPieceWhiteTerritory = isPieceWhiteTerritory;
    function isPieceBlackTerritory(row, col) {
        return game.state.board[row][col] === gameLogic.BLACKTERR;
    }
    game.isPieceBlackTerritory = isPieceBlackTerritory;
    function shouldSlowlyAppear(row, col) {
        return !game.animationEnded &&
            game.state.delta &&
            game.state.delta.row === row && game.state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function clickedOnModal(evt) {
        if (evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            game.isHelpModalShown = false;
        }
        return true;
    }
    game.clickedOnModal = clickedOnModal;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    game.init();
});
//# sourceMappingURL=game.js.map
;
var aiService;
(function (aiService) {
    function randomMove(board) {
        var row = Math.floor(Math.random() * gameLogic.ROWS);
        var col = Math.floor(Math.random() * gameLogic.COLS);
        while (board[row][col] !== -1) {
            row = Math.floor(Math.random() * gameLogic.ROWS);
            col = Math.floor(Math.random() * gameLogic.COLS);
        }
        return { row: row, col: col };
    }
    aiService.randomMove = randomMove;
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(move) {
        return;
        // return createComputerMove(move,
        //     // at most 1 second for the AI to choose a move (but might be much quicker)
        //     {millisecondsLimit: 1000});
    }
    aiService.findComputerMove = findComputerMove;
    /**
     * Returns all the possible moves for the given state and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
     */
    function getPossibleMoves(state, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                try {
                    possibleMoves.push(gameLogic.createMove(state, i, j, turnIndexBeforeMove));
                }
                catch (e) {
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given state.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(move, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        return alphaBetaService.alphaBetaDecision(move, move.turnIndexAfterMove, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move, playerIndex) {
        var endMatchScores = move.endMatchScores;
        if (endMatchScores) {
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        return getPossibleMoves(move.stateAfterMove, playerIndex);
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map