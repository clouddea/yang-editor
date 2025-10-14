
export interface Event<T> {
    name: string
    payload : T
}

export type EventListener<T> =  (event: Event<T>) => void;

export default class EventCenter {

    private listeners : Map<string, Array<EventListener<any>>>;

    constructor() {
        this.listeners = new Map<string, Array<EventListener<any>>>();
    }

    on<T>(event: string, callback: EventListener<T>) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Array<EventListener<T>>());
        }
        let callbacks = this.listeners.get(event);
        let idx = callbacks?.indexOf(callback);
        if (idx === -1) {
            this.listeners.get(event)?.push(callback)
        }
    }

    emit<T>(event: string, data : T) {
        if (this.listeners.has(event)){
            let callbacks =  this.listeners.get(event);
            if (callbacks !== undefined) {
                for(let callback of callbacks){
                    callback({
                        name: event,
                        payload: data
                    })
                }
            }
        }
    }

    off<T>(event: string, callback: EventListener<T>) {
        if (this.listeners.has(event) ) {
            let callbacks = this.listeners.get(event);
            let idx = callbacks?.indexOf(callback);
            if (idx !== undefined && idx >= 0){
                callbacks?.splice(idx, 1)
            }
        }
    }

}