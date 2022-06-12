import { useCallback, useEffect, useState, useMemo } from 'react'
import Experience from '../Model/Experience'
import { getApps } from "firebase/app";

import { useNavigate } from 'react-router-dom'
import { Button } from '@material-ui/core'
import {
    getDatabase,
    ref as ref_database,
    set,
    onValue
} from 'firebase/database'


const Model = ({ Model, Id, Card, cards, modelFiles, setSettings }) => {

    const model = Model
    console.log(model)
    const idModel = Id
    const card = Card

    const editExperience = useMemo(() => model ? new Experience(card.modelType) : null, [model, card])

    const [displayModeData, setDisplayModeData] = useState()
    const [exp, setExp] = useState()
    const [onlyOnce, setOnlyOnce] = useState(true)


    document.body.style.flexDirection = 'row'
    document.body.style.padding = '0'
    if (window.location.pathname === '/display') {
        document.body.style.overflow = 'hidden'
    }

    const getAuth = useCallback(() => {
        const db = getApps().length !== 0
        if (db) {
            const db = getDatabase()
            const starCountRef = ref_database(db, `/display`)
            onValue(starCountRef, (snapshot) => {
                const data = snapshot.val()
                console.log('display = ', data)
                setDisplayModeData(data)
            })
        }
        else {
            console.log('db not loaded')
            setTimeout(() => getAuth(), 200)
        }
    }, [])


    useEffect(() => {
        console.log('useEffect')
        if (model) {
            editExperience.id = idModel
            editExperience.files = model
            editExperience.settings = card.settings
        }
        else {
            window.scroll(0, 0)
            getAuth()
        }
    }, [getAuth, card, model, exp, editExperience, idModel])

    useEffect(() => {
        if (displayModeData && onlyOnce) {
            setOnlyOnce(false)
            const experience = new Experience(displayModeData.modelType)
            setExp({ experience: experience })
        }
    }, [displayModeData, onlyOnce, exp, modelFiles])

    const watchDisplaySettings = useCallback(() => {
        const experience = exp.experience
        if (experience && modelFiles) {
            const data = displayModeData
            experience.files = modelFiles[data.id]
            if (cards && cards[0].id)
                experience.settings = cards.find(card => card.id === data.id).settings

            if (experience.loadModel) {
                console.log(experience.id, data.id)
                if (experience.id !== data.id && experience.resources.modelActive) {
                    experience.resources.modelActive = false
                    experience.loadModel.model.visible = false
                    experience.resources.addGLTF(modelFiles[displayModeData.id])
                }

                experience.loadModel.playing = data.animation
                console.log(data.animation)
            }
            experience.id = data.id
        }
        else {
            console.log('retry')
            setTimeout(() => watchDisplaySettings(), 200)
        }
    }, [modelFiles, cards, exp, displayModeData])

    useEffect(() => {
        console.log(exp)
        if (exp) {
            console.log('watchDisplaySettings')
            watchDisplaySettings()
        }
    }, [watchDisplaySettings, exp])

    const handleBack = () => {
        if (card)
            editExperience.destroy()
        else
            exp.experience.destroy()
        navigate(`/${idModel}`, { replace: true })
    }

    // DATABASE    
    const handleSave = () => {
        setSettings(editExperience.settings)
        const db = getDatabase()
        set(ref_database(db, `/users/${idModel}/settings/`), {
            settings: editExperience.settings
        })
    }

    const navigate = useNavigate()

    return (
        <>
            <Button variant='contained' style={{ position: 'absolute', zIndex: '100', left: '0', bottom: '0', margin: '10px' }} onClick={handleBack}  >Retour</Button>
            {window.location.pathname !== '/display' &&
                <Button variant='contained' style={{ position: 'absolute', zIndex: '100', left: '0', bottom: '40px', margin: '10px' }} onClick={handleSave}  >Enregistrer</Button>
            }
        </>
    )
}

export default Model