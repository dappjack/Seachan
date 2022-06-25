import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { stringToColor, getFileType, validateFile, web3StorageUploadFile } from './Functions';
import LoadingSpinner from './LoadingSpinner';
import CryptoJs from 'crypto-js';

const CreateThread = ({ userSessionId, board, boards, boardId, boardAbbreviation, setRefreshBoardList, web3StorageClient, user, signedIn, showCreateThreadForm, setShowCreateThreadForm, actor }) => {
    const onClick = () => setShowCreateThreadForm(!showCreateThreadForm)
    const [threadId, setThreadId] = useState();
    const [isSubmitting, setSubmitting] = useState(false);
    const [refreshPosts, setRefreshPosts] = useState(false);
    let navigate = useNavigate();

    const ThreadForm = ({ navigate }) => {
        
        const { register, handleSubmit } = useForm();
        const handleNewThreadCreate = async (data) => {
            setSubmitting(true);
            const threadId = await actor.readNextBoardPost(board.abbreviation);
            setThreadId(threadId);
            var userId = 0, userNameColor = "#FFFFFF", filePath = "", fileType = "", fileExtension = "", fileName = "", fileSize = 0, isStickied = false, isLocked = false;
            var principal = typeof (data.principal) == 'undefined' ? "" : data.principal;
            var userName = typeof (data.userName) == 'undefined' ? 'anonymous' : data.userName;
            var userId = typeof (user?.id) == 'undefined' ? '0' : user.userId;
            const threadSpecificHash = board.abbreviation + threadId.toString();
            var userThreadSessionId = CryptoJs.MD5(userSessionId + threadSpecificHash).toString().slice(0, 8);
            if (board.forceAnonymity == false) {
                // anon
                if (!user) { userNameColor = stringToColor(userThreadSessionId, threadSpecificHash) }
                // logged in posting as anon
                else if (user && principal == "" && userName == "anonymous") { userNameColor = stringToColor(userThreadSessionId, threadSpecificHash) }
                // logged in posting with username
                else if (user && principal == "" && userName != "anonymous") { userNameColor = stringToColor(userName, threadSpecificHash) }
                // logged in posting with principal
                else if (user && principal != "" && userName == "anonymous") { userNameColor = stringToColor(principal, threadSpecificHash) }
                // logged in posting with userName and principal
                else if (user && principal != "" && userName != "anonymous") { userNameColor = stringToColor(principal, threadSpecificHash) }
                // else use session id
                else { userNameColor = stringToColor(userThreadSessionId, threadSpecificHash) }
            }
            if (!board.textOnly && data.file && data.file[0]) {
                filePath = await web3StorageUploadFile(data);
                fileName = data.file[0].name;
                fileExtension = fileName.split('.').pop().toLowerCase();
                fileType = getFileType(fileExtension)
                fileSize = data.file[0].size;
            }
            const newThread = {
                boardAbbreviation: boardAbbreviation,
                userName: userName,
                ownerPrincipal: principal,
                subject: data.subject,
                body: data.body,
                isStickied: isStickied,
                isLocked: isLocked,
                userNameColor: userNameColor,
                filePath: filePath,
                fileType: fileType,
                fileExtension: fileExtension,
                fileName: fileName,
                fileSize: fileSize,
                posterGuid: userThreadSessionId
            };
            await actor.createThread(newThread).then(() => {
                let url = "/" + boardAbbreviation + "/" + threadId;
                navigate(url);
            });
        };
        return (
            <form onSubmit={handleSubmit(handleNewThreadCreate)} className="four" autoComplete="off">
                <div className="thread-form">
                    <label>name</label>
                    <select required name="userName"  {...register('userName')} >
                        <option value="anonymous">anonymous</option>
                        {user && !board.forceAnonymity && (<option value={user.userName}>{user.userName}</option>)}
                    </select>
                    {user && !board.forceAnonymity && <label>principal</label>}
                    {user && !board.forceAnonymity &&
                        <select name="principal"  {...register('principal')} >
                            <option value=""></option>
                            <option value={user.principal}>Principal: {user.principal}</option>
                        </select>}
                    <label>subject</label>
                    <input type="text" name="subject" {...register('subject')} />
                    <label>body</label>
                    <textarea type="text" name="body" {...register('body')} />
                    {!board.textOnly && (user?.role == "admin" || user?.role == "mod") &&
                        <label>file</label> &&
                        <input type="file" name="file" accept=".jpg, .jpeg, .png, .jfif, .gif, .svg, .mp4, .mov, .webm, .mp3, .wav, .flac, .pdf, .txt" {...register('file')} /*onChange={(e) => validateFile(e.target.files)}*/ />
                    }
                </div>
                <div className="center">
                    <button type="submit" className="success top-spacing" >submit</button>
                </div>
            </form >
        );
    };
    return (
        <>
            {isSubmitting ? <LoadingSpinner /> : <button onClick={onClick} className="success top-spacing">create thread</button>}
            {showCreateThreadForm && !isSubmitting && <ThreadForm navigate={navigate} setRefreshBoardList={setRefreshBoardList} boardAbbreviation={boardAbbreviation} />}
        </>
    )
}
export default CreateThread;