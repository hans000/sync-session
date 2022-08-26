# SyncSession

[English](./readme.md) | 中文

## Intro

一个方便跨页面同步sessionStorage的库

## 用法

### 安装
```
// npm
npm i sync-session -S

// esm
import * as SyncSession from 'sync-session'

// script
<script src="//unkpg.com/sync-session"></script>
```

### 举例

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

## 库方法

|名称|描述|类型|备注|
|---|---|---|---|
|create|创建一个实例|(id: string, syncKeys: string[]) => Instance||
|get|通过id获取实例|(id: string) => Instance\|undefined||

### 实例方法


|名称|描述|类型|备注|
|---|---|---|---|
|pull|从其他页面同步状态|() => Promise<[AddData, RemoveData]>|只有一个页面时then不会响应|
|push|把当前页面状态同步给其他页面|() => Promise<void>|只有一个页面时then不会响应|
|subscribe|添加一个订阅|(handle) => void|当pull响应时触发|
|unsubscribe|移出订阅|(handle) => void||
|dispose|销毁实例|Function||

## License
[MIT](./license)