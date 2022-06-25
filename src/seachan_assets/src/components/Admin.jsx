import React, { useState } from 'react'
import { createBoards, createThreads, createDefaults } from './Functions'
import CreateBoard from './CreateBoard'

const Admin = ({ setUser, user, setRefreshBoardList, actor }) => {
    const [createBoardLoading, setCreateBoardLoading] = useState(false);
    const [deleteAllBoardsLoading, setDeleteAllBoardsLoading] = useState(false);
    const [deleteAllThreadsLoading, setDeleteAllThreadsLoading] = useState(false);
    const [deleteAllRepliesLoading, setDeleteAllRepliesLoading] = useState(false);
    const [createDefaultBoardsLoading, setCreateDefaultBoardsLoading] = useState(false);
    const [createDefaultThreadsLoading, setCreateDefaultThreadsLoading] = useState(false);
    const [createDefaultsLoading, setCreateDefaultsLoading] = useState(false);
    const [deleteAllUsersLoading, setDeleteAllUsersLoading] = useState(false);
    return (
        <>
            <br /><br />
            {user?.role == "admin" && <CreateBoard setRefreshBoardList={setRefreshBoardList} setCreateBoardLoading={setCreateBoardLoading} actor={actor} />}
            <div className="centered-row vertical-spacing">
                <button onClick={() => { actor.getCallerId().then((callerId) => alert(callerId)) }}>show caller ID</button>
            </div>
            <div className="centered-row vertical-spacing">
                <button onClick={() => { setDeleteAllBoardsLoading(true); actor.deleteAllBoards().then(() => { setDeleteAllBoardsLoading(false); setRefreshBoardList(true) }) }} disabled={deleteAllBoardsLoading} className="danger">{!deleteAllBoardsLoading ? "delete all boards" : "deleting all boards..."}</button>
            </div>
            <div className="centered-row vertical-spacing">
                <button onClick={() => { setDeleteAllThreadsLoading(true); actor.deleteAllThreads().then(() => setDeleteAllThreadsLoading(false)) }} disabled={deleteAllThreadsLoading} className="danger">{!deleteAllThreadsLoading ? "delete all threads" : "deleting all threads..."}</button>
                <button onClick={() => { setDeleteAllRepliesLoading(true); actor.deleteAllReplies().then(() => setDeleteAllRepliesLoading(false)) }} disabled={deleteAllRepliesLoading} className="danger">{!deleteAllRepliesLoading ? "delete all replies" : "deleting all replies..."}</button>
            </div>
            <div className="centered-row vertical-spacing">
                <button onClick={() => { setCreateDefaultsLoading(true); createDefaults(actor).then(() => { setCreateDefaultsLoading(false); setRefreshBoardList(true) }) }} disabled={createDefaultsLoading} className="success">{!createDefaultsLoading ? "create default posts" : "creating default posts..."}</button>
            </div>
            <div className="centered-row vertical-spacing">
                <button onClick={() => { setDeleteAllUsersLoading(true); actor.deleteAllUsers().then(() => { setDeleteAllUsersLoading(false); setUser(); }) }} disabled={deleteAllUsersLoading} className="danger">{!deleteAllUsersLoading ? "delete all users" : "deleting all users..."}</button>
            </div>
        </>
    )
}
export default Admin