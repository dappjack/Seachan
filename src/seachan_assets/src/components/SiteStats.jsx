import React, { useState, useEffect } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faEyeSlash, faEye, faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
// import { backend } from "canisters/backend"
import { intToString } from './Functions'

const SiteStats = ({ siteStats }) => {
    const removeSiteStats = () => { document.getElementById('stats').style.display = 'none' }
    const [hideSiteStats, setHideSiteStats] = useState(true);
    const [siteStatsLoading, setSiteStatsLoading] = useState(false);
    // const [siteStats, setSiteStats] = useState({});
    // const [refreshSiteStats, setRefreshSiteStats] = useState(false);


    return (
        <div className="post-box" id="stats">
            <div className="post">
                <p className="post-header center" >
                    <span className="bold subject" >Stats</span>
                    <FontAwesomeIcon icon={faArrowsRotate} className="pointer" onClick={() => { setRefreshSiteStats(true) }} />
                    <FontAwesomeIcon icon={hideSiteStats ? faEyeSlash : faEye} title="Hide" onClick={() => setHideSiteStats(!hideSiteStats)} className="fa pointer horizontal-margin" />
                    <FontAwesomeIcon icon={faBan} className="red pointer" onClick={() => removeSiteStats()} />
                </p>
                {!hideSiteStats &&
                    <div className="post-body centered-row-space-between">
                        {siteStatsLoading ?
                            <LoadingSpinner /> :
                            <>
                                <span>boards: {siteStats['boardCount']}</span>
                                <span>unlisted boards: {siteStats['unlistedBoardCount']}</span>
                                {/* <span>Threads: {siteStats['threadCount']}</span> */}
                                {/* <span>Posts: {siteStats['postCount']}</span> */}
                                <span>authenticated users: {siteStats['userCount']}</span>
                                <span>cycle balance: {siteStats['canisterCycles']}</span>
                            </>
                        }

                    </div>
                }
            </div>
        </div>
    )
}
export default SiteStats
