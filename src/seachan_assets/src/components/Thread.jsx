import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Post from './Post'
import { compareValues, allowedThroughGate } from './Functions'
import CreateReply from './CreateReply'
import LoadingSpinner from './LoadingSpinner'
// import { backend } from "canisters/backend"
import { Navigate } from "react-router-dom";

const Thread = ({ userSessionId, setRefreshBoardList, signedIn, web3StorageClient, user, setBoard, board, setRedirectBoard, redirectBoard, actor }) => {
    const [posts, setPosts] = useState();
    const [refreshPosts, setRefreshPosts] = useState(false);
    const { abbreviation, threadId } = useParams();
    const [showCreateReplyForm, setShowCreateReplyForm] = React.useState(false)
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setRefreshPosts(false);
        if (board) { setBoard(board); if (!allowedThroughGate(user, board)) { /*setRedirectHome(true) */ }; }
        else { actor.readBoard(abbreviation).then(board => { setBoard(board[0]); if (!allowedThroughGate(user, board[0])) { /*setRedirectHome(true)*/ }; }) }
        actor.listThreadPosts(abbreviation, parseInt(threadId)).then(
            posts => { setPosts([].concat.apply([], posts.sort(compareValues('latestActivityTimeStamp')))); setLoading(false); }
        )
    }, [abbreviation, refreshPosts])
    return (
        <div id="board">
            {board && !isLoading && <Link className="lg-font" to={{ pathname: "/" + board?.abbreviation }} user={user} board={board}> /{board?.abbreviation}/ - {board?.name} #{threadId}</Link>}
            {board && !isLoading &&
                <div className="boardHeader">
                    <div className="one">
                        {posts?.length > 0 && <p>replies: {posts[0].replyCount}</p>}
                    </div>
                    {posts?.length > 0 && posts[0].isLocked == false && <div className="two">
                        <CreateReply userSessionId={userSessionId} setRefreshBoardList={setRefreshBoardList} board={board} boardId={board?.id} threadId={threadId} boardAbbreviation={board?.abbreviation} web3StorageClient={web3StorageClient} user={user} signedIn={signedIn} setRefreshPosts={setRefreshPosts} actor={actor} />
                    </div>}
                    <div className="three">
                    </div>
                </div>}
            {isLoading && <LoadingSpinner />}
            <ul>
                {posts?.length > 0 && posts?.map(post => {
                    return (
                        <li key={post.id}>
                            <Post post={post} board={board} signedIn={signedIn} setRefreshBoardList={setRefreshBoardList} abbreviation={abbreviation} setRefreshPosts={setRefreshPosts} user={user} view="list" setRedirectBoard={setRedirectBoard} redirectBoard={redirectBoard} threadId={threadId} setShowCreateReplyForm={setShowCreateReplyForm} actor={actor} />
                        </li>
                    )
                })}
            </ul>
            {/* {posts?.length == 0 && !showCreateReplyForm &&
                    <Navigate replace to={{ pathname: "/" + board.abbreviation }} />
                } */}
        </div>
    )
}
export default Thread
