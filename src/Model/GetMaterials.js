import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import pako from 'pako'
import * as THREE from 'three'


export default function getMaterials(compressedMaterials, card) {

    const decompressed = pako.inflate(compressedMaterials)
    console.log(compressedMaterials, decompressed)
    // const temp = Buffer.from(decompressed).toString();
    // const test = decompressed.buffer()
    // const test = new Uint8Array(decompressed)
    const test = decompressed.buffer

    const blob = new Blob([test], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)

    const gltfLoader = new GLTFLoader()
    gltfLoader.load(url, (gltf) => {

        console.log('gltf = ', gltf)

        let materials = {}
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                // materials.push(child.material)
                materials = { ...materials, [child.material.name]: child.material }
            }
        })
        card.resources.sceneGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material.name !== 'White') {

                console.log(materials, child.material.name)
                if (materials[child.material.name].map)
                    child.material.map = materials[child.material.name].map
                if (materials[child.material.name].alphaMap)
                    child.material.alphaMap = materials[child.material.name].alphaMap
                if (materials[child.material.name].aoMap)
                    child.material.aoMap = materials[child.material.name].aoMap
                if (materials[child.material.name].bumpMap)
                    child.material.bumpMap = materials[child.material.name].bumpMap
                if (materials[child.material.name].displacementMap)
                    child.material.displacementMap = materials[child.material.name].displacementMap
                if (materials[child.material.name].emissiveMap)
                    child.material.emissiveMap = materials[child.material.name].emissiveMap
                if (materials[child.material.name].envMap)
                    child.material.envMap = materials[child.material.name].envMap
                if (materials[child.material.name].lightMap)
                    child.material.lightMap = materials[child.material.name].lightMap
                if (materials[child.material.name].metalnessMap)
                    child.material.metalnessMap = materials[child.material.name].metalnessMap
                if (materials[child.material.name].normalMap)
                    child.material.normalMap = materials[child.material.name].normalMap
                if (materials[child.material.name].roughnessMap)
                    child.material.roughnessMap = materials[child.material.name].roughnessMap

                child.material.needsUpdate = true
            }
        })
    })

    card.resources.trigger('materialsReady')

}