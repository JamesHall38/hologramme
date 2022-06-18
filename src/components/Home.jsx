import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@material-ui/core'
import { useNavigate } from 'react-router-dom'


const Home = ({ selectedCard, setSelectedCard }) => {
    const navigate = useNavigate()

    // document.body.style.padding = '0 50px 0 50px'
    // document.body.style.overflow = 'visible'
    const containerStyle = document.getElementById('container').style
    containerStyle.flexDirection = 'row-reverse'
    // container.scrollTop = 0

    // containerStyle.position = 'absolute'

    document.body.style.height = '100vh'

    if (selectedCard)
        if (selectedCard.cards)
            selectedCard.cards.forEach(card => {
                card.canvas.className = 'unselected'
            })


    const handleClickNavigate = useCallback(() => {
        navigate(`/${selectedCard.selected}`, { replace: false })

        selectedCard.auth.forEach((id, index) => {
            if (id !== selectedCard.selected) {
                selectedCard.cards[index].canvas.className = 'hidden-card'
            }

        })
    }, [selectedCard, navigate])

    const handleClick = useCallback(() => {
        window.location.href = '/import'
    }, [])

    const handleCloseCard = useCallback(() => {
        const card = selectedCard.cards.find(card => card.onSelect === true)
        card.onSelect = false
        card.sizes.cardReset()
        card.camera.instance.position.set(0, -0.25, 3)
        card.camera.removeControls()
        setSelectedCard({ ...this, selected: null })

    }, [selectedCard, setSelectedCard])


    const handleVisualize = useCallback(() => {
        // if (selectedCard.cards.find(card => card.onSelect === true))
        //     handleCloseCard()

        navigate('/display', { replace: true })
    }, [navigate])

    return (
        <>
            <motion.div
                initial={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 10 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                style={{ position: 'fixed', bottom: '0', left: '0', margin: '10px', zIndex: '100' }}>
                <>
                    <Button type='button' variant="contained" color="primary" onClick={handleClick} >
                        Nouveau
                    </Button>

                    {selectedCard.selected
                        ?
                        <>
                            <Button type='button' variant="contained" color="primary" onClick={handleClickNavigate} >
                                Modifier
                            </Button>

                            <Button type='button' variant="contained" color='primary' style={{ backgroundColor: 'red' }} onClick={handleCloseCard}>
                                Fermer
                            </Button>
                        </>
                        :
                        <Button type='button' variant="contained" color="primary" onClick={handleVisualize} >
                            Visualiser
                        </Button>
                    }
                </>
            </motion.div >
        </>
    )
}

export default Home