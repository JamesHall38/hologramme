import '../App.css'
import Experience from './Experience.js'


const Model = ({ files }) => {

    const exp = new Experience(files)

    if (files) {
        exp.files = files
    }

    return null
}


export default Model