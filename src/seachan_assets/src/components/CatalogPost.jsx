import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { getFile } from './Functions'

const CatalogPost = ({ post, board, setRefreshPosts, user, view, actor }) => {
    const [imageStyle, setImageStyle] = useState(false);
    return (
        <div className="catalog-card">
            {post.fileName && board && getFile(post, board, setImageStyle, imageStyle, view)}
            <div className="catalog-card-body">
                <div className="catalog-card-subject">
                    <Link  to={{ pathname: "/"+board.abbreviation+"/"+post.id }} user={post.user} board={board}><span className="subject sm-font" title="Posts / Files">{post.replyCount + 1} / {post.fileCount}</span></Link>
                    <br />
                    <Link to={{ pathname: "/"+board.abbreviation+"/"+post.id }} user={post.user} board={board}>{post.subject && <span className="subject">{post.subject}</span>}</Link>
                </div>
                <p>{post.body}</p>
            </div>
        </div>
    )
}
export default CatalogPost
