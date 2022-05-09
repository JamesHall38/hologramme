import * as THREE from 'three'
import * as dat from 'lil-gui'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'
import LoadModel from './LoadModel.js'
import Environment from './Environment.js'
import EventEmitter from './Utils/EventEmitter.js'

let instance = null

export default class Experience extends EventEmitter {
    constructor() {
        super()

        this.files = null

        // Singleton
        if (instance) {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Setup
        this.debug = new dat.GUI()
        this.debug.domElement.id = 'gui'

        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.environment = new Environment()
        this.loadModel = new LoadModel()


        this.rotate = true
        this.debug.add(this, 'rotate')

        // Resize event
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        if (this.files)
            this.trigger('ready')

        if (this.rotate) {
            this.scene.rotation.y += 0.01
        }

        this.camera.update()
        this.renderer.update()
        this.loadModel.update()
    }
}
