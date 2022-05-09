import Experience from './Model/Experience.js'
import DragAndDrop from './components/DragAndDrop'
import './App.css'
import { useState } from 'react'


import FPSStats from "react-fps-stats"

function App() {
  const [files, setFiles] = useState(false)
  const exp = new Experience(files)
  if (files) {
    exp.files = files
  }

  return (
    <div className="App">
      <DragAndDrop files={files} setFiles={setFiles} />
      <FPSStats top={'auto'} bottom={'0'} />
    </div>
  )
}
export default App