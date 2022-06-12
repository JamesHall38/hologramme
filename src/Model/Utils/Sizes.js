import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter {
    constructor() {
        super()

        this.resize()

        // Resize event
        window.addEventListener('resize', () => {
            this.resize()
            this.trigger('resize')
        })
    }
    resize() {
        if (window.location.pathname === '/display' || window.location.pathname.endsWith('/edit')) {
            this.width = window.innerWidth
            this.height = window.innerHeight
        }
        // else if (window.location.pathname === '/') {
        //     this.width = window.innerHeight / 1.5
        //     this.height = window.innerHeight * 1
        // }
        else {
            this.width = window.innerHeight / 3
            this.height = window.innerHeight / 2
        }
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)
    }
    cardReset() {
        this.width = window.innerHeight / 3
        this.height = window.innerHeight / 2
        this.trigger('resize')
    }
    cardResize() {
        this.width = window.innerHeight / 2
        this.height = window.innerHeight * 0.8
        // this.pixelRatio = Math.min(window.devicePixelRatio, 2)
        this.trigger('resize')
    }
}