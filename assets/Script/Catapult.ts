// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { CustomGameEvent, EventName } from "./CustomEvent";
import { BallVelocity, Config } from "./GamePhysics";
import SoundController from "./SoundController";

export const SlingConfig = {
    minWidth: 10,
    maxWidth: 17,
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Catapult extends cc.Component {
    private startPosition: cc.Vec3;
    private touchOffset: cc.Vec3;

    private max_radius = 100;
    private alt_radius = 40;
    private canDrag = false;

    ballNode: cc.Node = null;

    @property(cc.Node)
    point1: cc.Node = null;

    @property(cc.Node)
    point2: cc.Node = null;

    @property(cc.Node)
    launchNode: cc.Node = null;

    @property(cc.Node)
    catapultEnd: cc.Node = null;

    @property(cc.Graphics)
    slingshotGraphics: cc.Graphics = null;

    @property(cc.Graphics)
    trajectoryGraphics: cc.Graphics = null;

    private projectileVelocity = 0;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    initialize() {
        this.startPosition = this.launchNode.position.clone();
        this.touchOffset = cc.v3();
        this.projectileVelocity = 0;

        let rioBody = this.ballNode.getComponent(cc.RigidBody);
        rioBody.gravityScale = 0;
        rioBody.angularVelocity = 0;
        rioBody.linearVelocity = cc.v2();
        rioBody.gravityScale = 0;

        this.ballNode.angle = 0;
        this.ballNode.setPosition(this.launchNode.getPosition());

        this.catapultEnd.active = false;
        this.catapultEnd.setPosition(this.launchNode.getPosition());
        this.catapultEnd.angle = 90;
        this.drawSlingshot();
        this.canDrag = true;

    }

    onTouchStart(event) {
        // if (cc.sys.isMobile) {
        // }
        if (!this.canDrag) return;

        this.startPosition = this.launchNode.position.clone();
        this.touchOffset = this.launchNode.parent.convertToNodeSpaceAR(event.getLocation()).sub(this.launchNode.position);

        this.catapultEnd.active = true;

        this.ballNode.angle = 0;
        let rioBody = this.ballNode.getComponent(cc.RigidBody);

        rioBody.gravityScale = 0;
        rioBody.angularVelocity = 0;
        rioBody.linearVelocity = cc.v2();
    }

    onTouchMove(event) {

        if (!this.canDrag) return;

        if (this.startPosition) {
            const touchPos = this.launchNode.parent.convertToNodeSpaceAR(event.getLocation());
            let newPos = touchPos.sub(this.startPosition);
            const angleRad = Math.atan2(-newPos.y, -newPos.x);

            let angleDeg = cc.misc.radiansToDegrees(angleRad);
            if (angleDeg < 0) angleDeg += 360;

            let dynamicRadius = this.max_radius; // Default radius
            if (angleDeg >= 80 && angleDeg <= 100) {
                dynamicRadius = this.alt_radius; // Use a different radius
            }

            const distance = newPos.mag();
            if (distance > dynamicRadius) {
                newPos = newPos.normalize().multiplyScalar(dynamicRadius);
            }

            this.ballNode.position = this.startPosition.add(newPos);


            const offsetDistance = 20; // catapult offset
            const offsetAngleRad = angleRad + Math.PI;
            const offsetX = Math.cos(offsetAngleRad) * offsetDistance;
            const offsetY = Math.sin(offsetAngleRad) * offsetDistance;

            this.catapultEnd.angle = cc.misc.radiansToDegrees(angleRad);

            this.catapultEnd.setPosition(this.ballNode.position.add(cc.v3(offsetX, offsetY)));

            this.drawSlingshot();
            this.drawTrajectory();
        }
    }

    drawSlingshot() {
        const graphics = this.slingshotGraphics;
        graphics.clear();

        const leftAnchor = this.point1.convertToWorldSpaceAR(cc.v3(0, 0));
        const rightAnchor = this.point2.convertToWorldSpaceAR(cc.v3(0, 0));

        const endPos = this.catapultEnd.convertToWorldSpaceAR(cc.v3(0, 0));

        const leftLocal = graphics.node.convertToNodeSpaceAR(leftAnchor);
        const rightLocal = graphics.node.convertToNodeSpaceAR(rightAnchor);
        const endLocal = graphics.node.convertToNodeSpaceAR(endPos);


        const pullDistance = this.startPosition.sub(this.catapultEnd.position).mag();

        const minWidth = SlingConfig.maxWidth;
        const maxWidth = SlingConfig.minWidth;
        const maxPull = this.max_radius;
        const thickness = cc.misc.lerp(minWidth, maxWidth, pullDistance / maxPull);

        graphics.lineWidth = thickness;
        graphics.strokeColor = cc.Color.fromHEX(cc.color(), "#301708");


        graphics.moveTo(leftLocal.x, leftLocal.y);
        graphics.lineTo(endLocal.x, endLocal.y);

        graphics.moveTo(rightLocal.x, rightLocal.y);
        graphics.lineTo(endLocal.x, endLocal.y);

        graphics.stroke();
    }


    drawTrajectory() {
        const graphics = this.trajectoryGraphics;
        graphics.clear();

        const pullDistance = this.startPosition.sub(this.ballNode.position).mag();
        const maxPull = this.max_radius;
        const minVelocity = BallVelocity.minVelocity;
        const maxVelocity = BallVelocity.maxVelocity;

        const velocity = cc.misc.lerp(minVelocity, maxVelocity, pullDistance / maxPull);
        this.projectileVelocity = velocity;

        const angleRad = cc.misc.degreesToRadians(this.catapultEnd.angle);

        const vx = Math.cos(angleRad) * velocity;
        const vy = Math.sin(angleRad) * velocity;

        const gravity = Config.gravity;
        const timeStep = Config.timeStep;
        const maxTime = Config.tragectoryLength;

        const worldStartPos = this.catapultEnd.convertToWorldSpaceAR(cc.v3(0, 0));
        let prevPoint = worldStartPos;


        for (let t = 0; t < maxTime; t += timeStep) {
            const x = vx * t;
            const y = vy * t - (-gravity * t * t) / 2;

            const nextPoint = cc.v3(worldStartPos.x + x, worldStartPos.y + y);

            // Check distance from previous point
            // accumulatedDistance += prevPoint.sub(nextPoint).mag();
            // if (accumulatedDistance >= distanceThreshold) {
            //     let node = cc.instantiate(this.tDots);
            //     let pos = this.node.parent.convertToNodeSpaceAR(nextPoint); // Convert to node space
            //     node.setPosition(pos);
            //     this.node.parent.addChild(node);
            //     this.tDotsArray.push(node);
            //     accumulatedDistance = 0; // Reset distance counter
            // }

            // Convert to local graphics space
            const localNext = graphics.node.convertToNodeSpaceAR(nextPoint);
            const localPrev = graphics.node.convertToNodeSpaceAR(prevPoint);

            graphics.moveTo(localPrev.x, localPrev.y);
            graphics.lineTo(localNext.x, localNext.y);

            prevPoint = nextPoint;
        }

        graphics.strokeColor = cc.Color.BLUE;
        graphics.lineWidth = 3;
        graphics.stroke();
    }

    onTouchEnd(event) {

        if (!this.canDrag) return;

        // if (cc.sys.platform === cc.sys.MOBILE_BROWSER) {
        // }
        const newPos = this.launchNode.parent.convertToNodeSpaceAR(event.getLocation()).sub(this.touchOffset);
        var deltaX = newPos.x - this.startPosition.x;
        var deltaY = newPos.y - this.startPosition.y;

        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > 10) {
            this.launchProjectile();

            this.catapultEnd.setPosition(this.launchNode.getPosition());
            this.catapultEnd.angle = 90;
            this.drawSlingshot();

            const graphics = this.trajectoryGraphics;
            graphics.clear();

        } else {

            this.ballNode.angle = 0;
            this.ballNode.setPosition(this.launchNode.getPosition());

            this.catapultEnd.active = false;
            this.catapultEnd.setPosition(this.launchNode.getPosition());
            this.catapultEnd.angle = 90;
            this.drawSlingshot();
            this.canDrag = true;

            const graphics = this.trajectoryGraphics;
            graphics.clear();
        }
    }

    launchProjectile() {
        SoundController.instance.playBallLaunch();

        this.canDrag = false;
        const rigidbody = this.ballNode.getComponent(cc.RigidBody);

        // Commented because Min and Max velocity is calculated in draw trajectory
        // const pullDistance = this.startPosition.sub(this.launchNode.position).mag();
        // const maxPull = this.max_radius;
        // const minVelocity = RedRio.minVelocity; // Minimum launch speed
        // const maxVelocity = RedRio.maxVelocity; // Maximum launch speed

        const angleRad = cc.misc.degreesToRadians(this.catapultEnd.angle);

        const vx = Math.cos(angleRad) * this.projectileVelocity;
        const vy = Math.sin(angleRad) * this.projectileVelocity;

        rigidbody.gravityScale = 1;
        rigidbody.linearDamping = 0;
        // rigidbody.angularDamping = 0;
        rigidbody.linearVelocity = cc.v2(vx, vy);

        this.scheduleOnce(() => {
            CustomGameEvent.dispatchEvent(EventName.ON_BALL_LAUNCHED);
        }, 0.5);
    }
}