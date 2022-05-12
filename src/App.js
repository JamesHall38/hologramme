import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"
import Experience from './Model/Experience.js'
import DragAndDrop from './components/DragAndDrop'
import Nav from './components/Nav.js'
import './App.css'
import { useEffect, useState } from 'react'
import Firebase from './components/Firebase.jsx'



const Model = ({ files, source, firebaseLoader }) => {


  const [first, setFirst] = useState(true)
  const [save, setSave] = useState({ value: '' })

  useEffect(() => {
    let exp
    let block = false
    if (source) {
      // console.log(source)

      exp = new Experience(source)
      block = true
    }

    if (!block) {
      if (firebaseLoader.name === 'empty')
        console.log(firebaseLoader)
      else
        exp = new Experience([firebaseLoader])
    }
    // else {
    if (files) {
      exp.files = files
    }
    // }
  }, [firebaseLoader, files, source])

  return <Nav firebaseLoader={firebaseLoader} save={save} setSave={setSave} first={first} setFirst={setFirst} />
}

function App() {
  const [files, setFiles] = useState(false)
  const [firebaseLoader, setFirebaseLoader] = useState({ name: 'empty' })

  useEffect(() => {
    // console.log(firebaseLoader)
  }, [firebaseLoader])

  return (
    <div className="App">

      <DragAndDrop files={files} setFiles={setFiles} />
      <Firebase setFirebaseLoader={setFirebaseLoader} />
      <div id="container"></div>


      <BrowserRouter>
        <Routes>
          <Route path="/display" element={<Model files={files} firebaseLoader={firebaseLoader} source={null} />} />
          <Route path="/" element={<Model files={files}
            source={[
              {
                name: 'fox',
                type: 'gltfModel',
                path: '/Fox.glb'
              }
            ]} />}></Route>
          <Route path="/meka3d" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'meka3d',
              type: 'gltfModel',
              path: '/Meka3D.glb'
            }
          ]} />}></Route>
          <Route path="/meta-adventures" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'metaadventures',
              type: 'gltfModel',
              path: '/META_ADVENTURES.glb'
            }
          ]} />}></Route>
          <Route path="/metakonz" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'metakonz',
              type: 'gltfModel',
              path: '/METAKONZ.glb'
            }
          ]} />}></Route>
          <Route path="/metalegends" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'metalegends',
              type: 'gltfModel',
              path: '/METALEGENDS.glb'
            }
          ]} />}></Route>
          <Route path="/uaf" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'uaf',
              type: 'gltfModel',
              path: '/UAF.glb'
            }
          ]} />}></Route>
          <Route path="/flayed" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'flayed',
              type: 'gltfModel',
              path: '/FLAYED.glb'
            }
          ]} />}></Route>
          <Route path="/bots-skull" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'botsskull',
              type: 'gltfModel',
              path: '/BotsSkull.glb'
            }
          ]} />}></Route>
          <Route path="/urban-token" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'Urban_token',
              type: 'gltfModel',
              path: '/Urban_token.glb'
            }
          ]} />}></Route>
          <Route path="/logo" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'logo',
              type: 'gltfModel',
              path: '/LOGO.glb'
            }
          ]} />}></Route>
          <Route path="/proserpine" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'Leo_Caillard_Proserpine',
              type: 'gltfModel',
              path: '/Leo_Caillard_Proserpine.glb'
            }
          ]} />}></Route>
          <Route path="/caesar-statue" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'Leo_Caillard_CaesarStatue',
              type: 'gltfModel',
              path: '/Leo_Caillard_CaesarStatue.glb'
            }
          ]} />}></Route>
          <Route path="/caesar" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'Leo_Caillard_Caesar',
              type: 'gltfModel',
              path: '/Leo_Caillard_Caesar.glb'
            }
          ]} />}></Route>
          <Route path="/meta-adventure-new" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'meta_adventures_new',
              type: 'gltfModel',
              path: '/META_ADVENTURE_NEW.glb'
            }
          ]} />}></Route>
          <Route path="/flayed-gold" element={<Model files={files} firebaseLoader={firebaseLoader} source={[
            {
              name: 'flayed_gold',
              type: 'gltfModel',
              path: '/FLAYED_GOLD.glb'
            }
          ]} />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App