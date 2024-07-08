"use strict";
self["webpackHotUpdatetestProject"]("testProject",{

/***/ "./src/views/game.ts":
/*!***************************!*\
  !*** ./src/views/game.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SlotMachine: () => (/* binding */ SlotMachine)
/* harmony export */ });
/* harmony import */ var pixi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.mjs");
/* harmony import */ var _gp_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @gp/utils */ "./node_modules/@gp/utils/lib/esm/index.js");
/* harmony import */ var _animationData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./animationData */ "./src/views/animationData.ts");
/* provided dependency */ var console = __webpack_require__(/*! ./node_modules/console-browserify/index.js */ "./node_modules/console-browserify/index.js");



const NUM_ROWS = 3;
const EXTRA_ROWS = 2;
const TOTAL_ROWS = NUM_ROWS + EXTRA_ROWS;
const NUM_COLS = 5;
const SYMBOL_SIZE = 100;
const ROLL_TIME = 3000;
const SPEED = 4;
const START_X = 160;
const START_Y = 50;
const DELAY_BETWEEN_REELS = 75;
const IMAGES = [
    'https://i.imgur.com/ysGjQFD.png',
    'https://i.imgur.com/JtCnRw4.png',
    'https://i.imgur.com/HfBoYMx.png',
    'https://i.imgur.com/dCWn3MZ.png',
    'https://i.imgur.com/lBSpyKv.png',
    'https://i.imgur.com/Al5vKBJ.png',
    'https://i.imgur.com/BcQ5p5r.png',
    'https://i.imgur.com/4S1VG1b.png',
    'https://i.imgur.com/QCI1pD8.png',
    'https://i.imgur.com/O9RBxx1.png',
];
const FOREGROUND = 'https://i.imgur.com/poKS2IL.png';
class SlotMachine {
    constructor() {
        this.tickEventHandler = (0,_gp_utils__WEBPACK_IMPORTED_MODULE_1__.createTickEventHandler)();
        this.symbols = [];
        this.lastTime = Date.now();
        this.reels = [];
        this.result = [];
        this.currentRows = Array(NUM_COLS).fill(-1);
        this.endResult = Array(NUM_COLS).fill(false);
        this.rolling = false;
        this.reelsRolling = Array(NUM_COLS).fill(false);
        this.reelRandomness = Array(NUM_COLS).fill(-1);
        this.app = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Application({
            background: '#1099bb',
            width: 800,
            height: 600,
        });
        document.body.appendChild(this.app.view);
        for (let i = 0; i < IMAGES.length; i++) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = IMAGES[i];
            this.symbols.push(pixi_js__WEBPACK_IMPORTED_MODULE_0__.Texture.from(img));
        }
        const start = document.getElementById('start');
        start.addEventListener('click', () => {
            if (!this.rolling) {
                this.startRoll();
            }
        });
    }
    init() {
        this.createReels();
        this.setReels(true);
        _gp_utils__WEBPACK_IMPORTED_MODULE_1__.animationUpdater.init(this.tickEventHandler);
    }
    update() {
        const updater = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            this.tickEventHandler.updateEvents(deltaTime * 0.001);
            requestAnimationFrame(updater);
        };
        updater();
    }
    createReels() {
        for (let col = 0; col < NUM_COLS; col++) {
            const reel = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Container();
            reel.x = START_X + (col * SYMBOL_SIZE + col * 20);
            reel.y = SYMBOL_SIZE * 0.5;
            this.app.stage.addChild(reel);
            this.reels.push(reel);
            for (let row = 0; row < TOTAL_ROWS; row++) {
                const symbolIndex = this.rand(0, IMAGES.length - 1);
                const symbol = new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Sprite(this.symbols[symbolIndex]);
                symbol.anchor.set(0.5);
                symbol.y = START_Y + (row * SYMBOL_SIZE);
                reel.addChild(symbol);
            }
        }
        this.app.stage.addChild(new pixi_js__WEBPACK_IMPORTED_MODULE_0__.Sprite(pixi_js__WEBPACK_IMPORTED_MODULE_0__.Texture.from(FOREGROUND)));
    }
    startRolling() {
        this.currentRows = Array(NUM_COLS).fill(-1);
        this.endResult = Array(NUM_COLS).fill(false);
        this.rolling = true;
        this.result = Array.from({ length: NUM_COLS }, () => Array.from({ length: TOTAL_ROWS }, () => this.rand(0, IMAGES.length - 1)));
        console.log("Result:", this.result);
        const startTime = Date.now();
        let finishing = false;
        const rollUpdater = () => {
            const elapsed = Date.now() - startTime;
            if (this.rolling) {
                this.reelsRolling.forEach((item, index) => {
                    if (item) {
                        this.updateReel(index);
                    }
                    if (!item && this.endResult[index]) {
                        this.setReel(index);
                        this.stopReel(index);
                        this.endResult[index] = false;
                        if (index === this.reels.length - 1) {
                            this.rolling = false;
                        }
                    }
                });
                requestAnimationFrame(rollUpdater);
                if (elapsed >= ROLL_TIME && !finishing) {
                    finishing = true;
                    this.stopRoll();
                }
            }
        };
        rollUpdater();
    }
    startRoll() {
        this.reelsRolling = Array(NUM_COLS).fill(false);
        let delay = 0;
        this.startRolling();
        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.startReel(i);
            }, delay);
            delay += DELAY_BETWEEN_REELS;
        }
    }
    startReel(col) {
        const reel = this.reels[col];
        (0,_animationData__WEBPACK_IMPORTED_MODULE_2__.tweenInOutReel)(true, (data) => {
            reel.y = data.y;
        }, () => {
            this.reelsRolling[col] = true;
        });
    }
    stopRoll() {
        let delay = 0;
        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.endResult[i] = true;
            }, delay);
            delay += DELAY_BETWEEN_REELS;
        }
    }
    stopReel(col) {
        const reel = this.reels[col];
        (0,_animationData__WEBPACK_IMPORTED_MODULE_2__.tweenInOutReel)(false, (data) => {
            reel.y = data.y;
        }, () => {
            if (col === this.reels.length - 1) {
                this.rolling = false;
            }
        });
    }
    updateReel(col) {
        this.reels[col].children.forEach((element, row) => {
            const symbol = element;
            symbol.y += ((SYMBOL_SIZE / 10) * SPEED);
            if (symbol.y >= START_Y + (TOTAL_ROWS * SYMBOL_SIZE)) {
                symbol.y = START_Y;
                if (!this.endResult[col]) {
                    symbol.texture = this.symbols[this.getRandomSymbol(col)];
                }
                else {
                    if (this.currentRows[col] < 0) {
                        this.currentRows[col] = TOTAL_ROWS - 1;
                    }
                    symbol.texture = this.symbols[this.result[col][this.currentRows[col]]];
                    if (this.currentRows[col] >= 0) {
                        this.currentRows[col]--;
                        if (this.currentRows[col] < 0) {
                            this.reelsRolling[col] = false;
                            return;
                        }
                    }
                }
            }
        });
    }
    getRandomSymbol(col) {
        let symbolIndex = -1;
        do {
            symbolIndex = this.rand(0, IMAGES.length - 1);
        } while (this.reelRandomness[col] === symbolIndex);
        this.reelRandomness[col] = symbolIndex;
        return symbolIndex;
    }
    updateReels() {
        for (let i = 0; i < this.reels.length; i++) {
            this.updateReel(i);
        }
    }
    setReels(randomSymbol = false) {
        for (let col = 0; col < this.reels.length; col++) {
            this.setReel(col, randomSymbol);
        }
    }
    setReel(column, randomSymbol = false) {
        this.reels[column].children.forEach((element, row) => {
            const symbol = element;
            symbol.y = START_Y + (row * SYMBOL_SIZE);
            if (randomSymbol) {
                const symbolIndex = this.rand(0, IMAGES.length - 1);
                symbol.texture = this.symbols[symbolIndex];
            }
        });
    }
    rand(min, max) {
        return (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) % (max - min + 1)) + min;
    }
}


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("1e073964d3c6f6a8fd4a")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=hot-update.js.map