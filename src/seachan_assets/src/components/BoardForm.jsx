import React, { useState, useEffect, useRef } from 'react'
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
// import { backend } from "canisters/backend"

const BoardForm = ({setRefreshBoardList, actor}) => {
    const { register, handleSubmit } = useForm();
    const [isSfwChecked, setIsSfwChecked] = useState(true);
    const [isTextOnlyChecked, setIsTextOnlyChecked] = useState(false);
    const [isListedChecked, setIsListedChecked] = useState(true);
    const [isShownInHeaderChecked, setIsShownInHeaderChecked] = useState(false);
    const [isForceAnonymityChecked, setIsForceAnonymityChecked] = useState(false);
    const [isGatedChecked, setIsGatedChecked] = useState(false);
    const [gateType, setGateType] = useState('');
    const [password, setPassword] = useState('');
    const [createBoardLoading, setCreateBoardLoading] = useState(false);
    let navigate = useNavigate();
    
    const handleBoardCreate = async (data) => {
        
        setCreateBoardLoading(true);
        const isUniqueAbbreviation = await actor.isUniqueAbbreviation(data.abbreviation)
        if (isUniqueAbbreviation) {
            const newBoard = {
                name: data.name,
                abbreviation: data.abbreviation,
                isSfw: typeof (data.isSfw) == 'undefined' ? true : data.isSfw === "true",
                textOnly: typeof (data.textOnly) == 'undefined' ? false : data.textOnly === "true",
                forceAnonymity: typeof (data.forceAnonymity) == 'undefined' ? false : data.forceAnonymity === "true",
                isInDevelopment: false,
                showFlags: false,
                isGated: typeof (data.isGated) == 'undefined' ? false : data.isGated === "true",
                gateType: typeof (data.gateType) == 'undefined' ? '' : data.gateType,
                gateToken: typeof (data.gateToken) == 'undefined' ? '' : data.gateToken,
                gateTokenAmount: typeof (data.gateTokenAmount) == 'undefined' ? 0 : Number(data.gateTokenAmount),
                isListed: typeof (data.isListed) == 'undefined' ? true : data.isListed === "true",
                isShownInHeader: typeof (data.isShownInHeader) == 'undefined' ? false : data.isShownInHeader === "true",
            }

            await actor.createBoard(newBoard).then(createdBoard => {
                setRefreshBoardList(true);
                let url = "/" + createdBoard[0].abbreviation;
                navigate(url);
            })
        }
        else {
            alert("duplicate board abbreviation");
            setCreateBoardLoading(false);
            setShowCreateBoardForm(false);
        }
    };
    return (
        <form style={{textAlign:"center"}} onSubmit={handleSubmit(handleBoardCreate)} autoComplete="off">
            <input type="text" className="horizontal-margin" placeholder="abbreviation" name="abbreviation" pattern="[a-zA-Z]*" required {...register('abbreviation')} /><br /><br />
            <input type="text" className="horizontal-margin" placeholder="name" name="name" required {...register('name')} />
            {/* sfw */}
            <br />
            <label className="horizontal-margin" title="not safe for work">
                <input
                    name="isSfw" {...register('isSfw')}
                    type="checkbox"
                    className="horizontal-margin"
                    checked={isSfwChecked}
                    value={isSfwChecked}
                    onChange={() => { setIsSfwChecked(!isSfwChecked) }}
                />
                sfw</label>
            {/* text only */}
            <br />
            <label className="horizontal-margin" title="text only">
                <input
                    name="textOnly" {...register('textOnly')}
                    type="checkbox"
                    className="horizontal-margin"
                    checked={isTextOnlyChecked}
                    value={isTextOnlyChecked}
                    onChange={() => { setIsTextOnlyChecked(!isTextOnlyChecked) }}
                />
                text only (no files allowed)</label>
            {/* listed */}
            <br />
            <label className="horizontal-margin" title="listed on homepage">
                <input
                    name="isListed" {...register('isListed')}
                    type="checkbox"
                    className="horizontal-margin"
                    checked={isListedChecked}
                    value={isListedChecked}
                    onChange={() => { setIsListedChecked(!isListedChecked) }}
                />
                listed</label>
            {/* anonymity */}
            <br />
            <label className="horizontal-margin" title="force anonymity">
                <input
                    name="forceAnonymity" {...register('forceAnonymity')}
                    type="checkbox"
                    className="horizontal-margin"
                    checked={isForceAnonymityChecked}
                    value={isForceAnonymityChecked}
                    onChange={() => { setIsForceAnonymityChecked(!isForceAnonymityChecked) }}
                />
                force anonymity (no internet id logins)</label>
            {/* header */}
            <br />
            <label className="horizontal-margin" title="show in header">
                <input
                    name="isShownInHeader" {...register('isShownInHeader')}
                    type="checkbox"
                    className="horizontal-margin"
                    checked={isShownInHeaderChecked}
                    value={isShownInHeaderChecked}
                    onChange={() => { setIsShownInHeaderChecked(!isShownInHeaderChecked) }}
                />
                show in header</label>
            {/* gated */}
            <br />
            <label className="horizontal-margin" title="gated">
                <input
                    name="isGated" {...register('isGated')}
                    type="checkbox"
                    className="horizontal-margin"
                    checked={isGatedChecked}
                    value={isGatedChecked}
                    onChange={() => { setIsGatedChecked(!isGatedChecked) }}
                />
                gated</label>
            {/* gate type */}
            <br />
            {isGatedChecked &&
                <>
                    <label className="horizontal-margin" title="gate type">gate type:
                        <select className="horizontal-margin" name="gateType"  {...register('gateType')} onChange={event => setGateType(event.target.value)}>
                            <option value=""></option>
                            <option value="tokens">tokens</option>
                            <option value="nft">nft</option>
                        </select>
                    </label>
                    <br />
                </>}
            {/* gate token and amount */}
            {isGatedChecked && gateType == "tokens" &&
                <>
                    <br />
                    <label className="horizontal-margin" title="gate token">gate tokens:
                        <input style={{ width: "5rem" }} className="horizontal-margin" type="number" name="gateTokenAmount"  {...register('gateTokenAmount')} ></input>
                        <select className="horizontal-margin" name="gateToken"  {...register('gateToken')} >
                            <option value="ICP">ICP</option>
                        </select>

                    </label>
                    <br />
                </>}
            {isGatedChecked && gateType == "nft" &&
                <>
                    <br />
                    <label className="horizontal-margin" title="gate token">gate nft:
                        <select className="horizontal-margin" name="gateToken"  {...register('gateToken')} >
                            <option value="Motoko Day Drop">Motoko Day Drop</option>
                        </select>
                    </label>
                    <br />
                </>}
            <br />
            <button className="success horizontal-margin" disabled={createBoardLoading} stype="submit">{!createBoardLoading ? "create" : "creating..."}</button>
        </form >
    );
};
export default BoardForm;
