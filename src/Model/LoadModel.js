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
                    child.children.forEach(childd => {
                        childd.visible = false
                    })
            })
            this.resource.re = this.resources.items['fileTEST']
            this.setModel()
        })

        this.resources.on('ready', () => {
            // console.log(this.experience.source)
            if (this.experience.display)
                this.resource = { re: this.resources.items[this.experience.source[0].name] }
            else
                this.resource = { re: this.resources.items[this.experience.source[0].name] }

            this.setModel()
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
        this.model.position.y -= (size.y * 0.5) - 1.25
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


        if (this.experience.display)
            this.experience.guiPannel.getRotate()

        this.debug.add(this.debugObject, 'rotation')
            .min(-Math.PI)
            .max(Math.PI)
            .name('rotation')
            .onChange(() => {
                this.model.rotation.y = this.debugObject.rotation
                // if (this)
                this.experience.guiPannel.rotate()
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

            // if (!this.experience.display) {

            this.resource.re.animations.forEach((animation) => {
                const debugObject = {
                    play: () => {
                        this.animation.play(animation.name)
                        if (this.experience.guiPannel.debugObject.SendToHologram)
                            this.experience.guiPannel.animation(animation.name)
                    }
                }
                this.animation.actions[animation.name] = this.animation.mixer.clipAction(animation)
                this.debugFolder.add(debugObject, `play`).name(animation.name)

            })
            this.animation.actions.current = this.animation.actions[Object.keys(this.animation.actions)[0]]
            this.animation.current = this.animation.actions.current

            this.experience.guiPannel.getAnimation()

            // Play the action
            this.animation.play = (name) => {
                const newAction = this.animation.actions[name]

                const oldAction = this.animation.current

                newAction.reset()
                newAction.play()
                newAction.crossFadeFrom(oldAction, 1)

                this.animation.current = newAction
            }
        }
    }

    update() {

        if (this.animation && this.experience.test && this.experience.display) {
            if (this.experience.test.name !== this.animation.current._clip.name) {
                console.log('test=', this.experience.test.name, 'current=', this.animation.current._clip.name)
                this.animation.play(this.experience.test.name)
            }

            // this.animation.play(test.name)
            // console.log(test)
        }

        if (this.animation)
            this.animation.mixer.update(this.time.delta * 0.001)
    }
}