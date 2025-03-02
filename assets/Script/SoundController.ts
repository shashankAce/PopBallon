// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoundController extends cc.Component {

    public static instance: SoundController = null;

    @property(cc.AudioClip)
    bgMusic: cc.AudioClip = null;

    @property(cc.AudioClip)
    ballLaunch: cc.AudioClip = null;

    @property(cc.AudioClip)
    levelComplete: cc.AudioClip = null;

    @property(cc.AudioClip)
    buttonClick: cc.AudioClip = null;

    @property(cc.AudioClip)
    ballonPop: cc.AudioClip = null;

    onLoad() {
        SoundController.instance = this;
    }

    playBgMusic() {
        cc.audioEngine.playMusic(this.bgMusic, true);
        cc.audioEngine.setMusicVolume(0.1);
    }

    playBallLaunch() {
        cc.audioEngine.playEffect(this.ballLaunch, false);
    }

    playLevelComplete() {
        cc.audioEngine.playEffect(this.levelComplete, false);
    }

    playButtonClick() {
        cc.audioEngine.playEffect(this.buttonClick, false);
    }

    playHitSound() {
        cc.audioEngine.playEffect(this.ballonPop, false);
    }
}
