# SyncSession

## Intro

it can cross tab window to shared sessionStorage easily.

## Usage

English | [中文](./readme-zh.md)

### install
```
// npm
npm i sync-session -S

// esm
import * as SyncSession from 'sync-session'

// script
<script src="//unkpg.com/sync-session"></script>
```

### example

```
import { create, get } from 'sync-session'

const ss = create('test', ['foo', 'bar'])

ss.pull().then(([ addObject, removeObject ]) => {
    console.log(addObject, removeObject)
})

ss.push().then()

ss.subscribe(([ addObject, removeObject ]) => {
    console.log(addObject, removeObject)
})

ss.unsubscribe()

ss.dispose()

const ss2 = get('test')

// ss === ss2

```

## API

## lib method

|name|description|type|note|
|---|---|---|---|
|create|create a instance|(id: string, syncKeys: string[]) => Instance||
|get|get a instance by id|(id: string) => Instance\|undefined||

### instance method


|name|description|type|note|
|---|---|---|---|
|pull|get state from other pages|() => Promise<[AddData, RemoveData]>|not resolve if one page|
|push|set state to other pages|() => Promise<void>|not resolve if one page|
|subscribe|add a callback|(handle) => void|action when pull resolve|
|unsubscribe|remove a callback|(handle) => void||
|dispose|destroy instance|Function||

## License
[MIT](./license)