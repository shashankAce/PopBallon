// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Ballon from "./Ballon";
import { CustomGameEvent, EventName } from "./CustomEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Ball extends cc.Component {
    onBeginContact(contact, selfCollider, otherCollider) {

        if (!otherCollider.node.getComponent(Ballon).isHit) {
            otherCollider.node.getComponent(Ballon).hit();
            CustomGameEvent.dispatchEvent(EventName.ON_BALL_HIT);
        }
    }
}
