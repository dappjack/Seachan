import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import Post from './Post'
import { compareValues, allowedThroughGate } from './Functions'
import CreateThread from './CreateThread'
import LoadingSpinner from './LoadingSpinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTableCellsLarge, faAlignJustify } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";
import CatalogPost from './CatalogPost'

export function Board({ userSessionId, setRefreshBoardList, signedIn, web3StorageClient, user, board, setBoard, boards, view, setShowCreateReplyForm, actor }) {
  const { abbreviation } = useParams();
  const [posts, setPosts] = useState([]);
  const [refreshPosts, setRefreshPosts] = useState(false);
  const [showCreateThreadForm, setShowCreateThreadForm] = React.useState(false)
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      actor.readBoardDesc(abbreviation).then(board => {
        setBoard(board[0]);
        actor.listBoardThreads(abbreviation).then(posts => {
          setPosts(posts.sort(compareValues('id', 'asc')));
          setLoading(false)
        })
        // TODO sort stickies, then other threads
      })
    })();
  }, [abbreviation, refreshPosts]);

  return (
    <div id="board">
      {board && !isLoading && <Link className="lg-font" to={{ pathname: "/" + abbreviation }}>/{board?.abbreviation}/ {board?.name}</Link>}
      {board && !isLoading &&
        <div className="boardHeader">
          <div className="one">
            <p>threads: {board.threadCount.toString()}</p>
          </div>
          <div className="two">
            <CreateThread userSessionId={userSessionId} board={board} boards={boards} boardId={board?.id} boardAbbreviation={board?.abbreviation} setRefreshBoardList={setRefreshBoardList} web3StorageClient={web3StorageClient} user={user} signedIn={signedIn} showCreateThreadForm={showCreateThreadForm} setShowCreateThreadForm={setShowCreateThreadForm} actor={actor} />
          </div>
          <div className="three">
            {view == "list" ?
              <Link onClick={() => { setBoard(board) }} to={{ pathname: "/" + abbreviation + '/catalog' }} >
                <FontAwesomeIcon className="horizontal-spacing lg-font" title="Catalog View" icon={faTableCellsLarge} />
              </Link>
              :
              <Link onClick={() => { setBoard(board) }} to={{ pathname: "/" + abbreviation }} >
                <FontAwesomeIcon className="horizontal-spacing lg-font" title="List View" icon={faAlignJustify} />
              </Link>
            }
          </div>
        </div>}
      <br />
      {isLoading && <LoadingSpinner />}
      {!isLoading &&
        <ul className={view == "catalog" ? "catalog vertical-spacing one" : ""}>
          {posts?.length > 0 && !isLoading && posts?.map(post => {
            return (
              <li key={post.id} >
                {view == "list" && <Post post={post} board={board} setRefreshPosts={setRefreshPosts} user={user} view={view} setShowCreateReplyForm={setShowCreateReplyForm} actor={actor} />}
                {view == "catalog" && <CatalogPost post={post} board={board} setRefreshPosts={setRefreshPosts} user={user} view={view} setShowCreateReplyForm={setShowCreateReplyForm} actor={actor} />}
              </li>
            )
          })
          }
        </ul>
      }
    </div>
  )
}
export default Board