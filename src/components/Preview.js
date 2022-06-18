import { useEffect, useCallback, useMemo } from 'react'
import CardExperience from '../Model/CardExperience'
import DragAndDrop from './DragAndDrop'
import {
    getStorage,
    ref as ref_storage,
    uploadBytesResumable,
    deleteObject
} from "firebase/storage"
import {
    getDatabase,
    ref as ref_database,
    set,
    remove
} from 'firebase/database'
import React, { useRef, useState } from 'react'
import { Card, CardContent } from '@material-ui/core'
import { motion } from "framer-motion"
import { Button, Grid, TextField } from '@material-ui/core'
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { ThemeProvider } from '@material-ui/core'
import { createTheme } from '@material-ui/core/styles'


const theme = createTheme({
    palette: {
        action: {
            disabled: '#303030'
        }
    }
})


const FormInput = ({ name, label, required, value, onChange }) => {
    const { control } = useFormContext()
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <TextField
                    InputLabelProps={{
                        style: {
                            color: "white",
                            fontSize: '15px',
                        }
                    }}
                    InputProps={{
                        style: {
                            color: "white",
                        }
                    }}
                    variant="filled"
                    size='small'
                    {...field}
                    value={value}
                    onChange={onChange}
                    name={name}
                    label={label}
                    required={required}
                    fullWidth
                />
            )}
        />
    )
}



const Preview = ({ card, modelId, setNewModel, isNew, settings }) => {
    const [cardId, setCardId] = useState(modelId ? modelId : '')
    const [nameFormContent, setNameFormContent] = useState('')
    const [descriptionFormContent, setDescriptionFormContent] = useState('')
    const [oldCard, setOldCard] = useState({})

    const [files, setFiles] = useState(false)

    const [progress, setProgress] = useState(0)

    const [disabledSaveButton, setDisabledSaveButton] = useState(true)
    const [disabledEditButton, setDisabledEditButton] = useState(true)

    // EXPERIENCE
    const exp = useMemo(() => {
        window.scroll(0, 0)
        const bodyStyle = document.body.style
        const containerStyle = document.getElementById('container').style
        containerStyle.height = '100%'
        containerStyle.position = 'relative'
        // style.wrap = 'wrap'
        if (window.innerWidth < 750) {
            bodyStyle.overflow = 'visible'
            bodyStyle.flexDirection = 'column-reverse'
        }
        else {
            bodyStyle.flexDirection = 'row-reverse'
            bodyStyle.padding = '0'
            bodyStyle.width = '100vw'
            bodyStyle.justifyContent = 'center'
        }

        if (card) {
            card.canvas.className = ''

            const appClass = document.getElementById('App')
            appClass.appendChild(card.canvas)
            // const container = document.getElementById('container')
            // container.removeChild(card.canvas)
            // document.getElementsByClassName('App').appendChild(card.canvas)

            setOldCard({
                name: card.cardName,
                description: card.cardDescription
            })

            setNameFormContent(card.cardName)
            setDescriptionFormContent(card.cardDescription)
            return card
        }
        else {
            const card = new CardExperience()
            card.onSelect = true
            card.sizes.cardResize()
            card.camera.instance.position.z = 3.5
            card.camera.setControls()
            return card
        }
    }, [card])

    const methods = useForm()
    const form = useRef()

    console.log('PREVIEW')

    // INITIALIZE
    useEffect(() => {
        console.log('Init')

        if (exp.world.name) {
            console.log('test')
            exp.cardName = nameFormContent
            exp.cardDescription = descriptionFormContent
        }
        if (files) {
            exp.files = files
            console.log(files)
        }

        if (card) {
            if (settings.scale) {
                exp.settings = settings
                console.log(settings)
                exp.loadModel.setSettings()
            }

            if (exp.cardName === oldCard.name && exp.cardDescription === oldCard.description) {
                setDisabledEditButton(false)
                setDisabledSaveButton(true)
            }
            else {
                setDisabledEditButton(true)
                setDisabledSaveButton(false)
            }
        }
        else {
            if (nameFormContent)
                setDisabledSaveButton(false)
            else
                setDisabledSaveButton(true)
        }

    }, [nameFormContent, descriptionFormContent, files, exp, card, oldCard, settings])

    // DATABASE
    const setDatabase = useCallback((id) => {
        console.log('database')
        const db = getDatabase()
        set(ref_database(db, `/users/${id}/card`), {
            modelType: exp.modelType,
            name: nameFormContent,
            description: descriptionFormContent
        })
    }, [nameFormContent, descriptionFormContent, exp])

    const removeFromStorage = useCallback((id) => {
        console.log(id)
        const storage = getStorage()
        const modelRef = ref_storage(storage, `/users/${id}`)
        deleteObject(modelRef).then(() => {
            console.log('deleted')
            window.location.href = '/'
        }).catch((error) => {
            console.log(error)
        })

        const db = getDatabase()
        remove(ref_database(db, `/users/${id}`))
    }, [])

    // SUBMIT FORM
    const handleSubmit = useCallback((e) => {
        e.preventDefault()


        // exp.resources.addGLTF(files)

        // const storage = getStorage()
        // uploadBytesResumable(ref_storage(storage, `/users/${newId}`), exp.loadModel.model)
        //     .on("state_changed", (snapshot) => {
        //         setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100))
        //     })
        // console.log('FILE SENT -> ', newId);

        // setFiles(false)

        setDisabledSaveButton(true)
        setDisabledEditButton(false)

        // console.log(exp.scene)

        let newId
        if (card)
            newId = modelId
        else {
            newId = 'id' + (new Date()).getTime()
            setCardId(newId)
        }

        if (files) {
            const storage = getStorage()
            uploadBytesResumable(ref_storage(storage, `/users/${newId}`), exp.loadModel.model)
                .on("state_changed", (snapshot) => {
                    setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100))
                })
            console.log('FILE SENT -> ', newId);

            setFiles(false)
        }
        setDatabase(newId)
    }, [files, setDatabase, card, modelId, exp])

    // NAVIGATION
    const navigate = useNavigate()

    const handleClickEdit = useCallback(() => {
        if (card)
            card.canvas.className = 'hidden-card'
        else {
            console.log(exp, cardId, exp.files)
            exp.canvas.className = 'hidden-card'
            setNewModel({
                card: exp,
                id: cardId,
                model: exp.files,
            })
        }
        navigate(`/${cardId}/edit`, { replace: true })
    }, [navigate, cardId, card, exp, setNewModel])

    const handleClickBack = useCallback(() => {
        window.scroll(0, 0)

        if (card)
            document.getElementById('container').appendChild(card.canvas)

        if (window.location.pathname === '/import' || isNew)
            window.location.href = '/'
        else
            navigate('/', { replace: false })
        if (!card)
            exp.destroy()
    }, [navigate, exp, card, isNew])

    const handleOnChange = (e) => {
        setNameFormContent(e.target.value)
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', position: 'relative',
            margin: '10px', color: 'white', top: '0px', width: '50vw'
        }} id='card' >
            <ThemeProvider theme={theme}>
                <Card className='responsiveCard' >
                    <CardContent style={{ height: '100px', width: '200px' }} >
                        <motion.div
                            initial={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: 6 }}
                            transition={{ duration: 0.4 }}>

                            <DragAndDrop card={exp} setFiles={setFiles} />

                        </motion.div  >
                    </CardContent>
                    <CardContent style={{ paddingBottom: '15px' }} >

                        <FormProvider {...methods}>
                            <form ref={form} onSubmit={handleSubmit}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={6}>
                                        <motion.div
                                            initial={{ opacity: 0, translateY: 10 }}
                                            animate={{ opacity: 1, translateY: 0 }}
                                            exit={{ opacity: 0, translateY: 10 }}
                                            transition={{ delay: 0.1, duration: 0.4 }}
                                            style={{ width: '100%' }}>

                                            <FormInput required value={nameFormContent}
                                                onChange={handleOnChange}
                                                name="Name" label="Nom" />

                                        </motion.div >
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        <motion.div
                                            initial={{ opacity: 0, translateY: 10 }}
                                            animate={{ opacity: 1, translateY: 0 }}
                                            exit={{ opacity: 0, translateY: 10 }}
                                            transition={{ delay: 0.2, duration: 0.4 }}
                                            style={{ width: '100%' }}>

                                            <FormInput value={descriptionFormContent} onChange={e => setDescriptionFormContent(e.target.value)} name="description" label="Description" />

                                        </motion.div >
                                    </Grid>
                                    <Grid item xs={2} sm={2} style={{ display: 'flex', alignItems: 'center', }}>
                                        <motion.div
                                            initial={{ opacity: 0, translateY: 10 }}
                                            animate={{ opacity: 1, translateY: 0 }}
                                            exit={{ opacity: 0, translateY: 10 }}
                                            transition={{ delay: 0.2, duration: 0.4 }}
                                            style={{ width: '100%', marginTop: '10px' }}>
                                            <Button type="submit" className="savebutton" disabled={((progress > 0 && progress !== 100) || disabledSaveButton)} variant="contained" color="primary">
                                                {(progress === 0 || progress === 100) ? 'Enregistrer' : `${progress}%`}
                                            </Button>

                                        </motion.div >
                                    </Grid>
                                </Grid>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card >

                <motion.div
                    initial={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: 10 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ marginTop: '10px', left: '-50%', margin: '10px' }}>

                    <Button type='button' disabled={disabledEditButton} variant="contained" color="primary" onClick={handleClickEdit} >
                        Modifier
                    </Button>

                    <Button type='button' variant="contained" color="primary" onClick={handleClickBack} >
                        Retour
                    </Button>

                    {cardId !== '' &&
                        (<Button type='button' variant="contained" color="primary" style={{ backgroundColor: 'red' }} onClick={() => removeFromStorage(cardId)} >
                            Supprimer
                        </Button>)
                    }

                </motion.div >
            </ThemeProvider>
        </div >
    )
}

export default Preview

