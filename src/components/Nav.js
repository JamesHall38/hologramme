import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

function Nav({ firebaseLoader, first, setFirst, save, setSave }) {
    function refreshPage() {
        setInterval(() => {
            window.location.reload(false);
        }, 1000)
    }
    const location = window.location

    useEffect(() => {
        if (location.pathname === '/display') {

            if (firebaseLoader.name !== 'empty') {
                if (first) {
                    const test = firebaseLoader.name
                    setSave({ value: 'd' + test })
                    setFirst(false)
                }
                else {
                    if (save.value !== `d${firebaseLoader.name}`) {
                        refreshPage()
                    }
                }
            }
        }
    }, [firebaseLoader, save, first, setSave, setFirst, location.pathname])


    return (
        <>
            <Link onClick={refreshPage} className='links' id='fox' to="/">Fox</Link>
            <Link onClick={refreshPage} className='links' id='meka3d' to="/meka3d">Meka3D</Link>
            <Link onClick={refreshPage} className='links' id='metaadventures' to="/meta-adventures">Meta Adventure</Link>
            <Link onClick={refreshPage} className='links' id='metakonz' to="/metakonz">Meta Konz</Link>
            <Link onClick={refreshPage} className='links' id='metalegends' to="/metalegends">Meta Legends</Link>
            <Link onClick={refreshPage} className='links' id='uaf' to="/uaf">UAF</Link>
            <Link onClick={refreshPage} className='links' id='flayed' to="/flayed">Flayed</Link>
            <Link onClick={refreshPage} className='links' id='botsskull' to="/bots-skull">Bots Skull</Link>
            <Link onClick={refreshPage} className='links' id='Leo_Caillard_Caesar' to="/caesar">Caesar</Link>
            <Link onClick={refreshPage} className='links' id='Leo_Caillard_Caesar_Statue' to="/caesar-statue">Caesar Statue</Link>
            <Link onClick={refreshPage} className='links' id='Leo_Caillard_Proserpine' to="/proserpine">Proserpine</Link>
            <Link onClick={refreshPage} className='links' id='logo' to="/logo">Logo</Link>
            <Link onClick={refreshPage} className='links' id='Urban_token' to="/urban-token">Urban token</Link>
            <Link onClick={refreshPage} className='links' id='meta_adventure_new' to="/meta-adventure-new">Meta-Adventure New</Link>
            <Link onClick={refreshPage} className='links' id='flayed_gold' to="/flayed-gold">Flayed GOLD</Link>
            <Link onClick={refreshPage} className='links' id='dragon' to="/dragon">Dragon</Link>
            <Link onClick={refreshPage} className='links' id='wolf' to="/wolf">Wolf</Link>
            <Link onClick={refreshPage} className='links' id='deer' to="/deer">Deer</Link>
            <Link onClick={refreshPage} className='links' id='spider' to="/spider">Spider</Link>
            <Link onClick={refreshPage} className='links' id='mannequin' to="/mannequin">Mannequin</Link>
        </>
    )
}

export default Nav