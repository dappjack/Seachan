import React, { useEffect, useState } from 'react'
import { compareValues } from './components/Functions';
import NavBar from './components/NavBar'
import { useAuthClient } from './hooks';
import Introduction from './components/Introduction'
import BulletinTester from './components/BulletinTester'
import Boards from './components/Boards'
import Board from './components/Board'
import Thread from './components/Thread'
import Faq from './components/Faq'
import Profile from './components/Profile'
import NotFound from './components/NotFound'
import Logo from './components/Logo'
import SiteStats from './components/SiteStats'
import { idlFactory as seachanIdlFactory } from '../../declarations/seachan';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

const backEnd = "b3b2k-kiaaa-aaaak-qanma-cai";

const App = () => {

  const [boards, setBoards] = useState/*<BoardType[]>*/([]);
  const [actor, setActor] = useState();
  const [headerBoards, setHeaderBoards] = useState/*<BoardType[]>*/([]);
  const [refreshBoardList, setRefreshBoardList] = useState(false);
  const [signedIn, setSignedIn] = useState(false)
  const [user, setUser] = useState()
  const [web3StorageClient, setWeb3StorageClient] = useState()
  const [board, setBoard] = useState();
  const [refreshSiteStats, setRefreshSiteStats] = useState(false);
  const [siteStats, setSiteStats] = useState({});
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [userSessionId, setUserSessionId] = useState(false);
  const [logged, setLogged] = useState(false);

  global.Buffer = global.Buffer;

  useEffect(() => {
    setRefreshBoardList(false);
    const setAnonymousActor = async () => {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const agent = new HttpAgent({ identity });
      agent.fetchRootKey(); // DEV ONLY
      const actor = Actor.createActor(seachanIdlFactory, { agent, canisterId: backEnd });
      setActor(actor);
      return actor;
    }
    const fetchBoards = async (actor) => {
      const boards = await actor.listBoards();
      setBoards(boards.sort(compareValues('abbreviation')));
    }
    const fetchHeaderBoards = async (actor) => {
      const headerBoards = await actor.listHeaderBoards();
      setHeaderBoards(headerBoards.sort(compareValues('abbreviation')));
    }
    const fetchSiteStats = async (actor) => {
      // const canisterCycles = await actor.getCycleBalance();
      var siteStats = {
        'boardCount': Number(BigInt(await actor.readListedBoardCount())),
        'unlistedBoardCount': Number(BigInt(await actor.readUnlistedBoardCount())),
        'userCount': Number(BigInt(await actor.readUserCount())),
        // 'canisterCycles': intToString(Number(BigInt(values[3])))
      };
      setSiteStats(siteStats);
    }
    setAnonymousActor().then(actor => {
      fetchBoards(actor);
      fetchHeaderBoards(actor);
      fetchSiteStats(actor);
    });
  }, [refreshBoardList]);

  return (
    <>
      <Router>
        <NavBar actor={actor} setActor={setActor} headerBoards={headerBoards} setUser={setUser} user={user} setBoard={setBoard} />
        <Routes>
          <Route path="/"
            element={<>
              <Logo />
              <Introduction />
              <BulletinTester />
              {/* <SiteStats actor={actor} /> */}
              <Boards boards={boards} setBoard={setBoard} setRefreshBoardList={setRefreshBoardList} user={user} boardsLoading={boardsLoading} setBoardsLoading={setBoardsLoading} actor={actor} />
            </>}
          />
          <Route path="/profile/:userId" element={<Profile actor={actor} setUser={setUser} user={user} setRefreshBoardList={setRefreshBoardList} />} />
          <Route path="/:abbreviation" element={<Board actor={actor} board={board} setBoard={setBoard} view="list" />} />
          <Route path="/:abbreviation/catalog" element={<Board actor={actor} board={board} setBoard={setBoard} view="catalog" />} />
          <Route path="/:abbreviation/:threadId" element={<Thread userSessionId={userSessionId} setRefreshBoardList={setRefreshBoardList} signedIn={signedIn} web3StorageClient={web3StorageClient} user={user} setBoard={setBoard} board={board} actor={actor} />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
};

export default React.memo(App);
