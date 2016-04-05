interface SupportedLanguages { en: string, es: string};
interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console:
  // game.state
  export let animationEnded = false;
  export let canMakeMove = false;
  export let isComputerTurn = false;
  export let move: IMove = null;
  export let state: IState = null;
  export let isHelpModalShown: boolean = false;
  export let boardSize = 13;
  export let boardSizeSet = false;
  export let hasKomi:boolean = false;
  export let KOMI = 6.5;(boardSize === 19) ? 6.5 : (boardSize === 13) ? 7.5 : 8.5;

  export function init() {
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

    let w: any = window;
    if (w["HTMLInspector"]) {
      setInterval(function () {
        w["HTMLInspector"].inspect({
          excludeRules: ["unused-classes", "script-placement"],
        });
      }, 3000);
    }
  }
  
  export function getWinner(): string {
      if (getFinalBlackScore() > getFinalWhiteScore()) {
          return "Black";
      }
      return "White";
  }
  
  export function getWhiteScore(): number {
      return state.whiteScore;
  }
  
  export function getBlackScore(): number {
      return state.blackScore;
  }
  
  export function isGameOngoing(): boolean {
      return move.turnIndexAfterMove !== -1;
  }
  
  export function isGameOver(): boolean {
      return move.turnIndexAfterMove === -1;
  }
  
  export function getFinalWhiteScore(): number {
      return move.endMatchScores[gameLogic.WHITE] + ((hasKomi) ? KOMI : 0);
  }
  
  export function getFinalBlackScore(): number {
      return move.endMatchScores[gameLogic.BLACK];
  }
  
  function getTranslations(): Translations {
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
      CLOSE:  {
        en: "Close",
        es: "Cerrar"
      },
    };
  }

  function animationEndedCallback() {
    if (animationEnded) return;
    $rootScope.$apply(function () {
      log.info("Animation ended");
      animationEnded = true;
      sendComputerMove();
    });
  }

  function sendComputerMove() {
    if (!isComputerTurn) {
      return;
    }
    isComputerTurn = false; // to make sure the computer can only move once.
    let stone: Stone = aiService.randomMove(move.stateAfterMove.board);
    let validMove = confirmMove(stone);
    while (!validMove) {
        stone = aiService.randomMove(move.stateAfterMove.board);
        validMove = confirmMove(stone);        
    }
    moveService.makeMove(validMove);
    // moveService.makeMove(aiService.findComputerMove(move));
  }
  
  function confirmMove(stone: Stone): IMove {
      try {
        let nextMove: IMove = gameLogic.createMove(state, stone.row, stone.col, move.turnIndexAfterMove);
        return nextMove;
    } catch (e) {
        return null;
    }
  }

  function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    animationEnded = false;
    move = params.move;
    state = move.stateAfterMove;
    if (!state) {
      state = gameLogic.getInitialState();
    }
    canMakeMove = move.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === move.turnIndexAfterMove; // it's my turn

    // Is it the computer's turn?
    isComputerTurn = canMakeMove &&
        params.playersInfo[params.yourPlayerIndex].playerId === '';
    if (isComputerTurn) {
      // To make sure the player won't click something and send a move instead of the computer sending a move.
      canMakeMove = false;
      if (!state.delta) {
          sendComputerMove();
      }
      //sendComputerMove();
    }
  }
  
  export function getNumber(num: number): number[] {
      let array: number[] = [];
      for (let i=0; i<num; i++) {
          array.push(i);
      }
      return array;
  }

  export function cellClicked(row: number, col: number): void {
    log.info("Clicked on cell:", row, col);
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!canMakeMove) {
      return;
    }
    try {
      let nextMove = gameLogic.createMove(
          state, row, col, move.turnIndexAfterMove);
      canMakeMove = false; // to prevent making another move
      moveService.makeMove(nextMove);
    } catch (e) {
      log.info(["That was an illegal move:", row, col]);
      return;
    }
  }

  export function shouldShowImage(row: number, col: number): boolean {
    let cell = state.board[row][col];
    return cell !== -1;
  }
  
  export function getTurn(): string {
      if (move.turnIndexAfterMove === gameLogic.BLACK) {
          return "Black";
      } else {
          return "White";
      }
  }
  
  export function isBoardSizeSet() {
      return boardSizeSet;
  }
  
  export function setBoardSize(num: number): void {
      if (num !== 13 && num !== 19 && num !== 9) {
          throw Error("Invalid board size");
      }
      gameLogic.ROWS = num;
      gameLogic.COLS = num;
      state = gameLogic.getInitialState();
      boardSize = num;
      KOMI = (boardSize === 19) ? 6.5 : (boardSize === 13) ? 7.5 : 8.5;
      boardSizeSet = true;
      return
  }
    
  export function resign(player : string): void {
    // if row == -1 and col == 0 then black resigned
    // if row == 0 and col == -1 then white resigned
    if (player === "Black") {
        return cellClicked(-1, 0);
    } else if (player === "White") {
        return cellClicked(0, -1);
    }
    throw Error("Resign function didn't get a valid parameter");
    
  }
  
  export function restartGame(): void {
      init();
      document.getElementById("boardSize").style.display = "block";
      document.getElementById("container").style.display = "none";
      return
  }

  export function isPieceWhite(row: number, col: number): boolean {
    return state.board[row][col] === gameLogic.WHITE;
  }

  export function isPieceBlack(row: number, col: number): boolean {
    return state.board[row][col] === gameLogic.BLACK;
  }
  
  export function isPieceWhiteTerritory(row: number, col: number): boolean {
    return state.board[row][col] === gameLogic.WHITETERR;
  }
  
  export function isPieceBlackTerritory(row: number, col: number): boolean {
    return state.board[row][col] === gameLogic.BLACKTERR;
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return !animationEnded &&
        state.delta &&
        state.delta.row === row && state.delta.col === col;
  }

  export function clickedOnModal(evt: Event) {
    if (evt.target === evt.currentTarget) {
      evt.preventDefault();
      evt.stopPropagation();
      isHelpModalShown = false;
    }
    return true;
  }
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
    $rootScope['game'] = game;
    game.init();
  });
