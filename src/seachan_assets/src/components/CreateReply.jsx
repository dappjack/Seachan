import React, { useState, useEffect } from 'react';
// import { backend } from "canisters/backend";
import { useForm } from "react-hook-form";
import { stringToColor, getFileType, web3StorageUploadFile, validateFile } from './Functions';
import LoadingSpinner from './LoadingSpinner';
import CryptoJs from 'crypto-js';

const CreateReply = ({ userSessionId, setRefreshBoardList, board, boardId, threadId, boardAbbreviation, web3StorageClient, user, signedIn, setRefreshPosts, actor }) => {
  const [showCreateReplyForm, setShowCreateReplyForm] = React.useState(false)
  const onClick = () => setShowCreateReplyForm(!showCreateReplyForm)
  const [postId, setPostId] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const ReplyForm = () => {
    const { register, handleSubmit } = useForm();
    const handleNewReplyCreate = async (data) => {
      setSubmitting(true);
      const postId = await actor.readNextPost(board.abbreviation);
      setPostId(postId);
      var userId = 0, userNameColor = "#FFFFFF", filePath = "", fileType = "", fileExtension = "", fileName = "", fileSize = 0;
      var principal = typeof (data.principal) == 'undefined' ? "" : data.principal;
      var userName = typeof (data.userName) == 'undefined' ? 'anonymous' : data.userName;
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
        fileExtension = fileName.split('.').pop();
        fileType = getFileType(fileExtension)
        fileSize = data.file[0].size;
      }
      const newReply = {
        threadId: parseInt(threadId),
        boardAbbreviation: board.abbreviation,
        userName: userName,
        posterGuid: userThreadSessionId,
        ownerPrincipal: principal,
        subject: "",
        body: data.body,
        userId: userId,
        userNameColor: userNameColor,
        isStickied: false,
        isLocked: false,
        filePath: filePath,
        fileType: fileType,
        fileExtension: fileExtension,
        fileName: fileName,
        fileSize: fileSize
      };
      await actor.createReply(newReply).then(() => {
        setRefreshBoardList(true);
        setShowCreateReplyForm(false);
      });
      setSubmitting(false);
      setRefreshPosts(true);
    };
    return (
      <form onSubmit={handleSubmit(handleNewReplyCreate)} className="four" autoComplete="off">
        <div className="thread-form">
          {!board.forceAnonymity && <label>name</label>}
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
          <label>body</label>
          <textarea type="text" name="body" {...register('body')} />
          {!board.textOnly && (user?.role == "admin" || user?.role == "mod") &&
            <label>file</label> &&
            <input type="file" name="file" accept=".jpg, .jpeg, .png, .jfif, .gif, .svg, .mp4, .mov, .webm, .mp3, .wav, .flac, .pdf, .txt" {...register('file')} /*onChange={(e) => validateFile(e.target.files)}*/ />
          }
        </div>
        <div className="center">
          <button style={{ textAlign: "center" }} type="submit" className="success  top-spacing">submit</button>
        </div>
      </form >
    );
  };
  return (
    <>
      <div className="centered-row">
        {isSubmitting ? <LoadingSpinner /> : <button onClick={onClick} className="success top-spacing" >reply</button>}
      </div>
      {showCreateReplyForm && !isSubmitting && <ReplyForm />}
    </>
  )
}
export default CreateReply;