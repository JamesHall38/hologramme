import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

const Model = () => {
    const gui = new dat.GUI({ closed: true })
    const lightsFolder = gui.addFolder('Lights').close()
    const generalFolder = gui.addFolder('General').close()
    const debugObject = {
        model: '/METAKONZ.glb',
        rotate: true,
        envMapIntensity: 1,
        scale: 1
    }
    gui.add(debugObject, 'rotate')

    let scene, renderer
    let windowWidth, windowHeight

    const views = {
        right: {
            left: 0.6,
            bottom: 0.5,
            width: 0.4,
            height: 0.5,
            background: new THREE.Color(0.5, 0.5, 0.7),
            eye: { x: 0, y: 0, z: -5 },
            up: [1, 0, 0],
            fov: 45,
            updateCamera: function (camera, scene) {
                if (debugObject.rotate)
                    scene.rotation.y += 0.01
                camera.lookAt(0, 0, 0)
            }
        },
        left: {
            left: 0,
            bottom: 0.5,
            width: 0.4,
            height: 0.5,
            background: new THREE.Color(0.7, 0.5, 0.5),
            eye: { x: 0, y: 0, z: 5 },
            up: [1, 0, 0],
            fov: 45,
            updateCamera: function (camera, scene) {
                camera.lookAt(0, 0, 0)
            }
        },
        top: {
            left: 0.25,
            bottom: 0,
            width: 0.5,
            height: 0.5,
            background: new THREE.Color(0.5, 0.7, 0.7),
            eye: { x: 3, y: 0, z: 3 },
            up: [0, 1, 0],
            fov: 60,
            updateCamera: function (camera, scene) {
                camera.lookAt(0, 0, 0)
            }
        }
    }

    const container = document.getElementById('container')

    for (const [key, value] of Object.entries(views)) {
        const index = key === 'right' ? 2 : key === 'left' ? 3 : 4
        const view = value

        const camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 1, 10000)
        camera.position.fromArray([view.eye.x, view.eye.y, view.eye.z])
        camera.up.fromArray(view.up)
        view.camera = camera

        gui.addFolder(key).close()
        gui.folders[index]
            .add(camera, 'fov')
            .min(0).max(200).step(1)
        gui.folders[index]
            .add(camera.position, 'x')
            .min(-100).max(100).step(0.5)
        gui.folders[index]
            .add(camera.position, 'y')
            .min(-100).max(100).step(0.5)
        gui.folders[index]
            .add(camera.position, 'z')
            .min(-100).max(100).step(0.5)

    }

    scene = new THREE.Scene()
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    let envIndex

    const getEnvMap = (envNum) => {
        envIndex = envNum
        const environmentMap = cubeTextureLoader.load([
            `/environmentMaps/${envNum}/px.jpg`,
            `/environmentMaps/${envNum}/nx.jpg`,
            `/environmentMaps/${envNum}/py.jpg`,
            `/environmentMaps/${envNum}/ny.jpg`,
            `/environmentMaps/${envNum}/pz.jpg`,
            `/environmentMaps/${envNum}/nz.jpg`
        ])
        environmentMap.encoding = THREE.sRGBEncoding
        environmentMap.userData.name = envNum
        return environmentMap
    }

    const environmentMap = getEnvMap(3)
    // scene.background = environmentMap
    scene.environment = environmentMap

    lightsFolder.add(scene, 'environment', {
        0: getEnvMap(0),
        1: getEnvMap(1),
        2: getEnvMap(2),
        3: getEnvMap(3),
    }).onChange((test) => {
        envIndex = test.userData.name
        if (!bg.blackBackground)
            scene.background = getEnvMap(envIndex)
    })

    const updateAllMaterials = () => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMap = environmentMap
                child.material.envMapIntensity = debugObject.envMapIntensity
                child.material.needsUpdate = true
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }
    debugObject.envMapIntensity = 2.5
    lightsFolder.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)

    const loadModel = () => {
        const gltfLoader = new GLTFLoader()
        gltfLoader.load(
            debugObject.model,
            (gltf) => {
                const model = gltf.scene
                // model.rotation.x = -Math.PI
                model.visible = true
                const borderBox = new THREE.Box3().setFromObject(model)
                const center = borderBox.getCenter(new THREE.Vector3())
                const size = borderBox.getSize(new THREE.Vector3())

                const maxAxis = Math.max(size.x, size.y, size.z)
                model.scale.multiplyScalar(3.0 / maxAxis)
                borderBox.setFromObject(model)
                borderBox.getCenter(center)
                borderBox.getSize(size)
                model.position.copy(center).multiplyScalar(-1)
                model.position.y -= (size.y * 0.5) - 1.5
                updateAllMaterials()
                scene.add(gltf.scene)

                generalFolder.add(gltf.scene.rotation, 'y').min(- Math.PI).max(Math.PI).step(0.001).name('rotation')
            }
        )
    }

    loadModel()

    gui.add(debugObject, 'model', {
        Flayed: '/FLAYED.glb',
        Metakonz: '/METAKONZ.glb',
    })
        .onChange(() => {
            scene.children.forEach(child => {
                if (child.type === 'Group')
                    child.visible = false
            })
            loadModel()
        })

    generalFolder.add(scene.position, 'y').min(- 10).max(10).step(0.1)
    generalFolder.add(debugObject, 'scale').min(0).max(3).step(0.05).onChange(() => {
        scene.scale.set(debugObject.scale, debugObject.scale, debugObject.scale)
    })

    const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.far = 15
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.normalBias = 0.05
    directionalLight.position.set(0, -3, - 5)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight('#ffffff', 1)
    directionalLight2.castShadow = true
    directionalLight2.shadow.camera.far = 15
    directionalLight2.shadow.mapSize.set(1024, 1024)
    directionalLight2.shadow.normalBias = 0.05
    directionalLight2.position.set(0, -3, 5)
    scene.add(directionalLight2)

    lightsFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('light1Intensity')
    lightsFolder.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
    lightsFolder.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
    lightsFolder.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

    lightsFolder.add(directionalLight2, 'intensity').min(0).max(10).step(0.001).name('light2Intensity')
    lightsFolder.add(directionalLight2.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
    lightsFolder.add(directionalLight2.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
    lightsFolder.add(directionalLight2.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')


    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ReinhardToneMapping
    renderer.toneMappingExposure = 3
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    // renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    generalFolder.add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
        .onFinishChange(() => {
            renderer.toneMapping = Number(renderer.toneMapping)
            updateAllMaterials()
        })
    generalFolder.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

    for (const [key] of Object.entries(views)) {
        const index = key === 'right' ? 2 : key === 'left' ? 3 : 4
        gui.folders[index]
            .add(views[key], 'left')
            .min(0).max(1).step(0.0001)
        gui.folders[index]
            .add(views[key], 'width')
            .min(0).max(1).step(0.0001)
        gui.folders[index]
            .add(views[key], 'height')
            .min(0).max(1).step(0.0001)
        gui.folders[index]
            .add(views.top, 'bottom')
            .min(0).max(1).step(0.001)
    }

    const bg = { blackBackground: false }
    gui.add(bg, 'blackBackground')
        .onChange(() => {
            if (bg.blackBackground)
                scene.background = new THREE.Color(0, 0, 0)
            else
                scene.background = getEnvMap(envIndex)
        })

    function updateSize() {
        if (windowWidth !== window.innerWidth || windowHeight !== window.innerHeight) {
            windowWidth = window.innerWidth
            windowHeight = window.innerHeight
            renderer.setSize(windowWidth, windowHeight)
        }
    }

    function render() {
        updateSize()
        for (let i = 0; i < 3; i++) {
            const index = i === 0 ? 'right' : i === 1 ? 'left' : 'top'
            const view = views[index]
            const camera = view.camera

            view.updateCamera(camera, scene)

            const left = Math.floor(windowWidth * view.left)
            const bottom = Math.floor(windowHeight * view.bottom)
            const width = Math.floor(windowWidth * view.width)
            const height = Math.floor(windowHeight * view.height)

            renderer.setViewport(left, bottom, width, height)
            renderer.setScissor(left, bottom, width, height)
            renderer.setScissorTest(true)
            renderer.setClearColor(view.background)

            camera.aspect = width / height
            camera.updateProjectionMatrix()

            renderer.render(scene, camera)
        }
    }

    function animate() {
        render()
        requestAnimationFrame(animate)
    }

    animate()
    return null
}

export default Model