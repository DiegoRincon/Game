interface SupportedLanguages { en: string, iw: string};
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

  export function init() {
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
      return move.endMatchScores[gameLogic.WHITE];
  }
  
  export function getFinalBlackScore(): number {
      return move.endMatchScores[gameLogic.BLACK];
  }
  
  function getTranslations(): Translations {
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
      CLOSE:  {
        en: "Close",
        iw: "סגור",
      },
    };
  }

  function animationEndedCallback() {
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
    moveService.makeMove(aiService.findComputerMove(move));
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
      // We calculate the AI move only after the animation finishes,
      // because if we call aiService now
      // then the animation will be paused until the javascript finishes.
      if (!state.delta) {
        // This is the first move in the match, so
        // there is not going to be an animation, so
        // call sendComputerMove() now (can happen in ?onlyAIs mode)
        sendComputerMove();
      }
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
