import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { timeSince, allowedThroughGate } from './Functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faArrowsRotate, faTriangleExclamation, faScrewdriverWrench, faParagraph, faUserSecret, faFlag, faKey, faWallet, faLock, faLockOpen, faImage } from '@fortawesome/free-solid-svg-icons'
import LoadingSpinner from './LoadingSpinner'

const Boards = ({ boards, setBoard, setRefreshBoardList, user, boardsLoading, setBoardsLoading, actor }) => {
    return (
        <div className="boards">
            <div className="center">
                <p className="lg-font">boards</p>
                <FontAwesomeIcon onClick={() => { setBoardsLoading(true); setRefreshBoardList(true); setBoardsLoading(false) }} icon={faArrowsRotate} id="refresh" />
            </div>
            {boardsLoading &&
                <div className="vertical-spacing">
                    <LoadingSpinner />
                </div>
            }
            {boards?.length > 0 && !boardsLoading &&
                <table cellSpacing="0">
                    <thead>
                        <tr>
                            <th>abbreviation</th>
                            <th>name</th>
                            <th>threads</th>
                            <th>latest activity</th>
                            <th>tags</th>
                            <th>gate</th>
                            {user && ["admin", "mod"].includes(user.role) && <th>auth</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {boards?.length > 0 && !boardsLoading && boards?.map(board => {
                            var isAllowed = allowedThroughGate(user, board);
                            return (
                                <tr key={board.abbreviation}>
                                    <td>{isAllowed ? <Link onClick={() => { setBoard(board) }} to={`/${board.abbreviation}/`} board={board}>/{board.abbreviation}/</Link> : <span onClick={() => { alert("You don't meet the requirements to access this board") }}>/{board.abbreviation}/</span>}</td>
                                    <td>{isAllowed ? <Link onClick={() => { setBoard(board) }} to={`/${board.abbreviation}/`} board={board}>{board.name}</Link> : <span onClick={() => { alert("You don't meet the requirements to access this board") }}>{board.name}</span>}</td>
                                    <td>{board.threadCount}</td>
                                    <td>{timeSince(board.latestActivityTimeStamp)} ago</td>
                                    <td>
                                        {board.isInDevelopment && <FontAwesomeIcon className="horizontal-padding" title="In Development" icon={faScrewdriverWrench} />}
                                        {!board.isSfw && <FontAwesomeIcon className="horizontal-padding" title="Nsfw" icon={faTriangleExclamation} />}
                                        {board.textOnly && <FontAwesomeIcon className="horizontal-padding" title="Text Only" icon={faParagraph} />}
                                        {board.showFlags && <FontAwesomeIcon className="horizontal-padding" title="Flags Shown" icon={faFlag} />}
                                        {board.forceAnonymity && <FontAwesomeIcon className="horizontal-padding" title="Forced Anonymity" icon={faUserSecret} />}
                                        {board.isGated && <FontAwesomeIcon className="horizontal-padding" title="Gated" icon={faKey} />}
                                        {board.isGated && board.gateType == "tokens" && <FontAwesomeIcon className="horizontal-padding" title="Gated" icon={faWallet} /> && <span title={"Gate-kept by " + board.gateTokenAmount.toString() + " " + board.gateToken}>{board.gateTokenAmount.toString()} {board.gateToken}</span>}
                                        {board.isGated && board.gateType == "nft" && <FontAwesomeIcon className="horizontal-padding" title="Gated" icon={faWallet} /> && <span title={"Gate-kept by " + board.gateToken}><FontAwesomeIcon className="horizontal-padding" title={board.gateToken} icon={faImage} /></span>}
                                    </td>
                                    <td>{isAllowed == false && board.isGated && <FontAwesomeIcon className="horizontal-padding" title="Locked" icon={faLock} />}{isAllowed == true && board.isGated && <FontAwesomeIcon className="horizontal-padding" title="Unlocked" icon={faLockOpen} />}</td>
                                    {user && ["admin", "mod"].includes(user.role) && <td><FontAwesomeIcon icon={faBan} className="pointer horizontal-padding red" onClick={async () => { actor.deleteBoard(board.abbreviation).then(() => { setRefreshBoardList(true) }) }} /></td>}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            }
            <br/><br/><br/><br/><br/>
        </div >
    )
}
export default Boards
