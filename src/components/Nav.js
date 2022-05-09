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
            <Link onClick={refreshPage} id='gui' to="/">Import</Link>
            <Link onClick={refreshPage} id='gui' to="/meka3d">Meka3D</Link>
            <Link onClick={refreshPage} id='gui' to="/meta-adventures">Meta Adventure</Link>
            <Link onClick={refreshPage} id='gui' to="/metakonz">Meta Konz</Link>
            <Link onClick={refreshPage} id='gui' to="/metalegends">Meta Legends</Link>
            <Link onClick={refreshPage} id='gui' to="/uaf">UAF</Link>
            <Link onClick={refreshPage} id='gui' to="/flayed">Flayed</Link>
            <Link onClick={refreshPage} id='gui' to="/bots-skull">Bots Skull</Link>
        </div>
    )
}

export default Nav