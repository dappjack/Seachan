import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons'

const Introduction = () => {
    const removeIntro = () => { document.getElementById('intro')!.style.display = 'none' }
    const [hideIntro, setHideIntro] = useState(false);
    return (
        <div className="post-box" id="intro">
            <div className="post">
                <p className="post-header center" >
                    <span className="bold subject" >Welcome to Seachan</span>
                    <FontAwesomeIcon icon={hideIntro ? faEyeSlash : faEye} title="Hide" onClick={() => setHideIntro(!hideIntro) /*toggleHidePost(post.id,hideThread,setHideThread)*/} className="fa pointer horizontal-margin" />
                    <FontAwesomeIcon icon={faBan} className="red pointer" onClick={() => removeIntro()} />
                </p>
                {!hideIntro && <div className="post-body">
                    <p>
                        Seachan is a decentralized social forum built on <a style={{ textDecoration: 'underline' }} href="https://dfinity.org/">Dfinity's Internet Computer</a>.<br /><br />
                        The goal of the project is to create a free-speech oriented forum that is ran by an upcoming opened-sourced, community-owned social DAO.<br />
                        Web3 assets will be used to incentivize peer moderation, bot protection, board gating, games/raffles, and many other planned web3/smart contract functionalities.<br /><br />
                        Please visit <Link style={{ textDecoration: 'underline' }} to={'/meta'}>/meta/</Link> for more information about Seachan.
                    </p>
                </div>}
            </div>
        </div>
    )
}
export default Introduction