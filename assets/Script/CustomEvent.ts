class OneToMultiListener {
    static handlers: { [name: string]: { handler: Function, target: any }[] };
    static supportEvent: { [name: string]: string };

    public static on(eventName: string, handler: Function, target?: any) {
        const objHandler = { handler: handler, target: target };
        let handlerList = this.handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            this.handlers[eventName] = handlerList;
        }

        for (var i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = objHandler;
                return i;
            }
        }

        handlerList.push(objHandler);

        return handlerList.length;
    };

    public static off(eventName: string, handler: Function, target?: any) {
        const handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (let i = 0; i < handlerList.length; i++) {
            const oldObj = handlerList[i];
            if (oldObj.handler === handler && (!target || target === oldObj.target)) {
                handlerList.splice(i, 1);
                break;
            }
        }
    };

    public static dispatchEvent(eventName: string, ...args: any) {
        // if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
        //     cc.error("please add the event into clientEvent.js");
        //     return;
        // }

        const handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (let i = 0; i < handlerList.length; i++) {
            const objHandler = handlerList[i];
            if (objHandler.handler) {
                try {
                    objHandler.handler.apply(objHandler.target, args);
                } catch (error) {

                }

            }
        }
    };

    public static setSupportEventList(arrSupportEvent: string[]) {
        if (!(arrSupportEvent instanceof Array)) {
            console.log("supportEvent was not array");
            return false;
        }

        this.supportEvent = {};
        for (let i in arrSupportEvent) {
            const eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }


        return true;
    };
};

export class CustomGameEvent extends OneToMultiListener {
    static handlers = {};
}

export const EventName = {
    ON_RESTART: "restart",
    ON_GAME_OVER: "gameOver",
    ON_BALL_LAUNCHED: "ballLaunched",
    ON_BALL_HIT: "ballHit",

    ON_LEVEL_COMPLETE: "levelComplete",
    ON_GAME_COMPLETE: "gameComplete",
}