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