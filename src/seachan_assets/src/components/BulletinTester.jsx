import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";

const BulletinTester = () => {
    const removeBulletin = () => { document.getElementById('bulletin-tester').style.display = 'none' }
    const [hideIntro, setHideIntro] = useState(true);

    return (
        <>
            <div className="post-box" id="bulletin-tester">
                <div className="post">
                    <p className="post-header center" >
                        <span className="bold subject" >Seachan Alpha</span>
                        <FontAwesomeIcon icon={hideIntro ? faEyeSlash : faEye} title="Hide" onClick={() => setHideIntro(!hideIntro) /*toggleHidePost(post.id,hideThread,setHideThread)*/} className="fa pointer horizontal-margin" />
                        <FontAwesomeIcon icon={faBan} className="red pointer" onClick={() => removeBulletin()} />
                    </p>
                    {!hideIntro && <div className="post-body">
                        <p>
                        Seachan is currently in an early, limited access testing phase.<br/>
                        Ongoing improvements include site documentation, mobile layout, UI improvements, bug fixes, and code optimization.<br/>
                        If you would like to contribute to the project in any way please take note of the following:<br/><br/>

                        {'>'} <b>Bugs</b>: If you find any bugs that aren't already listed in the <Link style={{ textDecoration: 'underline' }} to={'/meta'}>/meta/ "bugs"</Link> thread, please post it there and be as descriptive as possible (post images if needed).<br/>
                        {'>'} <b>Branding ideas</b>: We are open to suggestions for the theming and branding of the site. Post any oc, board cover image art, site name ideas, or CSS palette styles in the <Link style={{ textDecoration: 'underline' }} to={'/meta/5'}>/meta/ "branding"</Link> thread.<br/>
                        {'>'} <b>Feature requests</b>: Post them in the <Link style={{ textDecoration: 'underline' }} to={'/meta/1'}>/meta/ "feature requests"</Link> thread if it isn't already listed.<br/>
                        {'>'} <b>Donations</b>: We will be accepting donated ICP cycles that will directly fund the front and back end canisters. The canister cycle amount will be displayed on the home page, and a log of donations will be posted on the <Link to={'/meta'}>/meta/ "donations"</Link> thread.<br/>
                        {'>'} <b>Contact</b>: <a style={{ textDecoration: 'underline' }} href="mailto:seachan@dmail.ai">seachan@dmail.ai</a><br/><br/>
                        </p>
                    </div>}
                </div>
            </div>
        </>
    )
}
export default BulletinTester