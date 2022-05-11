import * as THREE from 'three'
import Experience from './Experience.js'

const views = {
    right: {
        left: 0.6,
        bottom: 0.5,
        width: 0.4,
        height: 0.5,
        background: new THREE.Color(0.5, 0.5, 0.7),
        eye: { x: 0, y: 0, z: -5 },
        up: [-1, 0, 0],
        fov: 55,
    },
    left: {
        left: 0,
        bottom: 0.5,
        width: 0.4,
        height: 0.5,
        background: new THREE.Color(0.7, 0.5, 0.5),
        eye: { x: 0, y: 0, z: 5 },
        up: [-1, 0, 0],
        fov: 55,
    },
    top: {
        left: 0.25,
        bottom: 0,
        width: 0.5,
        height: 0.5,
        background: new THREE.Color(0.5, 0.7, 0.7),
        eye: { x: 5, y: 0, z: 0 },
        up: [0, 1, 0],
        fov: 60,
    }
}


export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        // Debug
        this.debugFolder = this.debug.addFolder('Cameras').close()
        this.rightFolder = this.debugFolder.addFolder('Right').close()
        this.leftFolder = this.debugFolder.addFolder('Left').close()
        this.topFolder = this.debugFolder.addFolder('Top').close()


        this.setInstance()

    }

    setInstance() {
        this.right = new THREE.PerspectiveCamera(views.right.fov, this.sizes.width / this.sizes.height, 1, 10000)
        this.left = new THREE.PerspectiveCamera(views.left.fov, this.sizes.width / this.sizes.height, 1, 10000)
        this.top = new THREE.PerspectiveCamera(views.top.fov, this.sizes.width / this.sizes.height, 1, 10000)

        this.right.position.fromArray([views.right.eye.x, views.right.eye.y, views.right.eye.z])
        this.left.position.fromArray([views.left.eye.x, views.left.eye.y, views.left.eye.z])
        this.top.position.fromArray([views.top.eye.x, views.top.eye.y, views.top.eye.z])

        this.right.up.fromArray(views.right.up)
        this.left.up.fromArray(views.left.up)
        this.top.up.fromArray(views.top.up)


        for (let i = 0; i < 3; i++) {

            const folder = i === 0 ? this.rightFolder : i === 1 ? this.leftFolder : this.topFolder
            const camera = i === 0 ? this.right : i === 1 ? this.left : this.top

            // Debug
            folder
                .add(camera, 'fov')
                // .name('envMapIntensity')
                .min(0)
                .max(200)
                .step(1)
            folder
                .add(camera.position, 'x')
                // .name('envMapIntensity')
                .min(-100)
                .max(100)
                .step(0.5)
            folder
                .add(camera.position, 'y')
                // .name('envMapIntensity')
                .min(-100)
                .max(100)
                .step(0.5)
            folder
                .add(camera.position, 'z')
                // .name('envMapIntensity')
                .min(-100)
                .max(100)
                .step(0.5)

        }
    }

    resize() {
        this.right.aspect = this.sizes.width / this.sizes.height
        this.right.updateProjectionMatrix()
        this.left.aspect = this.sizes.width / this.sizes.height
        this.left.updateProjectionMatrix()
        this.top.aspect = this.sizes.width / this.sizes.height
        this.top.updateProjectionMatrix()
    }

    update() {
        this.right.lookAt(0, 0, 0)
        this.left.lookAt(0, 0, 0)
        this.top.lookAt(0, 0, 0)
    }
}