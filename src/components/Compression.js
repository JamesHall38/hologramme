import * as THREE from 'three'
import { WebIO } from '@gltf-transform/core'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'

// import { reorder, weld, dedup, quantize, center, colorspace, metalRough, prune, dequantize, sequence, normals, textureResize } from '@gltf-transform/functions'
import { reorder, center, prune, sequence } from '@gltf-transform/functions'
import { MeshoptCompression, KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
// import { DocumentView } from '@gltf-transform/view';
import pako from 'pako'
import {
    getStorage,
    ref as ref_storage,
    uploadBytesResumable,
} from "firebase/storage"


export default async function compression(experience, files, materials, newId, setProgress) {
    // const files = experience.files
    // const load = experience.resources

    await MeshoptDecoder.ready;
    await MeshoptEncoder.ready;

    console.log(files)
    // const arrayBuffer = await files.arrayBuffer()
    // const uint8View = new Uint8Array(arrayBuffer);

    const uint8View = new Uint8Array(files);
    const io = new WebIO().registerExtensions(KHRONOS_EXTENSIONS)
    const modelDocument = await io.readBinary(uint8View)

    // const objectURL = window.URL.createObjectURL(files)
    // const document = await io.read(`${objectURL}`)

    // console.log(document.getRoot().listMaterials()[0].getBaseColorTexture())


    await modelDocument.transform(
        // textureResize({ size: [128, 128] }),
        reorder({ encoder: MeshoptEncoder, level: 'medium' }),
        // dequantize(),
        // weld(),
        // dedup(),
        center({ pivot: 'below' }),
        // colorspace({ inputEncoding: 'sRGB' }),
        // metalRough(),
        prune(),
        sequence()
        // normals(),
    );

    // const materialDef = document.getRoot().listMaterials()[0]
    // materialDef.setBaseColorHex(0xFF0000);

    modelDocument.createExtension(MeshoptCompression)
        .setRequired(true)
        .setEncoderOptions({ method: MeshoptCompression.EncoderMethod.FILTER });


    const testo = await io.writeBinary(modelDocument);
    // try {
    console.log(testo)
    const compressed = pako.deflate(testo);
    console.log(compressed)
    console.log(materials)
    // const store = [materials, testo]


    // const testtt = new Uint16Array(materials).buffer;

    const storage = getStorage()
    uploadBytesResumable(ref_storage(storage, `/users/model/${newId}`), compressed)
        .on("state_changed", (snapshot) => {
            setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 50))
        })
    console.log('FILE SENT -> ', newId);



    if (materials !== {}) {
        // const scene = new THREE.Scene()
        const exporter = new GLTFExporter()

        const testo = []
        Object.values(materials).forEach(material => {
            testo.push(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material))
            // scene.add(mesh)
        })
        // console.log(scene)



        // function saveArrayBuffer(buffer, filename) {
        //     save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
        // }

        // const link = document.createElement('a');
        // link.style.display = 'none';
        // document.body.appendChild(link); // Firefox workaround, see #6594

        // function save(blob, filename) {
        //     link.href = URL.createObjectURL(blob);
        //     link.download = filename;
        //     link.click();

        //     // URL.revokeObjectURL( url ); breaks Firefox...
        // }

        // function download() {
        // const exporter = new GLTFExporter();
        // exporter.parse(
        // scene,
        // function (result) {
        // },
        // );
        // }
        console.log('for')
        for (let i = 0; i < 3; i++) {
            console.log('for', i)
            exporter.parse(testo, (gltf) => {
                console.log(i)
                // saveArrayBuffer(gltf, 'scene.glb');
                // const bufView = Buffer.from(JSON.stringify(gltf))

                // const test = gltf
                const buffer = pako.deflate(gltf)

                // const blob = new Blob([buffer], { type: 'application/octet-stream' })
                // const url = URL.createObjectURL(blob)
                // console.log(bufView, buffer, gltf)

                uploadBytesResumable(ref_storage(storage, `/users/textures/${newId}/${i}`), buffer)
                    .on("state_changed", (snapshot) => {
                        setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 50))
                    })

            },
                { binary: true, maxTextureSize: 256 * Math.pow(2, i * 2) }
                // {
                //     binary: true,
                //     forcePowerOfTwoTextures: true,
                //     onlyVisible: true,
                //     embedImages: true,
                //     forceIndices: true,
                // }
            )
        }

    }
}
