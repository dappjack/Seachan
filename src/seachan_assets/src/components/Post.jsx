import React, { useState, useEffect } from 'react'
import { getHumanDateFromNano, getContrast, humanFileSize, getReply, getCondensedPrincipal, toggleImageSize, toggleFullPrincipal, getFile } from './Functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack, faBookmark, faXmark, faPenToSquare, faEyeSlash, faEye, faWallet, faBan, faLock } from '@fortawesome/free-solid-svg-icons'
// import { backend } from "canisters/backend"
import { Navigate, useNavigate } from "react-router-dom";

const Post = ({ post, board, setRefreshPosts, user, view, actor }) => {
    const [imageStyle, setImageStyle] = useState("false");
    const [principalStyle, setPrincipalStyle] = useState("false");
    const [hideThread, setHideThread] = useState(false);
    const [redirectBoard, setRedirectBoard] = useState(false);
    let navigate = useNavigate();


    useEffect(() => {
        setRedirectBoard(false);
    }, [redirectBoard])
    // const editPost = () => {
    //     alert('editing posts in development');
    // }
    const bookmarkPost = () => {
        alert('bookmarking posts in development');
    }
    return (
        <>
            {redirectBoard && <Navigate replace to={'/' + board.abbreviation} />}
            <div className="post vertical-spacing">
                <p className="post-header">
                    <span>
                        {post.subject && <span className="subject">{post.subject}</span>}
                        {post.subject && <span className="subject-truncated">{post.subject.substring(0, 25)}{post.subject.length > 25 && "..."}</span>}
                        {post.userName && post.userName != "anonymous" &&
                            <span title="user name" className="horizontal-padding border-radius" >
                                {post.userName}
                            </span>
                        }
                        {post.userName && post.userName == "anonymous" && !post.ownerPrincipal &&
                            <>
                                <span className="horizontal-padding">{post.userName}</span>
                                <span className="horizontal-padding border-radius" title="poster id" style={{ background: post.userNameColor, color: getContrast(post.userNameColor) }}>
                                    {post.posterGuid}
                                </span>
                            </>
                        }
                        {/* {post.ownerPrincipal &&
                            <span title="poster principal" onClick={() => toggleFullPrincipal(setPrincipalStyle, principalStyle)} style={{ background: post.userNameColor, color: getContrast(post.userNameColor) }} className="pointer horizontal-padding underline border-radius" >{principalStyle ? getCondensedPrincipal(post.ownerPrincipal) : post.ownerPrincipal}</span>
                        } */}
                        <span className="horizontal-padding hidden-mobile">{getHumanDateFromNano(post.timeStamp)}</span>
                        <span className=" pointer horizontal-padding" onClick={() => setShowCreateReplyForm(true)} >#{post.id}</span>
                        {post.isStickied && <FontAwesomeIcon title="Stickied" icon={faThumbtack} className="fa horizontal-padding hidden-mobile" />}
                        {post.isLocked && <FontAwesomeIcon title="Locked" icon={faLock} className="fa horizontal-padding hidden-mobile" />}
                    </span>
                    <span className="post-operations">
                        {/* {user && <FontAwesomeIcon title="Wallet" icon={faWallet} className="fa pointer horizontal-padding hidden-mobile" />} */}
                        {user && <FontAwesomeIcon icon={faBookmark} title="Bookmark" className="red pointer horizontal-padding hidden-mobile" onClick={() => bookmarkPost(post.id, board.abbreviation, user.id)} />}
                        {/* {user && ["admin", "mod"].includes(user.role) && <FontAwesomeIcon icon={faPenToSquare} title="Edit Post" className="fa blue pointer horizontal-padding hidden-mobile" onClick={() => editPost(post.id, user)} />} */}
                        {post.isOp && !user && <FontAwesomeIcon icon={faBan} title={"Report"} className="pointer horizontal-padding red hidden-mobile" onClick={() => { actor.reportThread(post.id, board.abbreviation, typeof (user?.role) == 'undefined' ? "user" : user?.role) }} />}
                        {!post.isOp && !user && <FontAwesomeIcon icon={faBan} title={"Report"} className="pointer horizontal-padding red hidden-mobile" onClick={() => { actor.reportReply(post.id, parseInt(threadId), post.isOp, board.abbreviation, typeof (user?.role) == 'undefined' ? "user" : user?.role) }} />}
                        {post.isOp && user && ["admin", "mod"].includes(user.role) && <FontAwesomeIcon icon={faBan} title={"Report"} className="pointer horizontal-padding red hidden-mobile" onClick={() => { actor.deleteThread(board.abbreviation, post.id).then(() => {navigate("/" + board.abbreviation);setRefreshPosts(true)}) }} />}
                        {!post.isOp && user && ["admin", "mod"].includes(user.role) && < FontAwesomeIcon icon={faBan} title={"Report"} className="pointer horizontal-padding red hidden-mobile" onClick={() => { actor.deleteReply(board.abbreviation, parseInt(threadId), post.id).then(() => setRefreshPosts(true))/*, unpinIpfsFiles(parseInt(threadId), post.id) */ }} />}
                        <FontAwesomeIcon icon={hideThread ? faEyeSlash : faEye} title="Hide" onClick={() => setHideThread(!hideThread)} className="fa pointer horizontal-margin hidden-mobile" />
                        {getReply(post, board, user, actor)}
                    </span>
                </p>
                {!hideThread &&
                    <div className="post-body">
                        {post.fileName ?
                            <>
                                <span className="file-description" >
                                    <span className="fileName horizontal-padding">
                                        {post.fileName}
                                    </span>
                                    <span className="fileName-truncated horizontal-padding">
                                        {post.fileName.substring(0, 25)}{post.fileName.length > 25 && "..."+post.fileExtension}
                                    </span>
                                    <span className="fileName-truncated horizontal-padding">
                                        ({humanFileSize(post.fileSize)})
                                    </span>
                                    <a target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }} href={post.filePath}>
                                        ipfs link
                                    </a>
                                </span>
                                <br />
                                {getFile(post, board, setImageStyle, imageStyle, view)}
                                <p>{post.body}</p>
                            </> : <p style={{ marginBottom: '10px' }}>{post.body}</p>
                        }
                    </div>
                }
            </div >
        </>
    )
}
export default Post
