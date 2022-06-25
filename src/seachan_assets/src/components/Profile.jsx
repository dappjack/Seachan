import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from "react-router-dom";
import Admin from './Admin'
import { timeSince, getHumanDateFromNano } from './Functions'
// import { backend } from "canisters/backend"

import { getAllUserNFTs } from '@psychedelic/dab-js'
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const Profile = ({ setUser, user, setRefreshBoardList, actor }) => {
    const [fetchNftsLoading, setFetchNftsLoading] = useState(false);
    let navigate = useNavigate();

    useEffect(() => {
    }, [user])

    const addUserNfts = async (userId, nftCollection, actor) => {

        await actor.addUserNfts(userId, nftCollection).then(user => {
            setUser(user[0]);
        })
    }

    const getNFTCollections = async (principal) => {

        const nftCollections = await getAllUserNFTs(
            { user: principal }
        );

        nftCollections.forEach(collection => {
            if (collection['tokens']) {
                var tokenArray = [];
                collection['tokens'].forEach(token => {
                    const index = token.index;
                    const url = token.url;
                    tokenArray.push({ "index": index, "url": url })
                });

                delete collection['tokens'];
                collection['tokens'] = tokenArray;
            }
        });
        return nftCollections;
    }
    return (
        <>
            {!user && <Navigate replace to={'/'} />}
            {user &&
                <>
                    <div className="intro">
                        <div className="post-box-small">
                            <p className="post-header center" >
                                <span className="subject" >user data</span>
                            </p>
                            <div className="post-body">
                                <p>principal: {user?.principal}</p>
                                <p>username: {user?.userName}</p>
                                <p>role: {user?.role}</p>
                                <p>registration date: {timeSince(user?.registrationTimeStamp)} ago ({getHumanDateFromNano(user?.registrationTimeStamp)})</p>
                                <p>ICP: {Math.round(user?.icpBalance * 100) / 100}</p>
                                {/* <p>XTC: {Math.round(user?.xtcBalance*100)/100}</p>
                                <p>WICP: {Math.round(user?.wicpBalance*100)/100}</p> */}
                            </div>
                        </div>
                    </div>
                    <div className="intro">
                        <div className="post-box-small">
                            <p className="post-header center" >
                                <span className="subject" >nft data</span>
                            </p>
                            <div className="post-body centered-veritcal-column">
                                {user?.nftCollection.length > 0 &&
                                    user?.nftCollection.map(nft => {
                                        return (
                                            <div style={{ textAlign: "center" }} key={nft.canisterId} >
                                                <p className="vertical-spacing">{nft.name}</p>
                                                {nft.tokens?.map(token => <img key={token.index} src={token.url} title={"#" + token.index} style={{ width: "200px", height: "200", margin: "10px" }} />)}
                                            </div>
                                        )
                                    })
                                }
                                {user?.nftCollection.length == 0 &&
                                    <p>no nfts found</p>
                                }
                                <div >
                                    <button
                                        onClick={() => {
                                            setFetchNftsLoading(true);
                                            getNFTCollections(user?.principal).then((nftCollections) => { addUserNfts(user?.id, nftCollections, actor); setFetchNftsLoading(false) })
                                        }}
                                        disabled={fetchNftsLoading}
                                        className="success vertical-spacing"
                                        title="powered by DAB registry" >
                                        {!fetchNftsLoading ? "sync DAB registry nfts" : "syncing DAB registry nfts..."}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="centered-row vertical-spacing">
                        <button onClick={() => { setUser(); navigate("/"); }} className="danger" >sign out</button>
                    </div>
                </>
            }
            {
                (user?.role == "admin" || user?.role == "mod") &&
                <Admin setUser={setUser} user={user} setRefreshBoardList={setRefreshBoardList} actor={actor} />
            }
        </>
    )

}
export default Profile;