# jsdom-extras for litecanvas unit tests

## Usage

### How to test Litecanvas-related functions:

```js
// example using ava test runner
import test from 'ava'
import { setupDOM } from '@litecanvas/jsdom-extras'
import litecanvas from 'litecanvas'

let local

test.before(() => {
    setupDOM()

    local = litecanvas({
        global: false,
    })
})

test.after(() => {
    local.quit()
})

test('test', async (t) => {
    // `onLitecanvas()` returns a promise
    // and resolve it by default after after that event
    const event = 'init'
    await onLitecanvas(local, event, () => {
        t.is(Math.PI, local.PI)
    })
})

test('another test', async (t) => {
    const event = 'update'
    await onLitecanvas(local, event, (dt) => {
        // if elapsed time is less than 2 seconds
        if (local.T < 2) {
            // return `false` to not resolve the promise yet
            // and keep that event listener
            return false
        } else {
            // that test will run after 2 seconds
            t.pass()
        }
    })
})
```

### How to test `<canvas>` rendering context:

```js
// example using ava test runner
import test from 'ava'
import { setupDOM } from '@litecanvas/jsdom-extras'

test.before(() => {
    setupDOM()
})

test('test canvas', (t) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // draw a filled rect
    _fillRect(ctx, 0, 0, 300, 150, '#FF0000')

    // test the rendering context latest calls
    const expected = ['set fillStyle #FF0000', 'fillRect(0,0,300,150)']
    const actual = ctx._calls.slice(-expected.length)
    t.deepEqual(actual, expected)
})

function _fillRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
}
```
