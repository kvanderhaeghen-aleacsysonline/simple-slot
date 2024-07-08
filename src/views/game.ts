import _ from 'lodash';
import * as PIXI from 'pixi.js';
import { createTickEventHandler, ITickEventHandler, animationUpdater } from "@gp/utils";
import { tweenInOutReel } from './animationData';

const NUM_ROWS: number = 3;
const EXTRA_ROWS: number = 2;
const TOTAL_ROWS: number = NUM_ROWS + EXTRA_ROWS;
const NUM_COLS: number = 5;
const SYMBOL_SIZE: number = 100;
const ROLL_TIME: number = 3000;
const SPEED: number = 4;
const START_X: number = 160;
const START_Y: number = 50;
const DELAY_BETWEEN_REELS: number = 75;

const IMAGES: string[] = [
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

const FOREGROUND: string = 'https://i.imgur.com/poKS2IL.png';

export class SlotMachine {
    private app?: PIXI.Application<HTMLCanvasElement>;
    private tickEventHandler: ITickEventHandler = createTickEventHandler();

    private symbols: PIXI.Texture[] = [];
    private reels: PIXI.Container[];
    private result: number[][];
    private currentRows: number[];
    private endResult: boolean[];
    private rolling: boolean;
    private reelsRolling: boolean[];
    private reelRandomness: number[];

    constructor() {
        this.reels = [];
        this.result = [];
        this.currentRows = Array(NUM_COLS).fill(-1);
        this.endResult = Array(NUM_COLS).fill(false);
        this.rolling = false;
        this.reelsRolling = Array(NUM_COLS).fill(false);
        this.reelRandomness = Array(NUM_COLS).fill(-1);

        this.app = new PIXI.Application<HTMLCanvasElement>({ 
            background: '#1099bb', 
            width: 800,
            height: 600, 
        });
        
        document.body.appendChild(this.app.view);

        for (let i: number = 0; i < IMAGES.length; i++) {
            const img: HTMLImageElement = new Image();
            img.crossOrigin = "Anonymous";
            img.src = IMAGES[i];
            this.symbols.push(PIXI.Texture.from(img));
        }

        const start: HTMLElement = document.getElementById('start')!;
        start.addEventListener('click', () => {
            if (!this.rolling) {
                this.startRoll();
            }
        });
    }

    public init(): void {
        this.createReels();
        this.setReels(true);
        this.createLogo();
        animationUpdater.init(this.tickEventHandler);
    }

    private createLogo(): void {
        const logo = new PIXI.Sprite(PIXI.Texture.from('https://i.imgur.com/UjL9rZJ.png'));
        logo.scale.set(0.5);
        logo.anchor.set(0.5);
        logo.x = 400;
        logo.y = 550;
        this.app?.stage?.addChild(logo);
      }

    private lastTime = Date.now();
    public update(): void {
        const updater = (): void => {
            const currentTime = Date.now();            
            const deltaTime = currentTime - this.lastTime;  
            this.lastTime = currentTime;
            this.tickEventHandler.updateEvents(deltaTime * 0.001);
            requestAnimationFrame(updater);
        };
        updater();
    }

    private createReels(): void {
        for (let col: number = 0; col < NUM_COLS; col++) {
        const reel: PIXI.Container = new PIXI.Container();
        reel.x = START_X + (col * SYMBOL_SIZE + col * 20);
        reel.y = SYMBOL_SIZE * 0.5;
        this.app!.stage.addChild(reel);
        this.reels.push(reel);
        for (let row: number = 0; row < TOTAL_ROWS; row++) {
            const symbolIndex: number = this.rand(0, IMAGES.length - 1);
            const symbol: PIXI.Sprite = new PIXI.Sprite(this.symbols[symbolIndex]);
            symbol.anchor.set(0.5);
            symbol.y = START_Y + (row * SYMBOL_SIZE);
            reel.addChild(symbol);
        }
        }
        this.app!.stage.addChild(new PIXI.Sprite(PIXI.Texture.from(FOREGROUND)));
    }

    public startRolling(): void {
        this.currentRows = Array(NUM_COLS).fill(-1);
        this.endResult = Array(NUM_COLS).fill(false);
        this.rolling = true;

        this.result = Array.from({ length: NUM_COLS }, () =>
        Array.from({ length: TOTAL_ROWS }, () => this.rand(0, IMAGES.length - 1))
        );
        console.log("Result:", this.result);

        const startTime: number = Date.now();
        let finishing = false;
        const rollUpdater = (): void => {
            const elapsed: number = Date.now() - startTime;
            if (this.rolling) {
                this.reelsRolling.forEach((item: boolean, index: number) => {
                    if (item) {
                        this.updateReel(index);
                    }
                    if (!item && this.endResult[index]) {
                        this.setReel(index);
                        this.stopReel(index);

                        this.endResult[index] = false;
                        if(index === this.reels.length - 1) {
                            this.rolling = false;
                        }
                    }
                })
                
                requestAnimationFrame(rollUpdater);
                if (elapsed >= ROLL_TIME && !finishing) {
                    finishing = true;
                    this.stopRoll();
                }
            }
        };
        rollUpdater();
    }

    private startRoll(): void {
        this.reelsRolling = Array(NUM_COLS).fill(false);
        
        let delay = 0;
        this.startRolling();
        for(let i: number = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.startReel(i)
            }, delay);
            delay += DELAY_BETWEEN_REELS;
        }
    }

    private startReel(col: number): void {
        const reel: PIXI.Container = this.reels[col];
        tweenInOutReel(true, (data: { y: number}) => {
            reel.y = data.y;
        }, () => {
            this.reelsRolling[col] = true;
        });
    }

    private stopRoll(): void {
        let delay = 0;
        for(let i: number = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.endResult[i] = true;
            }, delay);
            delay += DELAY_BETWEEN_REELS;
        }
    }

    private stopReel(col: number): void {
        const reel: PIXI.Container = this.reels[col];
        tweenInOutReel(false, (data: { y: number}) => {
            reel.y = data.y;
        }, () => {
            if (col === this.reels.length - 1) {
                this.rolling = false;
            }
        });
    }

    private updateReel(col: number): void {
        this.reels[col].children.forEach((element: PIXI.DisplayObject, row: number) => {
            const symbol = element as PIXI.Sprite;
            symbol.y += ((SYMBOL_SIZE / 10) * SPEED);
            if (symbol.y >= START_Y + (TOTAL_ROWS * SYMBOL_SIZE)) {
                symbol.y = START_Y;

                if (!this.endResult[col]) {
                    symbol.texture = this.symbols[this.getRandomSymbol(col)];
                } else {
                    if (this.currentRows[col] < 0) {
                        this.currentRows[col] = TOTAL_ROWS - 1
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

    private getRandomSymbol(col: number): number {
        let symbolIndex = -1;
        do {
            symbolIndex = this.rand(0, IMAGES.length - 1)
        } while (this.reelRandomness[col] === symbolIndex);
        this.reelRandomness[col] = symbolIndex;
        return symbolIndex;
    }


    private updateReels(): void {
        for (let i: number = 0; i < this.reels.length; i++) {
            this.updateReel(i);
        }
    }

    private setReels(randomSymbol: boolean = false): void {
        for (let col: number = 0; col < this.reels.length; col++) {
            this.setReel(col, randomSymbol);
        }
    }

    private setReel(column: number, randomSymbol: boolean = false): void {
        this.reels[column].children.forEach((element: PIXI.DisplayObject, row: number) => {
            const symbol = element as PIXI.Sprite;
            symbol.y = START_Y + (row * SYMBOL_SIZE);
            if (randomSymbol) {
                const symbolIndex: number = this.rand(0, IMAGES.length - 1);
                symbol.texture = this.symbols[symbolIndex];
            }
        });
    }

    private rand(min: number, max: number){
        return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
    }
}