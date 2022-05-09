import * as THREE from 'three'
import Experience from './Experience.js'


export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Debug
        this.debugFolder = this.debug.addFolder('environment').close()
        this.light1Folder = this.debugFolder.addFolder('sunLight1').close()
        this.light2Folder = this.debugFolder.addFolder('sunLight2').close()

        this.cubeTextureLoader = new THREE.CubeTextureLoader()

        this.resources.on('ready', () => {
            this.setSunLight()
            this.setEnvironmentMap(1)
        })


    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 3)
        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 15
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(0, 3, -5)
        this.scene.add(this.sunLight)

        this.sunLight2 = new THREE.DirectionalLight('#ffffff', 3)
        this.sunLight2.castShadow = true
        this.sunLight2.shadow.camera.far = 15
        this.sunLight2.shadow.mapSize.set(1024, 1024)
        this.sunLight2.shadow.normalBias = 0.05
        this.sunLight2.position.set(0, 3, -5)
        this.scene.add(this.sunLight2)


        for (let i = 0; i < 2; i++) {

            const folder = i === 0 ? this.light1Folder : this.light2Folder
            // Debug
            folder
                .add(this.sunLight, 'intensity')
                .name('sunLightIntensity')
                .min(0)
                .max(10)
                .step(0.001)

            folder
                .add(this.sunLight.position, 'x')
                .name('sunLightX')
                .min(- 5)
                .max(5)
                .step(0.001)

            folder
                .add(this.sunLight.position, 'y')
                .name('sunLightY')
                .min(- 5)
                .max(5)
                .step(0.001)

            folder
                .add(this.sunLight.position, 'z')
                .name('sunLightZ')
                .min(- 5)
                .max(5)
                .step(0.001)

        }
    }

    updateMaterials() {
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMap = this.environmentMap.texture
                child.material.envMapIntensity = this.environmentMap.intensity
                child.material.needsUpdate = true
            }
        })
    }

    setEnvironmentMap(envNum) {
        this.environmentMap = {}
        this.environmentMap.intensity = 0.4
        this.environmentMap.texture = this.cubeTextureLoader.load([
            `/environmentMaps/${envNum}/px.jpg`,
            `/environmentMaps/${envNum}/nx.jpg`,
            `/environmentMaps/${envNum}/py.jpg`,
            `/environmentMaps/${envNum}/ny.jpg`,
            `/environmentMaps/${envNum}/pz.jpg`,
            `/environmentMaps/${envNum}/nz.jpg`
        ])

        this.envIndex = envNum

        // this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap.texture.encoding = THREE.sRGBEncoding
        this.scene.userData.name = envNum
        this.debugFolder
            .add(this.scene, 'environment', {
                0: this.getEnvironmentMap(0),
                1: this.getEnvironmentMap(1),
                2: this.getEnvironmentMap(2),
                3: this.getEnvironmentMap(3),
            })
            .onFinishChange(() => {
                this.envIndex = this.scene.userData.name
                this.environmentMap.texture = this.getEnvironmentMap(this.envIndex)
                // this.scene.environment = Number(this.scene.environment)
                this.updateMaterials()

                // this.scene.environment
                if (!this.renderer.bg.blackBackground)
                    this.scene.background = this.scene.environment
            })
        this.scene.environment = this.environmentMap.texture

        // Debug
        this.debugFolder
            .add(this.environmentMap, 'intensity')
            .name('envMapIntensity')
            .min(0)
            .max(4)
            .step(0.001)
            .onChange(() => {
                this.updateMaterials()
            })

        this.updateMaterials()
    }


    updateMaterials() {
        this.scene.children.forEach((group) => {
            group.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }
            })
        })
    }



    getEnvironmentMap(envNum) {
        const environmentMap = {}
        environmentMap.intensity = 0.4
        environmentMap.texture = this.cubeTextureLoader.load([
            `/environmentMaps/${envNum}/px.jpg`,
            `/environmentMaps/${envNum}/nx.jpg`,
            `/environmentMaps/${envNum}/py.jpg`,
            `/environmentMaps/${envNum}/ny.jpg`,
            `/environmentMaps/${envNum}/pz.jpg`,
            `/environmentMaps/${envNum}/nz.jpg`
        ])

        this.envIndex = envNum

        // this.environmentMap.texture = this.resources.items.environmentMapTexture
        environmentMap.texture.encoding = THREE.sRGBEncoding
        this.scene.userData.name = envNum
        // this.scene.environment = this.environmentMap.texture

        this.environmentMap.texture = environmentMap.texture
        this.updateMaterials()

        return environmentMap.texture
    }

}
