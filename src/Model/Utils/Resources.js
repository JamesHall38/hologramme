import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter {
    constructor(sources, experience) {
        super()

        this.sources = sources

        this.video = null
        this.experience = experience

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0
        this.ratio = 1

        this.modelActive = false


        this.setLoaders()
        this.startLoading()
    }


    setLoaders() {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.fbxLoader = new FBXLoader()
        this.loaders.objLoader = new OBJLoader()

        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()


    }
    // addFromFirebase(url) {
    //     // setInterval(() => {
    //     this.loaders.gltfLoader.load(
    //         url,
    //         // (file) => {
    //         //     this.sourceLoaded(url, file)
    //         // }
    //     )
    //     // }, 10000)

    // }

    addGLTF(arrayBuffer) {
        console.log(arrayBuffer)
        this.loaders.gltfLoader.load(
            arrayBuffer,
            (file) => {
                console.log(file)
                this.importedLoaded(file)
            }
        )
    }

    addOBJ(arrayBuffer) {
        const url = window.URL.createObjectURL(new Blob([arrayBuffer]))

        this.loaders.objLoader.load(
            url,
            (file) => {
                this.importedLoaded(file)
            }
        )
    }

    addFBX(arrayBuffer) {
        const url = window.URL.createObjectURL(new Blob([arrayBuffer]))

        this.loaders.fbxLoader.load(
            url,
            (file) => {
                this.importedLoaded(file)
            }
        )

        // this.loaders.fbxLoader.parse(
        //     arrayBuffer, '', (file) => {
        //         console.log('addFBX')
        //         this.importedLoaded(file)
        //     }
        // )
    }

    // addImg(path) {
    //     this.loaders.textureLoader.load(
    //         path,
    //         (file) => {
    //             console.log('IMG LOADED')
    //             this.importedLoaded(file)
    //         }
    //     )
    // }

    addImg(arrayBuffer) {
        console.log('addImg')
        const url = window.URL.createObjectURL(new Blob([arrayBuffer]))

        this.loaders.textureLoader.load(
            url,
            (file) => {
                this.ratio = file.source.data.width / file.source.data.height
                this.importedLoaded(file)
            }
        )
    }

    addVid(arrayBuffer) {
        // this.experience.files
        const blob = new Blob([arrayBuffer])
        const url = window.URL.createObjectURL(blob)

        if (this.experience) {
            const video = document.createElement('video')
            const img = document.createElement('img')

            const setTexture = (url) => {
                console.log(url)
                this.loaders.textureLoader.load(
                    url,
                    (file) => {
                        // this.ratio = file.source.data.width / file.source.data.height
                        this.importedLoaded(file)
                    }
                )
            }
            const timeupdate = function () {
                if (snapImage()) {
                    video.removeEventListener('timeupdate', timeupdate)
                    video.pause()
                }
            }
            video.addEventListener('loadeddata', function () {
                if (snapImage()) {
                    video.removeEventListener('timeupdate', timeupdate)
                    setTexture(img.src)
                }
            })
            const snapImage = function () {
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
                const image = canvas.toDataURL()
                const success = image.length > 100000
                if (success) {
                    img.src = image
                    // document.getElementsByTagName('div')[0].appendChild(img) 
                    // URL.revokeObjectURL(url) 
                }
                return success
            }

            video.addEventListener('timeupdate', timeupdate)
            video.preload = 'metadata'
            video.src = url
            // Load video in Safari / IE11
            video.muted = true
            video.playsInline = true
            video.play()
        }
        else {
            this.video = document.createElement('video')
            this.video.src = URL.createObjectURL(blob)
            this.video.load()
            this.video.loop = true
            this.video.play()

            this.importedLoaded(this.video)
        }
    }


    startLoading() {
        // Load each source
        for (const source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file

        this.loaded++

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
        }
    }

    importedLoaded(file) {
        this.items['file'] = file
        this.modelActive = true
        // this.trigger('ready')
        this.trigger('importedReady')
    }
}
