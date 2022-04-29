# SyncSession

## Intro

it can cross tab window to shared sessionStorage easily.

## Usage

### install
```
// npm
npm i sync-session -S

// esm
import SyncSession from 'sync-session'

// script
<script src="//unkpg.com/sync-session"></script>
```

### example

```
SyncSession.config.id = 'foo'
SyncSession.config.keys = ['foo', 'bar']

SyncSession.pull().then(({ addObject, removeObject }) => {
    console.log(addObject, removeObject)
})

SyncSession.push().then()

SyncSession.subscribe(({ addObject, removeObject }) => {
    console.log(addObject, removeObject)
})

SyncSession.unsubscribe()

SyncSession.dispose()


```

### create an instance
SyncSession is an default instance, you can also create an new istance if you need by `create` method.
```
const newInstance = SyncSession.create('new-instance', ['foo', 'bar'])
```

## API

- config
- pull
- push
- subscribe
- unsubscribe
- dispose
- create


## License
[MIT](./license)