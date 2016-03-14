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
    function init() {
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'RULES_OF_TICTACTOE' is " + translate('RULES_OF_TICTACTOE'));
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
        return game.move.endMatchScores[gameLogic.WHITE];
    }
    game.getFinalWhiteScore = getFinalWhiteScore;
    function getFinalBlackScore() {
        return game.move.endMatchScores[gameLogic.BLACK];
    }
    game.getFinalBlackScore = getFinalBlackScore;
    function getTranslations() {
        return {
            RULES_OF_TICTACTOE: {
                en: "Rules of Go",
                iw: "חוקי המשחק",
            },
            RULES_SLIDE1: {
                en: "Black makes the first move, after which White and Black alternate. You can only place one stone per turn. A player can pass their turn at any time.",
                iw: "אתה והיריב מסמנים איקס או עיגול כל תור",
            },
            RULES_SLIDE2: {
                en: "A stone or solidly connected group of stones of one color is captured and removed from the board when all the intersections directly adjacent to it are occupied by the enemy.",
                iw: "הראשון שמסמן שורה, עמודה או אלכסון מנצח",
            },
            RULES_SLIDE3: {
                en: "No stone may be played so as to recreate a former board state. Two consecutive passes end the game. ",
                iw: "",
            },
            CLOSE: {
                en: "Close",
                iw: "סגור",
            },
        };
    }
    function animationEndedCallback() {
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
        moveService.makeMove(aiService.findComputerMove(game.move));
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
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!game.state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
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
    function isPieceWhite(row, col) {
        return game.state.board[row][col] === gameLogic.WHITE;
    }
    game.isPieceWhite = isPieceWhite;
    function isPieceBlack(row, col) {
        return game.state.board[row][col] === gameLogic.BLACK;
    }
    game.isPieceBlack = isPieceBlack;
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