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
            this.resource = { re: this.resources.items['METAKONZModel'] }
            this.setModel()

            this.debug.add(this.resource, 're', {
                METAKONZ: this.resources.items['METAKONZModel'],
                FLAYED: this.resources.items['FLAYEDModel'],
                Fox: this.resources.items['foxModel'],
            })
                .onFinishChange(() => {
                    this.scene.children.forEach(child => {
                        if (child.type === 'Group')
                            child.children[0].visible = false
                    })
                    if (this.debugFolder)
                        this.debugFolder.destroy()

                    this.setModel()
                })
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

        this.model.position.x = 0
        this.model.position.y = -1.5
        this.model.position.z = 0

        this.setAnimation()
    }

    setAnimation() {
        console.log(this.resource.re.animations)
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
                const oldAction = this.animation.actions.current

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