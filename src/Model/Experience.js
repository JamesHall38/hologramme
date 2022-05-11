import * as THREE from 'three'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import Resources from './Utils/Resources.js'

import Debug from './Debug.js'
import LoadModel from './LoadModel.js'
import Environment from './Environment.js'
import EventEmitter from './Utils/EventEmitter.js'

let instance = null

export default class Experience extends EventEmitter {
    constructor(_source) {
        super()

        this.source = _source

        this.files = null
        // this.source = null

        // Singleton
        if (instance) {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Setup
        this.guiPannel = new Debug()
        this.debug = this.guiPannel.debug.addFolder('Edit').close()
        this.debug.domElement.id = 'gui'


        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(this.source)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.environment = new Environment()
        this.loadModel = new LoadModel()

        this.Rotate = true
        this.guiPannel.debug.add(this, 'Rotate')

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
        this.guiPannel.stats.begin();

        if (this.files)
            this.trigger('ready')

        if (this.Rotate) {
            this.scene.rotation.y += 0.01
        }

        this.camera.update()
        this.renderer.update()
        this.loadModel.update()

        this.guiPannel.stats.end();
    }
}
