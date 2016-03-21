function expectEmptyBrowserLogs() {
    browser.manage().logs().get('browser').then(function (browserLog) {
        // See if there are any errors (warnings are ok)
        var hasErrors = false;
        for (var _i = 0; _i < browserLog.length; _i++) {
            var log_1 = browserLog[_i];
            var level = log_1.level.name;
            if (level === 'INFO' || level === 'WARNING')
                continue; // (warnings are ok)
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
var lastTest;
var JasmineOverrides;
(function (JasmineOverrides) {
    var jasmineAny = jasmine;
    var executeMock = jasmineAny.Spec.prototype.execute;
    var jasmineSpec = jasmineAny.Spec;
    jasmineSpec.prototype.execute = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        lastTest = this.result;
        executeMock.apply(this, args);
    };
    // Pause for expect failures
    var originalAddExpectationResult = jasmineSpec.prototype.addExpectationResult;
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
    protractor.promise.controlFlow().on('uncaughtException', function (e) {
        console.error('Unhandled error: ' + e);
        browser.pause();
    });
})(JasmineOverrides || (JasmineOverrides = {}));
describe('Go', function () {
    var gameLogic = require('./gameLogic.js');
    browser.driver.manage().window().setSize(400, 600);
    browser.driver.manage().window().setPosition(10, 10);
    var BLACK = gameLogic.BLACK;
    var WHITE = gameLogic.WHITE;
    var checkNoErrorInLogsIntervalId = null;
    beforeEach(function () {
        console.log('\n\n\nRunning test: ', lastTest.fullName);
        checkNoErrorInLogsIntervalId = setInterval(expectEmptyBrowserLogs, 100);
        getPage('');
        element(by.id('9x9')).click();
    });
    afterEach(function () {
        expectEmptyBrowserLogs();
        clearInterval(checkNoErrorInLogsIntervalId);
    });
    function getPage(page) {
        browser.get('/dist/index.min.html?' + page);
    }
    function expectPieceKindDisplayed(row, col, pieceKind, isDisplayed) {
        var selector = by.id('e2e_test_piece' + pieceKind + '_' + row + 'x' + col);
        // Careful when using animations and asserting isDisplayed:
        // Originally, my animation started from {opacity: 0;}
        // And then the image wasn't displayed.
        // I changed it to start from {opacity: 0.1;}
        if (isDisplayed) {
            expect(element(selector).isDisplayed()).toEqual(true);
        }
        else {
            expect(element(selector).isPresent()).toEqual(false);
        }
    }
    function expectPiece(row, col, expectedPieceKind) {
        expectPieceKindDisplayed(row, col, 'White', expectedPieceKind === gameLogic.WHITE);
        expectPieceKindDisplayed(row, col, 'Black', expectedPieceKind === gameLogic.BLACK);
        expectPieceKindDisplayed(row, col, 'BlackTerr', expectedPieceKind === gameLogic.BLACKTERR);
        expectPieceKindDisplayed(row, col, 'WhiteTerr', expectedPieceKind === gameLogic.WHITETERR);
    }
    function expectBoard(board) {
        // Careful: one can't use gameLogic.ROWS/COLS (instead of 3) because gameLogic is not defined
        // in end-to-end tests.
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                expectPiece(row, col, board[row][col]);
            }
        }
    }
    function clickDivAndExpectPiece(row, col, expectedPieceKind) {
        element(by.id('e2e_test_div_' + row + 'x' + col)).click();
        expectPiece(row, col, expectedPieceKind);
    }
    it('should have a title', function () {
        expect(browser.getTitle()).toEqual('Go');
    });
    it('should have an empty TicTacToe board', function () {
        expectBoard([[-1, -1, -1, -1, -1, -1, -1, -1, -1],
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
        clickDivAndExpectPiece(0, 0, BLACK);
        expectBoard([[BLACK, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1],]);
    });
    //   it('should ignore clicking on a non-empty cell', function () {
    //     clickDivAndExpectPiece(0, 0, BLACK);
    //     clickDivAndExpectPiece(0, 0, BLACK); // clicking on a non-empty cell doesn't do anything.
    //     clickDivAndExpectPiece(1, 1, WHITE);
    //     expectBoard(
    //          [[BLACK, -1, -1, -1, -1],
    //           [-1, WHITE, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1], ]);
    //   });
    //   it('piece should disappear if surrounded', function() {
    //     clickDivAndExpectPiece(0, 0, BLACK);
    //     clickDivAndExpectPiece(1, 0, WHITE);
    //     clickDivAndExpectPiece(1, 1, BLACK);
    //     clickDivAndExpectPiece(0, 1, WHITE);
    //     expectBoard(
    //          [[-1, WHITE, -1, -1, -1],
    //           [WHITE, BLACK, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1], ]);
    //   });
    //   it('pass button should work', function() {
    //     clickDivAndExpectPiece(0, 0, BLACK);
    //     element(by.id('passB')).click();
    //     clickDivAndExpectPiece(1, 0, BLACK);
    //     clickDivAndExpectPiece(0, 1, WHITE);
    //     element(by.id('passB')).click();
    //     clickDivAndExpectPiece(1, 1, WHITE);
    //     expectBoard(
    //          [[BLACK, WHITE, -1, -1, -1],
    //           [BLACK, WHITE, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1], ]);    
    //   });
    //   it('resign button should end game', function() {
    //     clickDivAndExpectPiece(0, 0, BLACK);
    //     clickDivAndExpectPiece(1, 0, WHITE);
    //     clickDivAndExpectPiece(1, 1, BLACK);
    //     clickDivAndExpectPiece(0, 1, WHITE);
    //     expectBoard(
    //          [[-1, WHITE, -1, -1, -1],
    //           [WHITE, BLACK, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1], ]);
    //     element(by.id('resign')).click();
    //     expectBoard(
    //          [[gameLogic.WHITETERR, WHITE, -1, -1, -1],
    //           [WHITE, BLACK, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1], ]);
    //     //this should not have any effect
    //     clickDivAndExpectPiece(2, 1, WHITE);
    //     expectBoard(
    //          [[gameLogic.WHITETERR, WHITE, -1, -1, -1],
    //           [WHITE, BLACK, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1],
    //           [-1, -1, -1, -1, -1], ]);      
    //   });
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
//# sourceMappingURL=end_to_end_tests.js.map