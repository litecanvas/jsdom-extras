# jsdom-extras for litecanvas unit tests

## Usage

How to test `<canvas>` element:

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
