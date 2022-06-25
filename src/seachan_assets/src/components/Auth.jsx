import React, { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { AuthClient } from "@dfinity/auth-client";
import { getCondensedPrincipal } from './Functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfinity, faPlug, faRightFromBracket, faS } from '@fortawesome/free-solid-svg-icons'
import { StoicIdentity } from "ic-stoic-identity";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { useNavigate } from "react-router-dom";
import { idlFactory as seachanIdlFactory } from '../../../declarations/seachan';
import LoadingSpinner from './LoadingSpinner';
import { canisterId, createActor } from "../../../declarations/seachan";

export function Auth({ actor, setActor, user, setUser }) {

  const frontnd = "th2xf-nyaaa-aaaap-qaitq-cai"; //r7inp-6aaaa-aaaaa-aaabq-cai //th2xf-nyaaa-aaaap-qaitq-cai
  const backEnd = "b3b2k-kiaaa-aaaak-qanma-cai"; //ryjl3-tyaaa-aaaaa-aaaba-cai //b3b2k-kiaaa-aaaak-qanma-cai
  const ii_local = "http://rrkah-fqaaa-aaaaa-aaaaq-cai.localhost:8000/#authorize";

  let navigate = useNavigate();

  const [signInLoading, setSignInLoading] = useState(false)

  // const initAuth = async () => {
  //   const authClient = await AuthClient.create()
  //   setAuthClient(authClient)
  // }

  // const signInIc0 = async () => {
  //   const authClient = await AuthClient.create()
  //   authClient.login({
  //     identityProvider: "https://identity.ic0.app",
  //     onSuccess: async () => {
  //       // const actor = createActor(canisterId, {
  //       //   agentOptions: {
  //       //     identity: authClient?.getIdentity(),
  //       //   },
  //       // });
  //       // actor.createUser(authClient?.getIdentity(), "ic0", 0).then(user => {
  //       //   setActor(actor)
  //       //   setUser(user[0])
  //       //   navigate("/profile/" + user[0].id.toString());
  //       // })
  //     },
  //   })
  // }

  const login = async () => {
    const authClient = await AuthClient.create()
    authClient?.login({
      identityProvider: process.env.II_URL,
      onSuccess: async () => {
        const actor = createActor(canisterId, {
          agentOptions: {
            identity: authClient?.getIdentity(),
          },
        });
        await actor.createUser("ic0", 0).then(user => { setUser(user[0]); navigate("/profile/" + user[0].id.toString()); })

        // setIsAuthenticated(true);
        // setTimeout(() => {
        //   setHasLoggedIn(true);
        // }, 100);
      },
    });
  };

  const signInIc0 = async () => {
    const authClient = await AuthClient.create()
    authClient.login({
      identityProvider:
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : ii_local,
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        const agent = new HttpAgent({ identity });
        agent.fetchRootKey(); // DEV ONLY
        // const ledger = LedgerCanister.create();
        // const accountIdentifier = AccountIdentifier.fromPrincipal({
        //   principal: principal,
        // });
        // const icpBalance = await ledger.accountBalance({ accountIdentifier });
        const actor = Actor.createActor(seachanIdlFactory, { agent, canisterId: backEnd }); // backend canister
        await actor.createUser(principal, "ic0", Number(BigInt(icpBalance.toE8s()))).then(user => { setUser(user[0]) })
      },
      onError: () => { console.log("unable to log in") },
    })
  }

  const signInPlug = async (actor) => {
    (async () => {
      const whitelist = [frontnd, backEnd];
      await window?.ic?.plug?.requestConnect({
        whitelist,
      });
      // const actor = await window.ic.plug.createActor({
      //   canisterId: backEnd,
      //   interfaceFactory: seachanIdlFactory,
      // });
      const plugBalances = await window.ic.plug.requestBalance();
      const icpBalance = plugBalances[0].amount
      const plugAgent = await window.ic.plug.agent;
      actor.createUser(await plugAgent.getPrincipal(), "plug", icpBalance).then(user => {
        setActor(actor)
        setUser(user[0])
        // navigate("/profile/" + user[0].id.toString());
      })
    }
    )();



    // const whitelist = [frontnd, backEnd];
    // const host = "https://mainnet.dfinity.network";
    // try {
    //   await window.ic.plug.requestConnect({ whitelist, host, timeout: 50000 });
    //   const plugAgent = await window.ic.plug.agent;
    //   const principal = await plugAgent.getPrincipal();
    //   const plugBalances = await window.ic.plug.requestBalance();
    //   const icpBalance = plugBalances[0].amount
    //   console.log("icpBalance", icpBalance);
    //   // const authClient = await AuthClient.create();
    //   // const identity = authClient.getIdentity();
    //   const agent = new HttpAgent({ identity });
    //   console.log("backEnd",backEnd)
    //   const actor = Actor.createActor(seachanIdlFactory, { agent, canisterId: backEnd }); // backend canister
    //   agent.fetchRootKey(); // DEV ONLY
    //   setActor(actor);
    //   await actor.createUser(principal, "plug", icpBalance).then(user => {
    //     setActor(actor)
    //     setUser(user[0])
    //     navigate("/profile/" + user[0].id.toString());
    //   })
    // }
    // catch (e) { alert("unable to connect to plug wallet", e) }
  }

  // Stoic
  const signInStoic = async () => {
    StoicIdentity.load().then(async identity => {
      if (!identity) { identity = await StoicIdentity.connect() }
      const agent = new HttpAgent({ identity });
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: process.env.BACKEND_CANISTER_ID,
      });
      const principal = identity.getPrincipal();
      // console.log("principal", principal)
      // console.log("actor", actor)
      const ledger = LedgerCanister.create();
      const accountIdentifier = AccountIdentifier.fromPrincipal({ principal: principal });
      // console.log("principal2", principal)
      const icpBalance = await ledger.accountBalance({ accountIdentifier });
      // console.log("icpBalance", icpBalance)
      const icpBalanceParsed = Number(BigInt(icpBalance.toE8s())) / 100_000_000;
      // console.log("icpBalanceParsed", icpBalanceParsed)
      await actor.createUser(principal, "stoic", icpBalanceParsed).then(user => { setUser(user[0]) });
      setActor(actor)
      StoicIdentity.disconnect();
    })
  }

  return (
    <>
      {signInLoading && "logging in..."}
      {!signInLoading && !user && <FontAwesomeIcon title="Plug Wallet" onClick={() => { setSignInLoading(true); signInPlug(actor).then(() => setSignInLoading(false)) }} className="pointer horizontal-padding" icon={faPlug} />}
      {/* {!signInLoading && !user && <FontAwesomeIcon title="Stoic Wallet" onClick={() => { setSignInLoading(true); signInStoic().then(() => setSignInLoading(false)) }} className="pointer horizontal-padding" icon={faS} />}
      {!signInLoading && !user && <FontAwesomeIcon title="Internet Id" onClick={() => { setSignInLoading(true); signInIc0().then(() => setSignInLoading(false)) }} className="pointer horizontal-padding" icon={faInfinity} />} */}
      {!signInLoading && user && <Link title="profile" to={'/profile/' + user.id} user={user} >{user?.principal && getCondensedPrincipal(user?.principal)}</Link>}
      {!signInLoading && user && <FontAwesomeIcon title="sign out" onClick={() => { setUser(); }} className="pointer horizontal-padding" icon={faRightFromBracket} />}
      {/* {signInLoading && <LoadingSpinner />} */}
    </>
  )
}
export default Auth;
