import '../App.css'
import * as THREE from 'three'
import Name from './World/Name'

const shaderMaterial = (shader) => {
    shader.uniforms.face = { value: 0 }
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        out vec3 worldPosition;
        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        worldPosition = vec3(modelMatrix * vec4(position, 1.0));
        `
    )
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        
        in vec3 worldPosition;
        uniform int face;
        
        const vec2 corners[4] = vec2[](vec2(0.5, 0.5), vec2(-0.5, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));
        bool order(vec2 A, vec2 B, vec2 C) {
            return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
        }
        bool intersect(vec2 A, vec2 B, vec2 C, vec2 D) {
            return order(A,C,D) != order(B,C,D) && order(A,B,C) != order(A,B,D);
        }
        `
    )
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <clipping_planes_fragment>',
        `
        #include <clipping_planes_fragment>
        vec2 a = worldPosition.xz;
        vec2 b = cameraPosition.xz;
        vec2 aa ;
        vec2 bb ; 
        if (bool(mod(float(face),2.0))){
            aa = worldPosition.xy;
            bb = cameraPosition.xy; 
        }
        else{
            aa = worldPosition.yz;
            bb = cameraPosition.yz;
        }
        int next = int(mod(float(face + 1), 4.0));
        vec2 c = corners[face];
        vec2 d = corners[next];
        if (!(intersect(a, b, c, d) && intersect(aa, bb, c, d))) {
            discard;
        }
        `
    )
}
export default class LoadModel {
    constructor(IsCard, experience) {
        this.isCard = IsCard
        // if (num === 0)
        this.experience = experience
        this.playing = 'none'

        // else if (num === 1)
        // if (this.isCard)
        //     this.experience = new CardExperience2()
        // else
        //     this.experience = new Experience()



        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        if (this.debug)
            this.debugModelFolder = this.debug.addFolder('Model').close()

        this.importedLoaded = false

        this.resource = { re: null }


        this.experience.on('ready', () => {
            if (!this.importedLoaded) {
                console.log(this.experience.modelType)
                if (this.experience.modelType === 'gltf')
                    this.resources.addGLTF(this.experience.files)
                else if (this.experience.modelType === 'img') {
                    console.log('IMG')
                    this.resources.addImg(this.experience.files)
                }
                else if (this.experience.modelType === 'vid')
                    this.resources.addVid(this.experience.files)
                else if (this.experience.modelType === 'obj')
                    this.resources.addOBJ(this.experience.files)
                else if (this.experience.modelType === 'fbx')
                    this.resources.addFBX(this.experience.files)

                this.importedLoaded = true
                this.experience.onSelect = true
            }
        })

        this.resources.on('importedReady', () => {

            // this.scene.children.forEach(child => {
            //     if (child.type === 'Group')
            //         child.children.forEach(childd => {
            //             childd.visible = false
            //         })
            // })
            console.log('import ready')
            this.setResources()
        })

        // this.resources.on('ready', () => {
        //     // console.log(this.experience.source)
        //     if (this.experience.display)
        //         this.resource = { re: this.resources.items[this.experience.source[0].name] }
        //     else
        //         this.resource = { re: this.resources.items[this.experience.source[0].name] }
        //     // this.resource = { re:  }
        //     // if (this.experience.userSource)
        //     this.setModel()
        //     // console.log(this.resources)
        // })
    }

    setResources() {
        console.log(this.experience.modeltype)
        if (this.experience.modelType === 'obj'
            || this.experience.modelType === 'fbx'
            // || this.experience.modelType === ''
        ) {
            this.resource.re = this.resources.items['file']
            console.log(this.resource.re)

            this.model = this.resource.re
            this.setModel()
        }
        else if (this.experience.modelType === 'gltf') {
            this.resource.re = this.resources.items['file']
            console.log(this.resource.re)

            this.model = this.resource.re.scene
            this.setModel()

        }
        else if (this.experience.modelType === 'img') {
            this.setImgPresentation(this.resources.items['file'])
        }
        else if (this.experience.modelType === 'vid') {
            this.setVidPresentation(this.resources.items['file'])
        }
    }

    setImgPresentation(img) {
        console.log(img)
        img.encoding = THREE.sRGBEncoding

        const material = new THREE.MeshPhongMaterial({ map: img })
        console.log(material)
        if (this.isCard)
            material.onBeforeCompile = (shader) => { shaderMaterial(shader) }

        let geometry
        if (this.experience.resources.ratio < 1)
            geometry = new THREE.BoxBufferGeometry(this.experience.resources.ratio, 1)
        else
            geometry = new THREE.BoxBufferGeometry(1, 1 / this.experience.resources.ratio)
        this.model = new THREE.Mesh(geometry, material)

        if (this.isCard)
            this.model.position.set(0, 0.075, -0.5)
        else
            this.model.position.set(0, 0, 0)

        this.experience.removeLoadingBox()
        this.scene.add(this.model)

        if (this.isCard)
            window.requestAnimationFrame(() => {
                this.time.tick()
            })

        // const group = new THREE.Group()
        // group.add(mesh)
        // group.add(mesh)
        // this.scene.add(mesh)
        // this.resource.re = group
        // this.setModel()
    }

    setVidPresentation(imgtexture) {


        console.log('VIDEOOOO')
        // const material = new THREE.MeshPhongMaterial({ map: texture })
        // material.onBeforeCompile = (shader) => { shaderMaterial(shader) }


        if (!this.isCard) {
            const texture = new THREE.VideoTexture(this.experience.resources.video)
            texture.encoding = THREE.sRGBEncoding
            this.videoMaterial = new THREE.MeshStandardMaterial({ map: texture })
            this.videoMaterial.onBeforeCompile = (shader) => {
                shader.vertexShader = shader.vertexShader
                    .replace(
                        `#include <fog_vertex>`,
                        `#include <fog_vertex>
                        gl_Position = vec4(position, 1.0);`)
            }
            this.videoGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)

        }
        else {
            imgtexture.encoding = THREE.sRGBEncoding
            this.videoMaterial = new THREE.MeshStandardMaterial({ map: imgtexture })
            this.videoGeometry = new THREE.PlaneBufferGeometry(1, 0.9)
        }
        this.model = new THREE.Mesh(this.videoGeometry, this.videoMaterial)
        this.model.position.set(0, 0.05, 0.5)
        console.log(this.model)

        this.experience.removeLoadingBox()
        this.scene.add(this.model)
        if (this.isCard)
            window.requestAnimationFrame(() => {
                this.time.tick()
            })

    }

    setModel() {

        console.log(this.model)
        // this.model.rotation.x = -Math.PI
        this.model.children[0].visible = true
        const borderBox = new THREE.Box3().setFromObject(this.model)
        const center = borderBox.getCenter(new THREE.Vector3())
        const size = borderBox.getSize(new THREE.Vector3())

        const maxAxis = Math.max(size.x, size.y, size.z)
        this.model.scale.multiplyScalar(1.0 / maxAxis)
        borderBox.setFromObject(this.model)
        borderBox.getCenter(center)
        borderBox.getSize(size)
        this.model.position.copy(center).multiplyScalar(-1)
        this.model.position.y = -(size.y * 0.5)
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

        if (this.isCard) {
            this.model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.onBeforeCompile = (shader) => { shaderMaterial(shader) }
                    this.experience.removeLoadingBox()
                    this.scene.add(this.model)
                    if (this.isCard)
                        // window.requestAnimationFrame(() => {
                        this.time.tick()
                    // })
                }
            })

            // window.requestAnimationFrame(() => {
            //     this.time.tick()
            // })

        }
        else {
            this.scene.add(this.model)
            if (this.isCard)
                window.requestAnimationFrame(() => {
                    this.time.tick()
                })
        }
        // const button = this.experience.world.card.model.children.find(child => child.name === 'Button')
        // button.material.visible = false
        // const buttonLED = this.experience.world.card.model.children.find(child => child.name === 'AnimationLED')
        // buttonLED.material.visible = false

        this.setSettings()
        if (this.isCard)
            this.model.position.z = -0.2
        else
            this.model.position.z = 0

        if (this.debug) {
            this.debugObject = {
                scale: 1,
                rotation: 0,
            }

            this.debugModelFolder.add(this.debugObject, 'scale')
                .min(0)
                .max(1.3)
                .name('scale')
                .onChange((event) => {
                    this.experience.settings.scale = event
                    this.model.scale.set(this.debugObject.scale, this.debugObject.scale, this.debugObject.scale)
                })


            // if (this.experience.display)
            // this.experience.guiPannel.getRotate()

            this.debug.add(this.debugObject, 'rotation')
                .min(-Math.PI)
                .max(Math.PI)
                .name('rotation')
                .onChange((event) => {
                    this.experience.settings.rotation = event
                    this.model.rotation.y = this.debugObject.rotation
                    // if (this)
                    // this.experience.guiPannel.rotate()
                }
                )
            this.debugModelFolder.add(this.model.position, 'x')
                .min(-1)
                .max(1)
                .name('positionX')
                .onChange((event) => { this.experience.settings.modelPositionX = event })
            this.debugModelFolder.add(this.model.position, 'y')
                .min(-1)
                .max(1)
                .name('positionY')
                .onChange((event) => { this.experience.settings.modelPositionY = event })

            this.debugModelFolder.add(this.model.position, 'z')
                .min(-1)
                .max(1)
                .name('positionZ')
                .onChange((event) => { this.experience.settings.modelPositionZ = event })
        }


        this.setAnimation()
        if (this.isCard)
            // window.requestAnimationFrame(() => {
            this.time.tick()
        // })
    }

    setSettings = () => {
        const set = this.experience.settings
        console.log(this.experience.settings)
        // this.model.scale.multiplyScalar(set.scale)
        this.model.position.x = set.modelPositionX
        this.model.position.y = set.modelPositionY
        this.model.position.z = set.modelPositionZ
        this.model.rotation.x = set.rotation
    }

    setAnimation() {
        if (this.resource.re.animations.length > 0) {
            this.animation = {}

            if (this.isCard) {
                const waitForCard = () => {
                    if (this.experience.world.card) {

                        const logo = this.experience.world.card.model.children.find(child => child.name === 'LOGO')
                        logo.material.visible = false

                        const originalButton = this.experience.world.card.model.children.find(child => child.name === 'Button')
                        originalButton.material.visible = true
                        const originalButtonLED = this.experience.world.card.model.children.find(child => child.name === 'AnimationLED')
                        originalButtonLED.material.visible = true

                        this.experience.groups = this.resource.re.animations.map((animation, index) => {
                            const group = new THREE.Group()
                            const animName = new Name(this.experience, false, animation.name, 0.35 - index * 0.22)
                            this.experience.animationsNames.push(animName)
                            group.add(animName.cube)

                            if (index === 0) {
                                originalButton.position.y = 0.35
                                originalButtonLED.position.y = 0.35

                                group.add(originalButton)
                                group.add(originalButtonLED)

                                originalButton.userData = { name: animation.name }
                                this.experience.buttonArray.push({ object: originalButton, name: animation.name })
                            } else {
                                const button = originalButton.clone()
                                const buttonLED = originalButtonLED.clone()

                                buttonLED.material = new THREE.MeshBasicMaterial({ color: 0x000000 })
                                buttonLED.material.onBeforeCompile = (shader) => { shaderMaterial(shader) }


                                button.position.y = 0.35 - index * 0.22
                                buttonLED.position.y = 0.35 - index * 0.22

                                group.add(button)
                                group.add(buttonLED)

                                button.userData.name = animation.name
                                this.experience.buttonArray.push({ object: button, name: animation.name })
                            }
                            if (index > 5) {
                                animName.cube.visible = false
                            }
                            this.scene.add(group)
                            return group
                        })
                    }
                    else
                        setTimeout(waitForCard, 200)
                }
                waitForCard()
            }


            console.log(this.experience.animationsNames)

            // Mixer
            this.animation.mixer = new THREE.AnimationMixer(this.model)

            if (this.debugFolder)
                this.debugFolder.destroy()

            if (this.debug) {

                // Actions
                this.animation.actions = {}
                this.debugFolder = this.debug.addFolder('Animations')

                // if (!this.experience.display) {

                this.resource.re.animations.forEach((animation) => {
                    const debugObject = {
                        play: () => {
                            this.animation.play(animation.name)
                            // if (this.experience.guiPannel.debugObject.SendToHologram)
                            //     this.experience.guiPannel.animation(animation.name)
                        }
                    }
                    this.animation.actions[animation.name] = this.animation.mixer.clipAction(animation)
                    this.debugFolder.add(debugObject, `play`).name(animation.name)
                })
                // }

                this.animation.actions.current = this.animation.actions[Object.keys(this.animation.actions)[0]]
                this.animation.current = this.animation.actions.current

                // this.experience.guiPannel.getAnimation()
            }

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
        if (this.experience.animationsNames) {

            if (this.animation)
                this.experience.animationsNames.forEach((name) => {
                    name.update()
                })

        }
        if (this.animation) {
            if (this.playing !== 'none') {
                if (this.playing !== this.animation.current._clip.name) {
                    this.animation.play(this.playing)
                    console.log(this.playing)
                }
            }
            else {
                if (this.animation.current)
                    this.animation.current.stop()
            }
        }

        if (this.animation)
            this.animation.mixer.update(this.time.delta * 0.001)
    }
}