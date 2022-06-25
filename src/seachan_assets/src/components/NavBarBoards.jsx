import React from 'react'
import { Link } from "react-router-dom";
import { allowedThroughGate } from './Functions'

export function NavBarBoards({ setBoard, headerBoards, user }) {
    return (
        headerBoards?.map(board => {
            var isAllowed = allowedThroughGate(user, board);
            return (
                <li key={board.abbreviation}>
                        {isAllowed ? <Link onClick={() => { setBoard(board) }} to={"/" + board.abbreviation} board={board}>[{board.abbreviation}]</Link> :
                        <span onClick={() => { alert("You don't meet the requirements to access this board") }}>[{board.abbreviation}]</span>}
                </li>
            )
        })
    )
}
export default NavBarBoards
