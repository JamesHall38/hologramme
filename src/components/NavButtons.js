import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Button } from '@material-ui/core'

import {
    getStorage,
    ref as ref_storage,
    deleteObject
} from "firebase/storage"
import {
    getDatabase,
    ref as ref_database,
    remove
} from 'firebase/database'



const NavButtons = ({ card, exp, cardId, setNewModel, isNew, oldCard }) => {


    const [disabledSaveButton, setDisabledSaveButton] = useState(true)
    const [disabledEditButton, setDisabledEditButton] = useState(true)

    console.log(disabledSaveButton)

    useEffect(() => {
        if (card) {
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
            // if (nameFormContent)
            setDisabledSaveButton(false)
            // else
            //     setDisabledSaveButton(true)
        }
    }, [card, exp, oldCard])



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


    return (
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
    )
}

export default NavButtons