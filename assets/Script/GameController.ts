// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Ballon from "./Ballon";
import Catapult from "./Catapult";
import { CustomGameEvent, EventName } from "./CustomEvent";
import LevelCompPopup from "./LevelCompPopup";
import SoundController from "./SoundController";

const { ccclass, property } = cc._decorator;
const maxTime = 30;

@ccclass
export default class GameController extends cc.Component {

    @property(Catapult)
    catapult: Catapult = null;

    @property(cc.Node)
    launchNode: cc.Node = null;

    @property(LevelCompPopup)
    levelCompletePopup: LevelCompPopup = null;

    @property(cc.Prefab)
    ballPrefab: cc.Prefab = null;

    @property(cc.Node)
    objectContainer: cc.Node = null;

    @property(cc.Prefab)
    ballonPrefab: cc.Prefab = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    timerLabel: cc.Label = null;

    private currentBall: cc.Node = null;
    private isGameOver: boolean = false;
    private ballLaunched: boolean = false;
    private hitCount: number = 0;
    private gameStarted = false;
    private ballonArray: Ballon[] = [];
    private counter = 0;
    private gameTime = 0;

    protected onLoad(): void {

        SoundController.instance.playBgMusic();

        CustomGameEvent.on(EventName.ON_RESTART, this.onRestart, this);
        CustomGameEvent.on(EventName.ON_BALL_HIT, this.onBallHit, this);
        CustomGameEvent.on(EventName.ON_BALL_LAUNCHED, this.onBallLaunched, this);

        this.resetGame();

        this.levelCompletePopup.node.active = false;
        this.startGame();
    }

    resetGame() {
        this.gameStarted = false;
        this.isGameOver = false;
        this.hitCount = 0;
        this.counter = 0;
        this.gameTime = maxTime;
        this.scoreLabel.string = "Score: " + this.hitCount;
        this.timerLabel.string = `00:${this.padTo2Digits(this.gameTime)}`;
        this.objectContainer.removeAllChildren();
        this.ballonArray = [];
        this.addBallons();
        this.unschedule(this.spawnBallons);
        this.unschedule(this.updateTimer);
    }

    startGame() {
        this.addBall();
        this.schedule(this.spawnBallons, .1);
        this.initializeCatpult();
        this.gameStarted = true;
        this.schedule(this.updateTimer, 1);
    }

    private padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
    }

    updateTimer() {
        if (this.isGameOver) return;

        this.gameTime--;
        let minutes = Math.floor(this.gameTime / 60);
        let seconds = this.gameTime % 60;
        this.timerLabel.string = `00 :${this.padTo2Digits(seconds)}`;
        if (this.gameTime <= 0) {
            this.isGameOver = true;
            this.unschedule(this.updateTimer);
            this.levelCompletePopup.initialize({ hitCount: this.hitCount });
        }
    }

    spawnBallons() {
        if (this.counter >= this.ballonArray.length) {
            this.unschedule(this.spawnBallons);
            return;
        }
        this.ballonArray[this.counter].node.active = true;
        this.counter++;
    }

    addBall() {
        this.currentBall = cc.instantiate(this.ballPrefab);
        this.objectContainer.addChild(this.currentBall);
    }

    private addBallons() {
        for (let i = 0; i < 10; i++) {
            let ballon = cc.instantiate(this.ballonPrefab);
            let randX = this.getRandomPosition(0, cc.winSize.width / 2 - 100);
            ballon.setPosition(cc.v2(randX, -cc.winSize.height / 2 - ballon.height));
            ballon.active = false;

            let ballonScript = ballon.getComponent(Ballon);
            ballonScript.init(["yellow", "green", "red"][this.getRandom(0, 2)]);
            ballonScript.speed = this.getRandom(1, 3);

            this.objectContainer.addChild(ballon);
            this.ballonArray.push(ballonScript);
        }
    }

    initializeCatpult() {
        this.catapult.ballNode = this.currentBall;
        this.catapult.initialize();
    }

    onBallHit() {
        if (this.isGameOver) {
            return;
        }
        SoundController.instance.playHitSound();
        this.hitCount++;
        this.scoreLabel.string = "Score: " + this.hitCount;
    }

    private getRandom(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getRandomPosition(minX: number, maxX: number): number {
        return Math.random() * (maxX - minX) + minX;
    }

    onBallLaunched() {
        this.addBall();
        this.initializeCatpult();
    }

    onRestart() {
        SoundController.instance.playButtonClick();
        this.levelCompletePopup.hide();
        this.resetGame();
        this.startGame();
    }

    protected update(dt: number): void {
        if (this.gameStarted) {
            this.ballonArray.forEach(ballon => {
                if (ballon.node.active) {
                    ballon.node.y += ballon.speed;
                }

                if (ballon.node.y > (cc.winSize.height / 2 + ballon.node.height)) {
                    ballon.node.y = -cc.winSize.height / 2 - ballon.node.height;
                    ballon.activate();
                }
            });
        }
    }
}
