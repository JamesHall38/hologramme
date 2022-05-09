import React from 'react'
import { Link } from 'react-router-dom'

function Nav() {
    function refreshPage() {
        setInterval(() => {
            window.location.reload(false);
        }, 1000)
    }

    return (
        <div className='nav'>
            <Link onClick={refreshPage} to="/">Import</Link>
            <Link onClick={refreshPage} to="/meka3d">Meka3D</Link>
            <Link onClick={refreshPage} to="/meta-adventure">Meta Adventure</Link>
            <Link onClick={refreshPage} to="/metakonz">Meta Konz</Link>
            <Link onClick={refreshPage} to="/metalegends">Meta Legends</Link>
            <Link onClick={refreshPage} to="/uaf">UAF</Link>
            <Link onClick={refreshPage} to="/flayed">Flayed</Link>
            <Link onClick={refreshPage} to="/bots-skull">Bots Skull</Link>
        </div>
    )
}

export default Nav