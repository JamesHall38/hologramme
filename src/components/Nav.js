import React from 'react'
import { Link } from 'react-router-dom'

function Nav() {
    function refreshPage() {
        setInterval(() => {
            window.location.reload(false);
        }, 1000)
    }

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
        </>
    )
}

export default Nav