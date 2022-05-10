import '../App.css'
import * as THREE from 'three'
import Experience from './Experience.js'


export default class LoadModel {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.Test = this.debug.addFolder('Test')
        const bebi = document.getElementById('test')
        console.log(bebi)
        // this.Test.add(bebi).name('value')
        this.debugModelFolder = this.debug.addFolder('Model').close()

        this.importedLoaded = false

        this.experience.on('ready', () => {
            if (!this.importedLoaded) {
                this.resources.add(this.experience.files)
                this.importedLoaded = true
            }
        })

        this.resources.on('importedReady', () => {
            this.scene.children.forEach(child => {
                if (child.type === 'Group')
                    child.children[0].visible = false
            })
            this.resource.re = this.resources.items['fileTEST']
            this.setModel()
        })

        this.resources.on('ready', () => {
            // this.resource = { re: this.resources.items['foxModel'] }
            this.resource = { re: this.resources.items[this.experience.source[0].name] }
            this.setModel()

            // this.debug.add(this.resource, 're', {
            //     PixelMan: this.resources.items['pixelManModel'],
            //     Fox: this.resources.items['foxModel'],
            // })
            //     .onFinishChange(() => {
            //         this.scene.children.forEach(child => {
            //             if (child.type === 'Group')
            //                 child.children[0].visible = false
            //         })
            //         if (this.debugFolder)
            //             this.debugFolder.destroy()

            //         this.setModel()
            //     })
        })
    }

    setModel() {
        this.model = this.resource.re.scene
        this.scene.add(this.model)
        // this.model.rotation.x = -Math.PI
        this.model.children[0].visible = true
        const borderBox = new THREE.Box3().setFromObject(this.model)
        const center = borderBox.getCenter(new THREE.Vector3())
        const size = borderBox.getSize(new THREE.Vector3())

        const maxAxis = Math.max(size.x, size.y, size.z)
        this.model.scale.multiplyScalar(3.0 / maxAxis)
        borderBox.setFromObject(this.model)
        borderBox.getCenter(center)
        borderBox.getSize(size)
        this.model.position.copy(center).multiplyScalar(-1)
        this.model.position.y -= (size.y * 0.5) - 1.5
        // updateAllMaterials(this.scene, debugObject, environmentMap)
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMap = this.resources.environmentMapTexture
                // child.material.envMapIntensity = debugObject.envMapIntensity
                child.material.needsUpdate = true
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        this.debugObject = {
            scale: 1,
            rotation: 0,
        }

        this.debugModelFolder.add(this.debugObject, 'scale')
            .min(0)
            .max(2)
            .name('scale')
            .onChange(() => {
                this.model.scale.set(this.debugObject.scale, this.debugObject.scale, this.debugObject.scale)
            })
        this.debugModelFolder.add(this.debugObject, 'rotation')
            .min(-Math.PI)
            .max(Math.PI)
            .name('rotation')
            .onChange(() => {
                this.model.rotation.y = this.debugObject.rotation
            }
            )
        this.debugModelFolder.add(this.model.position, 'x')
            .min(-10)
            .max(10)
            .name('positionX')
        this.debugModelFolder.add(this.model.position, 'y')
            .min(-10)
            .max(10)
            .name('positionY')
        this.debugModelFolder.add(this.model.position, 'z')
            .min(-10)
            .max(10)
            .name('positionZ')

        this.setAnimation()
    }

    setAnimation() {
        if (this.resource.re.animations.length > 0) {
            this.animation = {}

            // Mixer
            this.animation.mixer = new THREE.AnimationMixer(this.model)

            if (this.debugFolder)
                this.debugFolder.destroy()
            // Actions
            this.animation.actions = {}
            this.debugFolder = this.debug.addFolder('Animations')

            this.resource.re.animations.forEach((animation) => {
                const debugObject = {
                    play: () => { this.animation.play(animation.name) }
                }
                this.animation.actions[animation.name] = this.animation.mixer.clipAction(animation)
                this.debugFolder.add(debugObject, `play`).name(animation.name)
            })

            // Play the action
            this.animation.play = (name) => {
                const newAction = this.animation.actions[name]
                // const oldAction = this.animation.actions.current

                newAction.reset()
                newAction.play()
                // newAction.crossFadeFrom(oldAction, 1)

                this.animation.actions.current = newAction
            }
        }
    }

    update() {
        if (this.animation)
            this.animation.mixer.update(this.time.delta * 0.001)
    }
}