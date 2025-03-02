// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { CustomGameEvent, EventName } from "./CustomEvent";
import SoundController from "./SoundController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelCompPopup extends cc.Component {

    private isTweening = false;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    messageLabel: cc.Label = null;

    @property(cc.Node)
    restartButton: cc.Node = null;

    initialize(prop: { hitCount: number }) {

        let { hitCount } = prop;
        this.scoreLabel.string = `Final Score : ${hitCount}`;
        SoundController.instance.playLevelComplete();
        this.messageLabel.string = hitCount < 10 ? "You can do better!" : "Good Job!";
        this.show();
    }

    onRestart() {
        if (this.isTweening) return;
        CustomGameEvent.dispatchEvent(EventName.ON_RESTART);
        SoundController.instance.playButtonClick();
        this.hide();
    }

    public show() {
        if (this.isTweening) return;

        this.isTweening = true;

        this.node.active = true;
        this.node.opacity = 0;

        cc.tween(this.node)
            .to(0.5, { opacity: 255 }, { easing: "cubicOut" })
            .call(() => {
                this.isTweening = false;
                this.onShowCallback();
            })
            .start()
    }

    public hide() {
        if (this.isTweening) return;

        this.isTweening = true;

        cc.tween(this.node)
            .to(0.5, { opacity: 0 }, { easing: "cubicOut" })
            .call(() => {
                this.node.active = false;
                this.isTweening = false;
                this.onHideCallback();
            })
            .start()
    }

    protected onShowCallback() {

    }

    protected onHideCallback() {

    }

}
