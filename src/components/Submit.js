import {
    getDatabase,
    ref as ref_database,
    set
} from 'firebase/database'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import * as THREE from 'three'
import compression from './Compression'


// DATABASE
const setDatabase = (id, exp, nameFormContent, descriptionFormContent) => {
    console.log('database')
    const db = getDatabase()
    set(ref_database(db, `/users/${id}/card`), {
        modelType: exp.modelType,
        name: nameFormContent,
        description: descriptionFormContent
    })
}

export default function submit(files, card, modelId, exp, setProgress, setCardId, setFiles, nameFormContent, descriptionFormContent) {

    // exp.resources.addGLTF(files)

    // const storage = getStorage()
    // uploadBytesResumable(ref_storage(storage, `/users/${newId}`), exp.loadModel.model)
    //     .on("state_changed", (snapshot) => {
    //         setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100))
    //     })
    // console.log('FILE SENT -> ', newId);

    // setFiles(false)

    // const io = new WebIO();
    const exporter = new GLTFExporter()

    console.log(exp)

    const modelScene = exp.resources.items['file'].scene

    let materials = {}
    modelScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            if (child.material.map) {
                materials = { ...materials, [child.material.name]: child.material.clone() }
                console.log(materials)
                // child.material = new THREE.MeshStandardMaterial()
            }
            if (child.material.map)
                child.material.map = null
            if (child.material.alphaMap)
                child.material.alphaMap = null
            if (child.material.aoMap)
                child.material.aoMap = null
            if (child.material.bumpMap)
                child.material.bumpMap = null
            if (child.material.displacementMap)
                child.material.displacementMap = null
            if (child.material.emissiveMap)
                child.material.emissiveMap = null
            if (child.material.envMap)
                child.material.envMap = null
            if (child.material.lightMap)
                child.material.lightMap = null
            if (child.material.metalnessMap)
                child.material.metalnessMap = null
            if (child.material.normalMap)
                child.material.normalMap = null
            if (child.material.roughnessMap)
                child.material.roughnessMap = null
            // child.material.map = null

        }
    })

    exporter.parse(modelScene, (buffer) => {
        // const json = io.binaryToJSON(buffer);
        // console.log(json.resources);

        compression(exp, buffer, materials, newId, setProgress)

    }, { binary: true });


    // setDisabledSaveButton(true)
    // setDisabledEditButton(false)

    // console.log(exp.scene)

    let newId
    if (card)
        newId = modelId
    else {
        newId = 'id' + (new Date()).getTime()
        setCardId(newId)
    }

    if (files) {

        setFiles(false)
    }
    setDatabase(newId, exp, nameFormContent, descriptionFormContent)
}

