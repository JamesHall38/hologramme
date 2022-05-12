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



        this.tatt = true

        this.test = null
        this.files = null
        this.firebaseLoader = null


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

        this.display = window.location.pathname === '/display' ? true : false

        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()

        this.camera = new Camera()
        this.renderer = new Renderer()
        this.resources = new Resources(this.source)
        this.environment = new Environment()
        this.loadModel = new LoadModel()

        this.Rotate = true
        if (this.display) {
            this.guiPannel.getRotate()
        }
        this.guiPannel.debug.add(this, 'Rotate').onFinishChange(() => {
            if (this.guiPannel.debugObject.SendToHologram) {
                this.guiPannel.rotate()
            }
        })

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

        this.guiPannel.update()

        if (this.files)
            this.trigger('ready')

        // console.log(this.source)
        // this.source = this.guiPannel.getSource()

        // if (this.source !== null && this.display && this.tatt) {
        //     console.log('jhzbefbhjz')

        //     this.tatt = false
        // }


        if (this.Rotate) {
            this.scene.rotation.y += 0.01
        }

        // is   console.log('test')
        this.camera.update()
        this.renderer.update()
        this.loadModel.update()
        // }


        this.guiPannel.stats.end();
    }
}
