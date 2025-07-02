import { JSDOM } from 'jsdom'
import 'litecanvas'

/**
 * @param {LitecanvasInstance} instance
 * @param {string} event
 * @param {Function} callback
 * @returns {Promise<Function>}
 */
export function onLitecanvas(instance, event, callback) {
    return new Promise((resolve) => {
        const removeListener = instance.listen(event, (...args) => {
            if (false !== callback(...args)) {
                removeListener()
                resolve()
            }
        })
    })
}

export function setupDOM() {
    const dom = new JSDOM('<!doctype><html><body></body></html>')

    // set screen size
    dom.window.innerWidth = 800
    dom.window.innerWidth = 600

    global.document = dom.window.document
    global.window = global.globalThis = dom.window

    setupOtherStuffs(window)

    return dom
}

/**
 * @param {Window} window
 */
function setupOtherStuffs(window) {
    // fix node navigator
    if (!global.navigator) {
        global.navigator = {}
    }

    // fake userActivation
    global.navigator.userActivation = {
        hasBeenActive: true,
    }

    // add AudioContext
    global.AudioContext = class {
        createBuffer() {
            return {
                getChannelData() {
                    return new Map()
                },
            }
        }

        createBufferSource() {
            return {
                connect() {},
                start() {},
            }
        }
    }

    // add AudioBuffer
    global.AudioBuffer = class {}

    // add requestAnimationFrame
    global.requestAnimationFrame = (callback) => {
        return setTimeout(() => {
            callback(performance.now())
        }, 1000 / 60)
    }

    // add cancelAnimationFrame
    global.cancelAnimationFrame = (id) => {
        clearTimeout(id)
    }

    // add canvas element
    createCanvasTag(window)
}

/**
 * @param {Window & globalThis} window
 * @returns {HTMLElement}
 */
function createCanvasTag(window) {
    const _createElement = global.window.document.createElement

    /**
     * @param {string} tagName
     * @param {*} options
     */
    window.document.createElement = function (tagName, options) {
        const el = _createElement.apply(window.document, arguments)
        if ('canvas' === tagName.toLowerCase()) {
            el.getContext = function (type) {
                if (!this.context) {
                    this.context = createContext2d(this)
                }
                return this.context
            }
            el.width = 300
            el.height = 150
        }
        return el
    }
}

function createContext2d(canvas) {
    const ctx = {
        canvas,

        fillStyle: '#000000',
        font: '10px sans-serif',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        imageSmoothingEnabled: true,
        lineDashOffset: 0,
        lineWidth: 1,
        strokeStyle: '#000000',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        textRendering: 'auto',
    }

    const fn = () => {}
    const methods =
        'getContextAttributes,drawImage,beginPath,fill,stroke,clip,isPointInPath,isPointInStroke,createLinearGradient,createRadialGradient,createConicGradient,createPattern,createImageData,getImageData,putImageData,setLineDash,getLineDash,closePath,moveTo,lineTo,quadraticCurveTo,bezierCurveTo,arcTo,rect,roundRect,arc,ellipse,clearRect,fillRect,strokeRect,save,restore,reset,isContextLost,fillText,strokeText,measureText,scale,rotate,translate,transform,getTransform,setTransform,resetTransform,drawFocusIfNeeded,canvas,globalAlpha,globalCompositeOperation,strokeStyle,fillStyle,filter,imageSmoothingEnabled,lineWidth,lineCap,lineJoin,miterLimit,lineDashOffset,shadowOffsetX,shadowOffsetY,shadowBlur,shadowColor,font,textAlign,textBaseline,direction,letterSpacing,fontKerning,fontStretch,fontVariantCaps,textRendering,wordSpacing'

    for (const method of methods.split(',')) {
        ctx[method] = fn
    }

    return ctx
}

function formatArgs(args) {
    const result = []
    const literals = ['number', 'string']
    for (const arg of args) {
        const type = typeof arg
        if (literals.indexOf(type) >= 0) {
            result.push(arg)
        } else if ('boolean' === type) {
            result.push(`bool(${arg ? 'true' : 'false'})`)
        } else if (undefined === arg) {
            result.push('undefined')
        } else if (null === arg) {
            result.push('null')
        } else {
            result.push(arg.toString())
        }
    }
    return result
}
