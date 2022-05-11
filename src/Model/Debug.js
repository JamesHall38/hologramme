import * as dat from 'lil-gui'
import Stats from 'stats.js'
import Experience from './Experience.js'

export default class Debug {
    constructor() {
        this.experience = new Experience()

        this.debug = new dat.GUI()
        this.sizes = this.experience.sizes

        this.test = this.debug.addFolder('Navigation').close()
        this.importFolder = this.test.addFolder('Import').close()

        this.debugObject = { ShowDropZone: false }
        this.importFolder.add(this.debugObject, 'ShowDropZone').onChange(() => {
            if (this.debugObject.ShowDropZone) {
                document.getElementById('dl').style.visibility = 'visible'
            }
            else {
                document.getElementById('dl').style.visibility = 'hidden'
            }
        })

        this.stats = new Stats();
        this.stats.domElement.style.position = "static"
        this.stats.domElement.style.left = "0px"
        this.test.domElement.appendChild(this.stats.domElement)

        this.hideImport()

        const model = [
            'fox',
            'meka3d',
            'metakonz',
            'metaadventures',
            'metalegends',
            'uaf',
            'flayed',
            'botsskull'
        ]

        model.forEach(id => {
            this.getElement(id)
        })
    }

    hideImport() {
        if (document.getElementById('dl')) {
            document.getElementById('dl').style.visibility = 'hidden'
        }
        else {
            setTimeout(() => { this.hideImport() }, 15);
        }
    }

    getElement(id) {
        if (document.getElementById(id) && this.importFolder) {
            const node = document.getElementById(id)
            this.importFolder.domElement.appendChild(node)
        } else {
            setTimeout(() => { this.getElement(id) }, 15);
        }
    }
}
