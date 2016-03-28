// This file has end-to-end tests using protractor, see:
// https://github.com/angular/protractor/blob/master/docs/toc.md 
declare var require: (module: string) => any;

function expectEmptyBrowserLogs() {
  browser.manage().logs().get('browser').then(function(browserLog) {
    // See if there are any errors (warnings are ok)
    let hasErrors = false;
    for (let log of browserLog) {
      let level = log.level.name;
      if (level === 'INFO' || level === 'WARNING') continue; // (warnings are ok)
      hasErrors = true;
    }
    if (hasErrors) {
      // It's better to pause, and look and console, then showing this which creates a lot of clutter:
      console.error("Browser has a warning/error in the logs. Opens the developer console and look at the logs.");
      //console.log('\n\n\nlog: ' + require('util').inspect(browserLog) + "\n\n\n");
      browser.pause();
    }
  });
}

let lastTest: any;
module JasmineOverrides {
  let jasmineAny = (<any>jasmine);
  let executeMock = jasmineAny.Spec.prototype.execute
  let jasmineSpec = jasmineAny.Spec;
  jasmineSpec.prototype.execute = function (...args: any[]) {
      lastTest = this.result;
      executeMock.apply(this, args);
  };
  // Pause for expect failures
  let originalAddExpectationResult = jasmineSpec.prototype.addExpectationResult;
  jasmineSpec.prototype.addExpectationResult = function () {
    if (!arguments[0]) {
      console.error("\n\nFailure in test:\n" + 
          arguments[1].message + "\n" + 
          (arguments[1].error ? " stacktrace=\n\n" + arguments[1].error.stack : '') +
          "\n\n\n" +
          " Failure arguments=" + JSON.stringify(arguments));
      browser.pause();
    }
    return originalAddExpectationResult.apply(this, arguments);
  };
  // Pause on exception
  protractor.promise.controlFlow().on('uncaughtException', function(e: any) {
    console.error('Unhandled error: ' + e);
    browser.pause();
  });
}

describe('Go', function() {
  browser.driver.manage().window().setSize(400, 600);
  browser.driver.manage().window().setPosition(10, 10);
  //DONT CHANGE THIS UNLESS CHANGES IN GAMELOGIC
//   const ROWS:number = 9;
//   const COLS:number = 9;
//   const BLACK:number = 0;
//   const WHITE:number = 1;
//   const BLACKTERR:number = 2;
//   const WHITETERR:number = 3;
  
  let checkNoErrorInLogsIntervalId: number = null;
  beforeEach(()=>{
    console.log('\n\n\nRunning test: ', lastTest.fullName);
    checkNoErrorInLogsIntervalId = setInterval(expectEmptyBrowserLogs, 100);
    getPage('');
    element(by.id('9x9')).click();
  });
  afterEach(()=>{
    expectEmptyBrowserLogs();
    clearInterval(checkNoErrorInLogsIntervalId);
  });
  
  function getPage(page: string) {
    browser.get('/dist/index.min.html?' + page);
  }

  function expectPieceKindDisplayed(row: number, col: number, pieceKind: string, isDisplayed: boolean) {
    let selector = by.id('e2e_test_piece' + pieceKind + '_' + row + 'x' + col);
    // Careful when using animations and asserting isDisplayed:
    // Originally, my animation started from {opacity: 0;}
    // And then the image wasn't displayed.
    // I changed it to start from {opacity: 0.1;}
    if (isDisplayed) {
      expect(element(selector).isDisplayed()).toEqual(true);
    } else {
      expect(element(selector).isPresent()).toEqual(false);
    }
  }

  function expectPiece(row: number, col: number, expectedPieceKind: number) {
    expectPieceKindDisplayed(row, col, 'Black', expectedPieceKind === 0);
    expectPieceKindDisplayed(row, col, 'White', expectedPieceKind === 1);
    expectPieceKindDisplayed(row, col, 'BlackTerr', expectedPieceKind === 2);
    expectPieceKindDisplayed(row, col, 'WhiteTerr', expectedPieceKind === 3);
  }

  function expectBoard(board: Board) {
    // Careful: one can't use gameLogic.ROWS/COLS (instead of 3) because gameLogic is not defined
    // in end-to-end tests.
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        expectPiece(row, col, board[row][col]);
      }
    }
  }

  function clickDivAndExpectPiece(row: number, col: number, expectedPieceKind: number): void {
    element(by.id('e2e_test_div_' + row + 'x' + col)).click();
    console.log("info: ", expectedPieceKind);
    expectPiece(row, col, expectedPieceKind);
  }

  it('should have a title', function () {
    expect(browser.getTitle()).toEqual('Go');
  });

  it('should have an empty TicTacToe board', function () {
    expectBoard(
        [[-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],]);
        
  });

  it('should show Black if I click in 0x0', function () {
    clickDivAndExpectPiece(0, 0, 0);
    expectBoard(
        [[0, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1],]);
  });

  it('should ignore clicking on a non-empty cell', function () {
    clickDivAndExpectPiece(0, 0, 0);
    clickDivAndExpectPiece(0, 0, 1); // clicking on a non-empty cell doesn't do anything.
    clickDivAndExpectPiece(1, 1, 0);
    expectBoard(
         [[0, -1, -1, -1, -1],
          [-1, 1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1]]);
  });
  
  it('piece should disappear if surrounded', function() {
    clickDivAndExpectPiece(0, 0, 0);
    clickDivAndExpectPiece(1, 0, 1);
    clickDivAndExpectPiece(1, 1, 0);
    clickDivAndExpectPiece(0, 1, 1);
    expectBoard(
         [[-1, 1, -1, -1, -1],
          [1, 0, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1], ]);
  });
  
  it('pass button should work', function() {
    clickDivAndExpectPiece(0, 0, 0);
    element(by.id('passB')).click();
    clickDivAndExpectPiece(1, 0, 0);
    clickDivAndExpectPiece(0, 1, 1);
    element(by.id('passB')).click();
    clickDivAndExpectPiece(1, 1, 1);
    expectBoard(
         [[0, 1, -1, -1, -1],
          [0, 1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1], ]);    
  });
  
  it('resign button should end game', function() {
    clickDivAndExpectPiece(0, 0, 0);
    clickDivAndExpectPiece(1, 0, 1);
    clickDivAndExpectPiece(1, 1, 0);
    clickDivAndExpectPiece(0, 1, 1);
    expectBoard(
         [[-1, 1, -1, -1, -1],
          [1, 0, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1], ]);
    element(by.id('resign')).click();
    expectBoard(
         [[3, 1, -1, -1, -1],
          [1, 0, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1], ]);
    //this should not have any effect
    clickDivAndExpectPiece(2, 1, 1);
    expectBoard(
         [[3, 1, -1, -1, -1],
          [1, 0, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1],
          [-1, -1, -1, -1, -1], ]);      
  });

//   it('with playAgainstTheComputer should work', function () {
//     getPage('playAgainstTheComputer');
//     clickDivAndExpectPiece(1, 0, "X");
//     browser.sleep(2000); // wait for AI to make at least one move
//     expectPiece(0, 0, 'O');
//   });

//   it('with onlyAIs should work', function () {
//     getPage('onlyAIs');
//     browser.sleep(2000); // wait for AI to make at least one move
//     expectPiece(0, 0, 'X');
//   });
});
