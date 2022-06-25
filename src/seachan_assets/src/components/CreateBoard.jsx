import React, { useState, useEffect, useRef } from 'react'
// import { backend } from "canisters/backend"
import { useForm } from "react-hook-form";
import LoadingSpinner from './LoadingSpinner'
import BoardForm from './BoardForm'

const CreateBoard = ({ setRefreshBoardList, user, actor }) => {
    const [showCreateBoardForm, setShowCreateBoardForm] = React.useState(false)
    return (
        <div className="centered-veritcal-column top-spacing centered">
            {<button className="success center" onClick={() => setShowCreateBoardForm(!showCreateBoardForm)}>create board</button>}
            {showCreateBoardForm && <BoardForm setRefreshBoardList={setRefreshBoardList} actor={actor}/>}
        </div>
    )
}
export default CreateBoard;