import React from 'react'
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import { Auth } from "./Auth"
import { NavBarBoards } from "./NavBarBoards"
import { Theme } from "./Theme"

const NavBar = ({ actor, setActor, setBoard, headerBoards, setUser, user }) => {
    return (
        <ul id="navbar">
            <li><Link to='/'><FontAwesomeIcon icon={faHouse} /></Link></li>
            <NavBarBoards headerBoards={headerBoards} user={user} setBoard={setBoard} />
            <li><Theme /><Auth actor={actor} setActor={setActor} setUser={setUser} user={user} /></li>
        </ul>
    )
}
export default NavBar
