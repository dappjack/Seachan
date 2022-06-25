import React, { useState, useEffect, useRef } from 'react';
import { Web3Storage } from 'web3.storage'
import { defaults } from '../../../data/defaults'
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AuthClient } from "@dfinity/auth-client"
import { Actor, HttpAgent } from "@dfinity/agent";
import { faVolumeHigh, faBook } from '@fortawesome/free-solid-svg-icons'

// default board/posts

export const createDefaults = async (actor) => {
  const boards = defaults;
  for (const board of boards) {
    const newBoard = {
      name: board.name,
      abbreviation: board.abbreviation,
      isSfw: typeof (board.isSfw) == 'undefined' ? true : board.isSfw,
      textOnly: typeof (board.textOnly) == 'undefined' ? false : board.textOnly,
      forceAnonymity: typeof (board.forceAnonymity) == 'undefined' ? false : board.forceAnonymity,
      isInDevelopment: typeof (board.isInDevelopment) == 'undefined' ? false : board.isInDevelopment,
      showFlags: typeof (board.showFlags) == 'undefined' ? false : board.showFlags,
      isGated: typeof (board.isGated) == 'undefined' ? false : board.isGated,
      gateType: typeof (board.gateType) == 'undefined' ? "" : board.gateType,
      gateToken: typeof (board.gateToken) == 'undefined' ? "" : board.gateToken,
      gateTokenAmount: typeof (board.gateTokenAmount) == 'undefined' ? 0 : board.gateTokenAmount,
      isListed: typeof (board.isListed) == 'undefined' ? true : board.isListed,
      isShownInHeader: typeof (board.isShownInHeader) == 'undefined' ? false : board.isShownInHeader,
    };
    await actor.createBoard(newBoard);
    const boardPosts = typeof (board.posts) == 'undefined' ? [] : board.posts;
    for (const post of boardPosts) {
      const threadId = await actor.readNextBoardPost(board.abbreviation);
      const posterGuid = guidGenerator();
      const userNameColor = stringToColor(posterGuid, board.abbreviation + threadId.toString());
      const newThread = {
        boardAbbreviation: board.abbreviation,
        userName: typeof (post.userName) == 'undefined' ? "admin" : post.userName,
        posterGuid: posterGuid,
        subject: typeof (post.subject) == 'undefined' ? "subject" : post.subject,
        body: typeof (post.body) == 'undefined' ? "body" : post.body,
        userNameColor: userNameColor,
        isStickied: typeof (post.isStickied) == 'undefined' ? true : post.isStickied,
        isLocked: typeof (post.isLocked) == 'undefined' ? false : post.isLocked,
        filePath: typeof (post.filePath) == 'undefined' ? "" : post.filePath,
        fileType: typeof (post.fileType) == 'undefined' ? "" : post.fileType,
        fileName: typeof (post.fileName) == 'undefined' ? "" : post.fileName,
        fileExtension: typeof (post.fileName) == 'undefined' ? "" : post.fileName.split('.').pop().toLowerCase(),
        fileSize: typeof (post.fileSize) == 'undefined' ? 0 : post.fileSize,
      };
      await actor.createThread(newThread);

      const replyPosts = typeof (post.replies) == 'undefined' ? [] : post.replies;
      for (const reply of replyPosts) {
        // const threadId = await actor.readNextBoardPost(board.abbreviation);
        // const posterGuid = guidGenerator();
        // const userNameColor = stringToColor(posterGuid, board.abbreviation + threadId.toString());
        const newReply = {
          boardAbbreviation: board.abbreviation,
          threadId: threadId,
          userName: typeof (reply.userName) == 'undefined' ? "admin" : reply.userName,
          posterGuid: posterGuid,
          subject: typeof (reply.subject) == 'undefined' ? "" : reply.subject,
          body: typeof (reply.body) == 'undefined' ? "body" : reply.body,
          userNameColor: userNameColor,
          isStickied: typeof (reply.isStickied) == 'undefined' ? true : reply.isStickied,
          isLocked: typeof (reply.isLocked) == 'undefined' ? false : reply.isLocked,
          filePath: typeof (reply.filePath) == 'undefined' ? "" : reply.filePath,
          fileType: typeof (reply.fileType) == 'undefined' ? "" : reply.fileType,
          fileName: typeof (reply.fileName) == 'undefined' ? "" : reply.fileName,
          fileExtension: typeof (reply.fileName) == 'undefined' ? "" : reply.fileName.split('.').pop().toLowerCase(),
          fileSize: typeof (reply.fileSize) == 'undefined' ? 0 : reply.fileSize,
        };
        await actor.createReply(newReply);
      }
    }
  }
};

export const getSiteStats = async (actor) => {
  const boardCount = Promise.resolve(await actor.readListedBoardCount());
  const unlistedBoardCount = Promise.resolve(await actor.readUnlistedBoardCount());
  const userCount = Promise.resolve(await actor.readUserCount());
  const canisterCycles = Promise.resolve(await actor.getCycleBalance());
  return Promise.all([boardCount, unlistedBoardCount, userCount, canisterCycles]).then((values) => {
    var siteStats = {
      'boardCount': Number(BigInt(values[0])),
      'unlistedBoardCount': Number(BigInt(values[1])),
      'userCount': Number(BigInt(values[2])),
      'canisterCycles': intToString(Number(BigInt(values[3])))
    };
    return siteStats
  });
}

/* web3 storage */

export const createWeb3StorageClient = async () => {
  const apiToken = process.env.WEB3_STORAGE_API;
  const client = new Web3Storage({ token: apiToken })
  return client;
}

export const web3StorageUploadFile = async (data) => {
  const apiToken = process.env.WEB3_STORAGE_API;
  const storage = new Web3Storage({ token: apiToken });
  try {
    const cid = await storage.put(data.file, { wrapWithDirectory: false }); // ios fail line
    const fileName = data.file[0].name;
    const filePath = "https://dweb.link/ipfs/" + cid// + "/" + fileName
    return filePath;
  } catch (e) {
    return "";
  }


};

// gateways
// https://ipfs.infura.io/ipfs/
// https://gateway.ipfs.io/ipfs/
// https://cloudflare-ipfs.io/ipfs/
// https://dweb.link/ipfs/


/* board gatekeeping */

export const allowedThroughGate = (user, board) => {
  if (!board.isGated) { return true };
  if (board.isGated && typeof (user) == "undefined") { return false };
  if (board.isGated && !user) { return false }
  if (board.isGated && typeof (user) != "undefined") {
    var gateToken = board.gateToken;
    var gateTokenAmount = board.gateTokenAmount;
    if (board.gateType == "tokens") {
      if (gateToken == "ICP") { if (user.icpBalance >= gateTokenAmount) { return true } else { return false } }
      else { return false }
    }
    if (board.gateType == "nft") {
      if (gateToken == "" && user.nftCollection.length > 0) { return true }
      if (user.nftCollection.length > 0) {
        for (var collection of user.nftCollection) { if (collection.name == gateToken) { return true } }
      }
      else { return false; }
      return false;
    }
  }
};

/* anon poster id */

export const initializeUserSessionId = async (userSessionId) => {
  if (userSessionId == "") {
    const newSessionId = guidGenerator();
    return newSessionId;
  }
  else {
    return userSessionId;
  }
}

/* date parsing */

export const getHumanDateFromNano = (nanoseconds) => {
  const nanosecondNumber = Number(BigInt(nanoseconds));
  const seconds = nanosecondNumber / 1000000;
  var dateObject = new Date(seconds);
  const humanDateFormat = dateObject.toLocaleString().replace(/,/g, "") //2019-12-9 10:30:15
  return humanDateFormat;
}

export function timeSince(nanoseconds) {
  const nanosecondNumber = Number(BigInt(nanoseconds));
  const secondsNumber = nanosecondNumber / 1000000;
  var dateObject = new Date(secondsNumber);

  var seconds = Math.floor((new Date() - dateObject) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) {
    const descriptor = ((Math.floor(interval) == 1) ? ' year' : ' years');
    return Math.floor(interval) + descriptor;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const descriptor = ((Math.floor(interval) == 1) ? ' month' : ' months');
    return Math.floor(interval) + descriptor;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const descriptor = ((Math.floor(interval) == 1) ? ' day' : ' days');
    return Math.floor(interval) + descriptor;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const descriptor = ((Math.floor(interval) == 1) ? ' hour' : ' hours');
    return Math.floor(interval) + descriptor;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const descriptor = ((Math.floor(interval) == 1) ? ' minute' : ' minutes');
    return Math.floor(interval) + descriptor;
  }
  const descriptor = ((Math.floor(interval) == 1) ? ' second' : ' seconds');
  return Math.floor(seconds) + descriptor;
}

/* number parsing */
export function intToString(value) {
  var suffixes = ["", "k", "m", "b", "t"];
  var suffixNum = Math.floor(("" + value).length / 3);
  var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
  if (shortValue % 1 != 0) {
    shortValue = shortValue.toFixed(1);
  }
  return shortValue + suffixes[suffixNum];
}

/* other */

// todo
export const guidGenerator = (seed) => {

  var calculatedSeed = 0;
  if (seed) {
    calculatedSeed = Math.random(seed);
  }
  else {
    calculatedSeed = Math.random()
  }

  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  var posterId = (S4() + S4());
  return posterId;
}

export const getContrast = (hexcolor) => {
  // If a leading # is provided, remove it
  if (hexcolor.slice(0, 1) === '#') {
    hexcolor = hexcolor.slice(1);
  }
  // Convert to RGB value
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);

  // Get YIQ ratio
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Check contrast
  return (yiq >= 128) ? 'black' : 'white';
}

export const compareValues = (key, order = 'asc') => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

export const getFileType = (fileExtension) => {
  var fileType = "";
  switch (fileExtension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'jfif':
    case 'gif':
    case 'svg':
      fileType = "image";
      break;
    case 'mp4':
    case 'mov':
    case 'webm':
      fileType = "video";
      break;
    case 'mp3':
    case 'wav':
    case 'flac':
      fileType = "audio";
      break;
    case 'pdf':
      fileType = "pdf";
      break;
  }
  return fileType;
}

export const humanFileSize = (bytes, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  return bytes.toFixed(dp) + ' ' + units[u];
}

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}


export const stringToColor = (str, hash) => {
  if (str.length === 0) return hash;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  var color = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export var validateFile = (files) => {
  // if (files.length > 0) {
  //   const fileSize = files.item(0).size;
  //   const fileSizeMb = Math.round((fileSize / 1024));
  //   if (fileSizeMb >= 51200) {
  //     alert("File too big, please select a file less than 50mb");
  //     files.value = '';
  //   }
  //   else if (fileSizeMb < 0) {
  //     alert("File too small, please select a file greater than 0b");
  //     files.value = '';
  //   }
  // }
};

export const getReply = (post, board, user, actor) => {
  if (board && post.isOp) {
    return <Link
      to={`/${board.abbreviation}/${post.id}`} user={user} board={board} actor={actor}>
      <span className="pointer horizontal-padding post-reply" title="posts / files">Reply <span className="hidden-mobile">({post.replyCount + 1}/{post.fileCount})</span></span>
    </Link>
  }
}

export const bookmarkThread = (threadId, user) => {
  console.log("bookmarking thread " + threadId);
}

export const getCondensedPrincipal = (principal) => {
  if (principal.length > 10) {
    return principal.split("-")[0] + "..." + principal.split("-").at(-1);
  }
  else {
    return principal;
  }
}

export const toggleImageSize = (setImageStyle, imageStyle) => {
  setImageStyle(!imageStyle);
}

export const toggleFullPrincipal = (setPrincipalStyle, principalStyle) => {
  setPrincipalStyle(!principalStyle);
}

export const getFile = (post, board, setImageStyle, imageStyle, view) => {
  if (view == "list") {
    if (post.fileType == 'audio') { return <a target="_blank" href={post.filePath}><FontAwesomeIcon icon={faVolumeHigh} className="fa-10x fa-fw" /></a> }
    else if (post.fileType == 'image') { return <img onClick={() => toggleImageSize(setImageStyle, imageStyle)} className={imageStyle ? "image-thumb" : "image-full"} src={post.filePath} /> }
    else if (post.fileType == 'pdf') { return <a target="_blank" href={post.filePath}><FontAwesomeIcon icon={faBook} className="fa-10x fa-fw" /></a> }
    else if (post.fileType == 'video') { return <video controls type="video" src={post.filePath} /> }
    else if (post.fileType == 'zip') { return <a target="_blank" href={post.filePath}><FontAwesomeIcon icon={faFileZipper} className="fa-10x fa-fw" /></a> }

  }
  else if (view == "catalog") {
    if (post.fileType == 'audio') { return <Link to={`/${board.abbreviation}/${post.id}`} user={post.user} board={board}><FontAwesomeIcon icon={faVolumeHigh} className="fa-10x fa-fw" /></Link> }
    else if (post.fileType == 'image') { return <Link to={`/${board.abbreviation}/${post.id}`} user={post.user} board={board}><img className="image-thumb-catalog" src={post.filePath} /></Link> }
    else if (post.fileType == 'pdf') { return <Link to={`/${board.abbreviation}/${post.id}`} user={post.user} board={board}><FontAwesomeIcon icon={faBook} className="fa-10x fa-fw" /></Link> }
    else if (post.fileType == 'video') { return <Link to={`/${board.abbreviation}/${post.id}`} user={post.user} board={board}><video controls type="video" src={post.filePath} /></Link> }
    else if (post.fileType == 'zip') { return <a target="_blank" href={post.filePath}><FontAwesomeIcon icon={faFileZipper} className="fa-10x fa-fw" /></a> }
  }
}
