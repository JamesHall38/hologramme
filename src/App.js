import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom"
import Preview from './components/Preview'
import Home from './components/Home'
import Model from './components/Model'
import './App.css'
import Firebase from './components/Firebase.jsx'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import pako from 'pako'
import * as THREE from 'three'


// import sources from './Model/sources.js'
// import React, { useState } from 'react'

import React, { useCallback, useState, useEffect } from 'react'
import CardExperience from './Model/CardExperience'

import {
  getDatabase,
  ref as ref_data,
  onValue
} from "firebase/database"
import {
  getStorage,
  ref as ref_storage,
  getBlob,
  getMetadata,
  getBytes
} from "firebase/storage"


function App() {
  const [selectedCard, setSelectedCard] = useState({})
  const [modelFiles, setModelFiles] = useState({})
  const [newModel, setNewModel] = useState(false)
  const [settings, setSettings] = useState({})

  const getModel = useCallback(async (id, card) => {
    const storage = getStorage()
    // if (card.modelType === 'obj') {
    console.log('getModel')

    const refModel = ref_storage(storage, `users/model/${id}`)
    const model = await getBytes(refModel)

    // const arrayBuffer = await model.arrayBuffer()
    // // .then((model) => {
    // console.log('model = ', card.modelType)


    card.loaded = true
    setModelFiles(oldFiles => ({ ...oldFiles, [id]: model }))

    const refMaterials = ref_storage(storage, `users/textures/${id}`)
    const compressedMaterials = await getBytes(refMaterials)


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
      card.resources.setModel(model, materials)
      // // console.log(materials)
      // card.resources.sceneGroup.traverse((child) => {
      //   if (child instanceof THREE.Mesh) {
      //     // if (child.material.map) {
      //     console.log(child.material)
      //     child.material = materials[child.material.name]
      //     child.material.needsUpdate = true

      //     // }
      //   }
      // })
    })


    // console.log('refMaterials = ', material, test)

    // })
    // .catch((error) => {
    //   console.log(error)
    // })
    // }
    // else if (card.modelType === 'img') {
    //   getBytes(ref_storage(storage, `users/${id}.jpg`))
    //     .then((model) => {
    //       card.resources.addImg(model)
    //       card.loaded = true
    //       setModelFiles(oldFiles => ({ ...oldFiles, [id]: model }))
    //     })
    //     .catch((error) => {
    //       console.log(error)
    //     })
    // }
  }, [])

  const getCardInfo = useCallback((id, card) => {
    if (window.location.pathname !== '/edit' && window.location.pathname !== '/display') {
      const db = getDatabase()
      onValue(ref_data(db, `users/${id}/`),
        (snapshot) => {
          // console.log(snapshot.val())
          card.modelType = snapshot.val().card.modelType
          card.cardName = snapshot.val().card.name
          card.cardDescription = snapshot.val().card.description
          if (snapshot.val().settings) {
            // card.settings = snapshot.val().settings.settings
            const settings = snapshot.val().settings.settings
            card.settings = { ...settings, modelPositionZ: settings.modelPositionZ - 0.2 }
          }
        }
        , {
          onlyOnce: true
        })
    }
  }, [])

  const getModelsOneByOne = useCallback((cards, sizesArray, len, timeouts) => {
    let oldCard
    if (sizesArray.length === len) {
      sizesArray.forEach((element, i) => {
        const retryFun = () => {
          if (i === 0) {
            console.log('get model and info ', element.id)
            const card = cards[element.index]
            oldCard = card
            getModel(element.id, card)
            return
          }
          else if (i === sizesArray.length - 1 && oldCard.loaded) {
            console.log('get model and info ', element.id)
            const card = cards[element.index]
            oldCard = card
            getModel(element.id, card)
            return timeouts.forEach((timeout) => {
              console.log('clear timeout')
              clearTimeout(timeout)
            })
          }
          else if (oldCard.loaded) {
            console.log('get model and info ', element.id)
            const card = cards[element.index]
            oldCard = card
            getModel(element.id, card)
            return
          }
          else {
            console.log('retry')
            timeouts.push(setTimeout(() => { retryFun() }, 500))
          }
        }
        retryFun()
      })
    }
    else {
      console.log('retry')
      timeouts.push(setTimeout(() => { getModelsOneByOne(cards, sizesArray, len, timeouts) }, 500))
    }
  }, [getModel])

  const getModelsFromFirebase = useCallback((auth, cards, timeouts) => {
    if (auth && cards) {
      if (cards.length) {
        const sizesArray = []

        auth.forEach((id, index) => {
          cards[index].id = id
          const storage = ref_storage(getStorage(), `users/model/${id}`)
          getMetadata(storage).then((metaData) => {
            sizesArray.push({ id: id, size: metaData.size, index: index })
            sizesArray.sort((a, b) => { return a.size - b.size })
          })
          getCardInfo(id, cards[index])
        })

        getModelsOneByOne(cards, sizesArray, auth.length, timeouts)

      }
      else {
        console.log('retry')
        timeouts.push(setTimeout(() => { getModelsFromFirebase() }, 500))
      }
    }

  }, [getCardInfo, getModelsOneByOne])

  const handleCardSelection = (auth, cards, card, index) => {
    if (!card.onSelect) {
      cards.forEach(card => {
        if (card.onSelect) {
          // document.body.style.paddingLeft = '0'
          card.canvas.className = 'unselected'
          card.onSelect = false
          card.sizes.cardReset()
          card.camera.instance.position.set(0, -0.25, 3)
          card.camera.removeControls()
        }
      })

      // if (window.innerWidth < 750) {
      // document.body.style.height = '100%'

      card.canvas.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      })
      // }

      card.onSelect = true
      card.sizes.cardResize()
      card.camera.instance.position.z = 3.5
      card.camera.setControls()
      card.canvas.className = 'selected'

      window.requestAnimationFrame(() => {
        card.time.tick()
      })

      setSelectedCard({
        selected: auth[index],
        auth: auth,
        cards: cards
      })
    }
  }

  const app = useCallback((auth, cards, timeouts) => {
    getModelsFromFirebase(auth, cards, timeouts)

    if (cards)
      cards.forEach((card, index) => card.canvas.addEventListener('click', () => handleCardSelection(auth, cards, card, index)))

    return () => {
      cards.forEach((card, index) => {
        card.canvas.removeEventListener('click', () => handleCardSelection(auth, cards, card, index))
        card.destroy()
      }
      )
    }
  }, [getModelsFromFirebase])

  const getData = useCallback((timeouts) => {
    const db = getDatabase()
    onValue(ref_data(db, `users/`),
      (snapshot) => {
        const data = {
          auth: Object.keys(snapshot.val()),
          cards: Object.keys(snapshot.val()).map(() => { return new CardExperience() })
        }
        setSelectedCard({
          selected: null,
          auth: data.auth,
          cards: data.cards
        })
        app(data.auth, data.cards, timeouts)
      }
      , {
        onlyOnce: true
      })

  }, [app, setSelectedCard])

  const firstRender = useCallback((timeouts) => {
    const getAuth = () => {
      const db = getDatabase()._instanceStarted
      ref_data(getDatabase(), `/`)
      if (db)
        getData(timeouts)
      else {
        console.log('db not loaded')
        timeouts.push(setTimeout(() => getAuth(), 500))
      }
    }
    getAuth()
  }, [getData])


  useEffect(() => {
    const timeouts = []

    if (window.location.pathname !== '/import') {
      firstRender(timeouts)
    }
  }, [firstRender])

  return (
    <div className="App" id='App'>
      <Firebase />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home selectedCard={selectedCard} setSelectedCard={setSelectedCard} />} />
          <Route path='*' exact='true' element={<Navigate to='/' />} />
          <Route path="/import" element={<Preview setNewModel={setNewModel} />} />
          <Route path="/display" element={<Model modelFiles={modelFiles} cards={selectedCard.cards} />} />
          {newModel &&
            <>
              <Route path={`/${newModel.id}/edit`} element={<Model Card={newModel.card} Model={newModel.model} Id={newModel.id} />} />
              <Route path={`/${newModel.id}`} element={<Preview card={newModel.card} modelId={newModel.id} isNew={true} />} />
            </>
          }
          {selectedCard.auth && selectedCard.auth.map((id, index) => {
            return (
              <React.Fragment key={index}>
                <Route path={`/${id}`}
                  element={<Preview settings={settings} card={selectedCard.cards[index]} modelId={id} />} />
                <Route path={`/${id}/edit`} element={<Model setSettings={setSettings} Card={selectedCard.cards[index]} Model={modelFiles[id]} Id={id} />} />
              </React.Fragment>
            )
          })
          }
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App