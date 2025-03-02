// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

@ccclass
export default class Ballon extends cc.Component {

    @property(cc.SpriteFrame)
    yellowFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    greenFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    redFrame: cc.SpriteFrame = null;

    @property(cc.Node)
    imageNode: cc.Node = null;

    public speed = 0;
    public isHit = false;

    init(color: string) {
        switch (color) {
            case "yellow":
                this.imageNode.getComponent(cc.Sprite).spriteFrame = this.yellowFrame;
                break;
            case "green":
                this.imageNode.getComponent(cc.Sprite).spriteFrame = this.greenFrame;
                break;
            case "red":
                this.imageNode.getComponent(cc.Sprite).spriteFrame = this.redFrame;
                break;
        }
    }

    hit() {
        this.isHit = true;
        this.imageNode.active = false;
    }

    activate() {
        this.isHit = false;
        this.imageNode.active = true;
    }
}
