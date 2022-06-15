function createPlainObject() {
    return Object.create(null)
}

type SessionObject = Record<string, string>

function update(keys: string[], msg: string) {
    const data = JSON.parse(msg)
    const addObject: SessionObject = createPlainObject()
    const removeObject: SessionObject = createPlainObject()
    keys.forEach(key => {
        if (key in data) {
            addObject[key] = data[key]
            sessionStorage.setItem(key, data[key])
        } else {
            removeObject[key] = sessionStorage.getItem(key)!
            sessionStorage.removeItem(key)
        }
    })
    return { addObject, removeObject }
}

const Prefix = '__ss_'
const GetKey = 'get'
const SetKey = 'set'
const PushKey = 'push'
const PushedKey = 'pushed'

function genKey(type: string, id: string) {
    return Prefix + type + '_' + id + '__'
}

function genId() {
    return Date.now() as unknown as string
}

type SubscribeHandle = (addObject: SessionObject, removeObject: SessionObject) => void


interface SyncSession {
    create(id: string, keys?: string[]): this
}

class SyncSession {
    private readonly subscriptions: SubscribeHandle[] = []
    private pushed = false
    private readonly pullStack: Function[] = []
    private readonly pushStack: Function[] = []
    private handle = (event: any) => {
        const id = this.config.id
        const getKey = genKey(GetKey, id)
        const setKey = genKey(SetKey, id)
        const pushKey = genKey(PushKey, id)
        const pushedKey = genKey(PushedKey, id)

        // push
        if (event.key === pushKey) {
            this.pushed = true
            localStorage.setItem(getKey, genId())
            return
        }

        // opened window, payload
        if (event.key === getKey && !this.pushed && event.newValue !== null) {
            const result: SessionObject = createPlainObject()
            this.config.keys.forEach(key => {
                if (key in sessionStorage) {
                    result[key] = sessionStorage.getItem(key)!
                }
            })
            localStorage.setItem(setKey, JSON.stringify(result))
            localStorage.removeItem(getKey)
            localStorage.removeItem(setKey)
            return
        }

        // new open window, pull data
        if (event.key === setKey) {
            if (event.newValue && this.pushed) {
                const { addObject, removeObject } = update(this.config.keys, event.newValue)
                localStorage.setItem(pushedKey, genId())
                localStorage.removeItem(pushedKey)
                this.subscriptions.forEach(subscribe => subscribe(addObject, removeObject))
                this.pushed = false
            }
            return
        }
    }

    public readonly config = {
        id: genId(),
        keys: Object.keys(sessionStorage),
    }

    constructor(id?: string, keys?: string[]) {
        if (id) this.config.id = id
        if (keys && keys.length) this.config.keys = keys

        window.addEventListener('storage', this.handle)
    }

    public pull(): Promise<{ addObject: SessionObject, removeObject: SessionObject}> {
        const id = this.config.id
        const getKey = genKey(GetKey, id)
        const setKey = genKey(SetKey, id)

        try {
            localStorage.setItem(getKey, genId())
        } catch (error) {
            return Promise.reject(error)
        }

        if (this.pullStack.length) {
            this.pullStack.forEach((handle: any) => {
                window.removeEventListener('storage', handle)
            })
        }

        return new Promise((resolve) => {
            const handle = (event: any) => {
                if (event.key === setKey && !this.pushed && event.newValue) {
                    const { addObject, removeObject } = update(this.config.keys, event.newValue)

                    // trigger subscribe
                    this.subscriptions.forEach(subscribe => subscribe(addObject, removeObject))

                    // remove stack handle
                    const index = this.pushStack.findIndex(item => item === handle)
                    this.pushStack.splice(index, 1)

                    // remove event
                    window.removeEventListener('storage', handle)
                    resolve({ addObject, removeObject })
                }
            }

            this.pullStack.push(handle)
            window.addEventListener('storage', handle)
        })
    }

    public push() {
        const id = this.config.id
        const publishKey = genKey(PushKey, id)
        const publishedKey = genKey(PushedKey, id)

        try {
            localStorage.setItem(publishKey, genId())
            localStorage.removeItem(publishKey)
        } catch (error) {
            return Promise.reject(error)
        }

        if (this.pushStack.length) {
            this.pushStack.forEach((handle: any) => {
                window.removeEventListener('storage', handle)
            })
        }

        return new Promise((resolve) => {
            const handle = (event: any) => {
                if (event.key === publishedKey) {
                    // remove stack handle
                    const index = this.pushStack.findIndex(item => item === handle)
                    this.pushStack.splice(index, 1)
                    // remove event
                    window.removeEventListener('storage', handle)
                    resolve(undefined)
                }
            }

            this.pushStack.push(handle)
            window.addEventListener('storage', handle)
        })
    }

    public subscribe(callback: SubscribeHandle) {
        this.subscriptions.push(callback)
    }

    public unsubscribe() {
        this.subscriptions.length = 0
    }

    public dispose() {
        this.unsubscribe()
        window.removeEventListener('storage', this.handle)
    }
}

function createInstance(id?: string, keys?: string[]) {
    const instance = new SyncSession(id, keys)
    instance.create = function (id: string, keys?: string[]) {
        return createInstance(id, keys)
    }
    return instance
}

const instance = createInstance()
instance.config.id = 'default'

export default instance