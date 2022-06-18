import * as THREE from 'three'
import { NodeIO } from '@gltf-transform/core'
import { reorder, weld, dedup, quantize, center, colorspace, metalRough, prune, normals } from '@gltf-transform/functions'
import { MeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { DocumentView } from '@gltf-transform/view';
import pako from 'pako'
// import * as squoosh from '@squoosh/lib';
// const cpus = require('os')


const pakoDecompression = (buffer) => {
    console.log(buffer)
    try {
        const compressed = pako.inflate(buffer);
        console.log(compressed)
        // ... continue processing
    } catch (err) {
        console.error(err);
    }
}

const pakoCompression = (buffer) => {

    console.log(buffer)
    const output = pako.deflate(buffer);
    console.log(output)
}

export default async function compression(experience) {
    const files = experience.files
    const load = experience.resources

    // await MeshoptDecoder.ready;
    // await MeshoptEncoder.ready;

    const arrayBuffer = await files.arrayBuffer()
    const uint8View = new Uint8Array(arrayBuffer);

    // const meta = [['Content-Type', 'obj/glb']];
    const headers = new Headers();
    headers.append("Content-Type", "obj/gltf");
    // headers.append("Content-Length", uint8View.length)

    const io = new NodeIO()
    // .registerExtensions([MeshoptCompression])
    // .registerDependencies({
    //     'meshopt.decoder': MeshoptDecoder,
    //     'meshopt.encoder': MeshoptEncoder,
    // });

    const document = await io.readBinary(uint8View)

    // console.log(document.getRoot().listMaterials())


    // await document.transform(
    // reorder({ encoder: MeshoptEncoder, level: 'medium' }),
    // quantize(),
    // weld(),
    // dedup(),
    // center({ pivot: 'below' }),
    // colorspace({ inputEncoding: 'sRGB' }),
    // metalRough(),
    // prune(),
    // normals(),
    // );
    // const materialDef = document.getRoot().listMaterials()[0]

    // materialDef.setBaseColorHex(0xFF0000);


    // console.log(document.getRoot().listMaterials())


    // for (let i = 0; i < 5; i++) {
    //     const size = 2048 / Math.pow(2, i);
    //     console.log(`textureResize(size=${size})`);
    //     await document.transform(
    //         textureResize({
    //             size: [size, size],
    //             filter: TextureResizeFilter.LANCZOS2,
    //         })
    //     );

    // }

    const documentView = new DocumentView(document);
    const sceneDef = document.getRoot().listScenes()[0]
    const sceneGroup = documentView.view(sceneDef)
    console.log(sceneGroup)



    load.items['file'] = sceneGroup
    load.modelActive = true
    load.trigger('importedReady')


    const testo = await io.writeBinary(document);
    pakoCompression(testo)
}
