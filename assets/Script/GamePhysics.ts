const { ccclass, property } = cc._decorator;

export const Config = {
    gravity: -320,
    isDeubg: false,
    tragectoryLength: 2,
    timeStep: 1 / 60,
    fps: 60
}

export const BallVelocity = {
    minVelocity: 200,
    maxVelocity: 800,
}

@ccclass
export default class GamePhysics extends cc.Component {

    protected onLoad(): void {
        cc.game.setFrameRate(Config.fps);
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, Config.gravity);
        // allowed acccumulator for same physics on diff framerate
        cc.director.getPhysicsManager().enabledAccumulator = true;

        this.enableDebugDraw();
    }

    private enableDebugDraw() {
        if (Config.isDeubg)
            cc.director.getPhysicsManager().debugDrawFlags =
                cc.PhysicsManager.DrawBits.e_aabbBit |
                cc.PhysicsManager.DrawBits.e_jointBit |
                cc.PhysicsManager.DrawBits.e_shapeBit;
        else
            cc.director.getPhysicsManager().debugDrawFlags = 0;
    }
}