import { GetKey, SetKey, PushKey, PushedKey } from "./constants"
import { SessionData, SubscribeHandle } from "./types"
import { genKey, genId, removeEvent, createPlainObject, update, addEvent, setLocalStorage, removeLocalStorage, expectParam } from "./utils"

const __map__ = createPlainObject()

export function get(id: string) {
    return __map__[id]
}

export function create(id: string, syncKeys: string[]) {
    // check input valid
    if (typeof id !== 'string') expectParam('id', id)
    if (! Array.isArray(syncKeys)) expectParam('keys', syncKeys)

    // check exist
    if (id in __map__) throw 'id `' + id + '` has been existed'

    let pushed = false
    let locked = false
    const pushStack: Function[] = []
    const pullStack: Function[] = []
    const subscriptions: SubscribeHandle[] = []
    
    const getKey = genKey(GetKey, id)
    const setKey = genKey(SetKey, id)
    const pushKey = genKey(PushKey, id)
    const pushedKey = genKey(PushedKey, id)
    
    function handle(event: StorageEvent) {

        // push
        if (event.key === pushKey) {
            pushed = true

            setLocalStorage(getKey, genId())
            return
        }

        // opened window, payload
        if (event.key === getKey && !pushed && event.newValue !== null) {
            const result: SessionData = createPlainObject()
            syncKeys.forEach(key => {
                if (key in sessionStorage) {
                    result[key] = sessionStorage.getItem(key)!
                }
            })
            setLocalStorage(setKey, JSON.stringify(result))
            removeLocalStorage(getKey)
            removeLocalStorage(setKey)
            return
        }

        // new open window, pull data
        if (event.key === setKey) {
            if (event.newValue && pushed) {
                const [addData, removeData] = update(syncKeys, event.newValue)
                setLocalStorage(pushedKey, genId())
                removeLocalStorage(pushedKey)
                subscriptions.forEach(subscribe => subscribe(addData, removeData))
                pushed = false
            }
            return
        }
    }
    
    function pull(): Promise<[SessionData, SessionData]> {
        const getKey = genKey(GetKey, id)
        const setKey = genKey(SetKey, id)
    
        try {
            setLocalStorage(getKey, genId())
        } catch (error) {
            return Promise.reject(error)
        }
    
        pullStack.forEach(removeEvent)
    
        return new Promise((resolve) => {
            const handle = (event: any) => {
                if (!locked && event.key === setKey && !pushed && event.newValue) {
                    const [addData, removeData] = update(syncKeys, event.newValue)
    
                    // trigger subscribe
                    subscriptions.forEach(subscribe => subscribe(addData, removeData))
    
                    // remove stack handle
                    const index = pushStack.findIndex(item => item === handle)
                    pushStack.splice(index, 1)
    
                    // remove event
                    removeEvent(handle)
                    resolve([addData, removeData])
                }
            }
    
            pullStack.push(handle)
            addEvent(handle)
        })
    }
    
    function push() {
        // clear pull stack and locked
        pullStack.forEach(removeEvent)
        pullStack.length = 0
        locked = true
    
        try {
            setLocalStorage(pushKey, genId())
            removeLocalStorage(pushKey)
        } catch (error) {
            return Promise.reject(error)
        }
    
        pushStack.forEach(removeEvent)
    
        return new Promise((resolve) => {
            const handle = (event: any) => {
                if (event.key === pushedKey) {
                    // remove stack handle
                    const index = pushStack.findIndex(item => item === handle)
                    pushStack.splice(index, 1)
                    // remove event
                    removeEvent(handle)
                    // reset locked
                    locked = false
                    resolve(undefined)
                }
            }
    
            pushStack.push(handle)
            addEvent(handle)
        })
    }
    
    function subscribe(callback: SubscribeHandle) {
        subscriptions.push(callback)
    }
    
    function unsubscribe(callback: SubscribeHandle) {
        const index = subscriptions.findIndex(item => item === callback);
        subscriptions.splice(index, 1);
    }
    
    function dispose() {
        pushStack.forEach(removeEvent)
        pullStack.forEach(removeEvent)
        subscriptions.length = 0
        pullStack.length = 0
        pushStack.length = 0
        removeEvent(handle)
    }

    // init
    addEvent(handle)
    const instance = { pull, push, subscribe, unsubscribe, dispose }

    // cache instance
    __map__[id] = instance

    return instance
}