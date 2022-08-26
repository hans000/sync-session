import { Prefix } from "./constants"
import { SessionData } from "./types"

export function genKey(type: string, id: string) {
    return Prefix + type + '_' + id + '__'
}

export function genId() {
    return Date.now() as unknown as string
}

export function removeEvent(handle: any) {
    window.removeEventListener('storage', handle)
}

export function addEvent(handle: any) {
    window.addEventListener('storage', handle)
}

export function createPlainObject() {
    return Object.create(null)
}

export function setLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value)
}

export function removeLocalStorage(key: string) {
    localStorage.removeItem(key)
}

export function expectParam(prop: string, value: any) {
    throw prop + ' expected a string array, but got a ' + value
}

export function update(keys: string[], msg: string) {
    const data = JSON.parse(msg)
    const addData: SessionData = createPlainObject()
    const removeData: SessionData = createPlainObject()
    const s = sessionStorage
    keys.forEach(key => {
        if (key in data) {
            addData[key] = data[key]
            s.setItem(key, data[key])
        } else {
            removeData[key] = s.getItem(key)!
            s.removeItem(key)
        }
    })
    return [addData, removeData]
}