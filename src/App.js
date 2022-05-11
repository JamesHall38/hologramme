import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"
import Experience from './Model/Experience.js'
import DragAndDrop from './components/DragAndDrop'
import Nav from './components/Nav.js'
import './App.css'
import { useState } from 'react'



const Model = ({ files, source }) => {
  const exp = new Experience(source)
  if (files) {
    exp.files = files
  }
  return <Nav />
}

function App() {
  const [files, setFiles] = useState(false)

  return (
    <div className="App">

      <DragAndDrop files={files} setFiles={setFiles} />
      <div id="container"></div>


      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Model files={files} setFiles={setFiles}
            source={[
              {
                name: 'fox',
                type: 'gltfModel',
                path: '/Fox.glb'
              }
            ]} />}></Route>
          <Route path="/meka3d" element={<Model files={files} setFiles={setFiles}
            source={[
              {
                name: 'meka3d',
                type: 'gltfModel',
                path: '/Meka3D.glb'
              }
            ]} />}></Route>
          <Route path="/meta-adventures" element={<Model files={files} setFiles={setFiles} source={[
            {
              name: 'metaadventures',
              type: 'gltfModel',
              path: '/META_ADVENTURES.glb'
            }
          ]} />}></Route>
          <Route path="/metakonz" element={<Model files={files} setFiles={setFiles} source={[
            {
              name: 'metakonz',
              type: 'gltfModel',
              path: '/METAKONZ.glb'
            }
          ]} />}></Route>
          <Route path="/metalegends" element={<Model files={files} setFiles={setFiles} source={[
            {
              name: 'metalegends',
              type: 'gltfModel',
              path: '/METALEGENDS.glb'
            }
          ]} />}></Route>
          <Route path="/uaf" element={<Model files={files} setFiles={setFiles} source={[
            {
              name: 'uaf',
              type: 'gltfModel',
              path: '/UAF.glb'
            }
          ]} />}></Route>
          <Route path="/flayed" element={<Model files={files} setFiles={setFiles} source={[
            {
              name: 'flayed',
              type: 'gltfModel',
              path: '/FLAYED.glb'
            }
          ]} />}></Route>
          <Route path="/bots-skull" element={<Model files={files} setFiles={setFiles} source={[
            {
              name: 'botsskull',
              type: 'gltfModel',
              path: '/BotsSkull.glb'
            }
          ]} />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App