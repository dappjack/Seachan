import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Map "mo:base/HashMap";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Order "mo:base/Order";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";

import Types "./Types";
import Utils "./Utils";

actor Main {
    
    /* types */
    type BoardType = Types.BoardType;
    type BoardDescType = Types.BoardDescType;
    type PostType = Types.PostType;
    type UserType = Types.UserType;
    type Cycle = Nat;
    type NftCollectionType = Types.NftCollectionType;
    type Role = Types.Role;
    type Id = Types.Id;

    /* keys */
    type Key<K> = Trie.Key<K>;
    func textKey(t: Text) : Key<Text> { { key = t; hash = Text.hash t } };
    func natKey(x : Nat32) : Trie.Key<Nat32> { return { hash = x; key = x };  };

    /* cycles */
    public func getCycleBalance() : async Nat { return Cycles.balance() };

    /* boards */
    private stable var nextBoardId : Nat32 = 0;
    private stable var boards : Trie.Trie<Text, BoardType> = Trie.empty();
    public shared query(msg) func readNextBoard() : async Nat32 { return nextBoardId; };
    public shared query(msg) func readBoardCount() : async Nat { return Trie.size(boards) };
    public shared query(msg) func readListedBoardCount() : async Nat { return Trie.size(Trie.filter<Text, BoardType>(boards, func (k, v) { v.isListed == true })) };
    public shared query(msg) func readUnlistedBoardCount() : async Nat { return Trie.size(Trie.filter<Text, BoardType>(boards, func (k, v) { v.isListed == false })) };

    public shared(msg) func createBoard({name:Text;abbreviation:Text;isSfw:Bool;textOnly:Bool;forceAnonymity:Bool;isInDevelopment:Bool;showFlags:Bool;isGated:Bool;gateType:Text;gateToken:Text;gateTokenAmount:Nat32;isListed:Bool;isShownInHeader:Bool;}) : async ?BoardType {
        // if(Utils.isAdmin(msg.caller)) {
            if (await isUniqueAbbreviation(abbreviation)) {
                let boardId = nextBoardId;
                var newBoard = {
                    id = boardId;
                    abbreviation = abbreviation;
                    name = name;
                    timeStamp = Time.now():Int;
                    latestActivityTimeStamp = Time.now():Int;
                    ownerPrincipal = msg.caller;
                    nextPost = 0:Nat32;
                    threadCount = 0:Nat32;
                    postCount = 0:Nat32;
                    isSfw = isSfw;
                    showFlags = showFlags;
                    textOnly = textOnly;
                    forceAnonymity = forceAnonymity;
                    isGated:Bool = isGated;
                    gateType:Text = gateType;
                    gateToken:Text = gateToken;
                    gateTokenAmount:Nat32 = gateTokenAmount;
                    isListed:Bool = isListed;
                    isShownInHeader:Bool = isShownInHeader;
                    isInDevelopment = isInDevelopment;
                    allFileCount = 0:Nat32;
                    allFileSize = 0:Nat32;
                    posts:Trie.Trie<Nat32, PostType> = Trie.empty();
                };
                boards := Trie.put(boards, textKey(abbreviation), Text.equal, newBoard).0;
                nextBoardId := nextBoardId + 1;
                return ?newBoard;
            }
            else { return null };
        // }
        // else { return null };
    };

    public shared query(msg) func readBoard(abbreviation : Text) : async ?BoardType {
        let boardResult = Trie.find(boards, textKey(abbreviation), Text.equal);
        let boardExists = Option.isSome(boardResult);
        switch(boardResult) {
            case(?boardExists) {
                if (boardExists.isGated == false) { return ?boardExists }
                else {
                    let userResult = Iter.toArray(Trie.iter(Trie.filter<UserId, UserType>(users, func (k, v) { v.principal == Principal.toText(msg.caller) })))[0].1;
                    let userExists = Option.isSome(?userResult);
                    switch(userResult) {
                        case(userExists) {
                            if (Text.equal(boardExists.gateType,"tokens") and Text.equal(boardExists.gateToken, "ICP") and Float.greaterOrEqual(userExists.icpBalance, Float.fromInt(Nat32.toNat(boardExists.gateTokenAmount)))) {
                                return ?boardExists;
                            };
                            if (Text.equal(boardExists.gateType,"nft") and Text.equal(boardExists.gateToken,"") and Float.greaterOrEqual(Float.fromInt(userExists.nftCollection.size()),0)) {
                                return ?boardExists;
                            };
                            if (Text.equal(boardExists.gateType,"nft") and not Text.equal(boardExists.gateToken,"")) {
                                for (x in userExists.nftCollection.vals()) {
                                    if (Text.equal(x.name, boardExists.gateToken)) {
                                        return ?boardExists;
                                    }
                                 };
                            };
                            return null;
                        };
                    };
                };
            };
            case(null) {
                return null;
            };
        }
    };

    public shared query(msg) func readBoardDesc(abbreviation : Text) : async ?BoardDescType {
        let boardResult = Trie.find(boards, textKey(abbreviation), Text.equal);
        let boardExists = Option.isSome(boardResult);
        switch(boardResult) {
            case(?boardExists) {
                var boardDesc = {
                    id=boardExists.id;
                    abbreviation=boardExists.abbreviation;
                    name=boardExists.name;
                    timeStamp=boardExists.timeStamp;
                    latestActivityTimeStamp=boardExists.latestActivityTimeStamp;
                    threadCount=boardExists.threadCount;
                    isSfw=boardExists.isSfw;
                    showFlags=boardExists.showFlags;
                    textOnly=boardExists.textOnly;
                    isGated=boardExists.isGated;
                    gateType=boardExists.gateType;
                    gateToken=boardExists.gateToken;
                    gateTokenAmount=boardExists.gateTokenAmount;
                    isListed=boardExists.isListed;
                    isShownInHeader=boardExists.isShownInHeader;
                    forceAnonymity=boardExists.forceAnonymity;
                    isInDevelopment=boardExists.isInDevelopment;
                };
                return ?boardDesc;
            };
            case(null) {
                return null;
            };
        }
    };

    public shared query(msg) func readNextBoardPost(abbreviation : Text) : async Nat32 { 
        let result = Trie.find(boards, textKey(abbreviation), Text.equal);
        let exists = Option.isSome(result);
        switch(result) {
            case(?exists) { return exists.nextPost };
            case(null) { return 0 };
        }
    };

    public shared query(msg) func listBoards() : async [BoardDescType] {
        let filteredBoards = Trie.filter<Text, BoardType>(boards, func (k, v) { v.isListed == true });
        let boardBuffer : Buffer.Buffer<BoardDescType> = Buffer.Buffer(Trie.size(filteredBoards));
        for (board in Iter.toArray(Trie.iter(filteredBoards)).vals()) {boardBuffer.add({id=board.1.id;abbreviation=board.1.abbreviation;name=board.1.name;timeStamp=board.1.timeStamp;latestActivityTimeStamp=board.1.latestActivityTimeStamp;threadCount=board.1.threadCount;isSfw=board.1.isSfw;showFlags=board.1.showFlags;textOnly=board.1.textOnly;isGated=board.1.isGated;gateType=board.1.gateType;gateToken=board.1.gateToken;gateTokenAmount=board.1.gateTokenAmount;isListed=board.1.isListed;isShownInHeader=board.1.isShownInHeader;forceAnonymity=board.1.forceAnonymity;isInDevelopment=board.1.isInDevelopment;})};
        return boardBuffer.toArray();
    };

    public shared query(msg) func listHeaderBoards() : async [BoardDescType] {
        let filteredBoards = Trie.filter<Text, BoardType>(boards, func (k, v) { v.isShownInHeader == true });
        let boardBuffer : Buffer.Buffer<BoardDescType> = Buffer.Buffer(Trie.size(filteredBoards));
        for (board in Iter.toArray(Trie.iter(filteredBoards)).vals()) {boardBuffer.add({id=board.1.id;abbreviation=board.1.abbreviation;name=board.1.name;timeStamp=board.1.timeStamp;latestActivityTimeStamp=board.1.latestActivityTimeStamp;threadCount=board.1.threadCount;isSfw=board.1.isSfw;showFlags=board.1.showFlags;textOnly=board.1.textOnly;isGated=board.1.isGated;gateType=board.1.gateType;gateToken=board.1.gateToken;gateTokenAmount=board.1.gateTokenAmount;isListed=board.1.isListed;isShownInHeader=board.1.isShownInHeader;forceAnonymity=board.1.forceAnonymity;isInDevelopment=board.1.isInDevelopment;})};
        return boardBuffer.toArray();
    };

    public shared query(msg) func listUnListedBoards() : async [BoardDescType] {
        let filteredBoards = Trie.filter<Text, BoardType>(boards, func (k, v) { v.isListed == false });
        let boardBuffer : Buffer.Buffer<BoardDescType> = Buffer.Buffer(Trie.size(filteredBoards));
        for (board in Iter.toArray(Trie.iter(filteredBoards)).vals()) {boardBuffer.add(board.1)};
        return boardBuffer.toArray();
    };

    public shared(msg) func deleteBoard(abbreviation : Text) {
        let result = Trie.find(boards, textKey(abbreviation), Text.equal);
        let exists = Option.isSome(result);
        switch(result) {
            case(?exists) {
                if (Utils.isAdmin(msg.caller) or Utils.isOwner(msg.caller,exists.ownerPrincipal)) {
                    boards := Trie.remove(boards, textKey(abbreviation), Text.equal).0;
                };
            };
            case(null) {
            };
        };
    };
    
    public shared(msg) func deleteAllBoards() {
        // if(Utils.isAdmin(msg.caller)) {
            boards := Trie.empty();
            nextBoardId := 0;
        // }
    };

    /* todo */
    public shared(msg) func updateBoard(abbreviation : Text, board : BoardType) {

        let result = Trie.find(boards, textKey(abbreviation), Text.equal);
        let exists = Option.isSome(result);
        switch(result) {
            case(?exists) {
                if (Utils.isAdmin(msg.caller) or Utils.isOwner(msg.caller,exists.ownerPrincipal)) {
                    boards := Trie.replace(
                        boards,
                        textKey(abbreviation),
                        Text.equal,
                        ?board,
                    ).0;
                };
            };
            case(null) {
            };
        };
    };

    public query func isUniqueAbbreviation(abbreviation : Text) : async Bool {
        let boardTrie = Trie.filter<Text, BoardType>(boards, func (k, v) { v.abbreviation == abbreviation });
        return Trie.isEmpty(boardTrie);
    };

    public shared(msg) func updateLatestPost(abbreviation : Text, latestActivityTimeStamp: Int) {
        if(Utils.isBackend(msg.caller)) {
            let result = Trie.find(boards, textKey(abbreviation), Text.equal);
            let exists = Option.isSome(result);
            switch(result) {
                case(?exists) {
                    var newBoard = {
                        id = exists.id;
                        name = exists.name;
                        abbreviation = exists.abbreviation;
                        timeStamp = exists.timeStamp;
                        latestActivityTimeStamp = latestActivityTimeStamp;
                        ownerPrincipal = exists.ownerPrincipal;
                        threadCount = exists.threadCount;
                        postCount = exists.postCount;
                        nextPost = exists.nextPost;
                        isSfw = exists.isSfw;
                        showFlags = exists.showFlags;
                        textOnly = exists.textOnly;
                        forceAnonymity = exists.forceAnonymity;
                        isGated = exists.isGated;
                        gateType = exists.gateType;
                        gateToken = exists.gateToken;
                        gateTokenAmount = exists.gateTokenAmount;
                        isListed = exists.isListed;
                        isShownInHeader = exists.isShownInHeader;
                        isInDevelopment = exists.isInDevelopment;
                        allFileCount = exists.allFileCount;
                        allFileSize = exists.allFileSize;
                        posts = exists.posts;
                    };
                    boards := Trie.replace(
                        boards,
                        textKey(abbreviation),
                        Text.equal,
                        ?newBoard,
                    ).0;
                };
                case(null) {
                };
            };
        };
    };

    /* post */

    private stable var nextPost : Nat32 = 0;

    public shared(msg) func createThread({boardAbbreviation:Text;userName:Text;subject:Text;body:Text;isStickied:Bool;isLocked:Bool;userNameColor:Text;filePath:Text;fileType:Text;fileExtension:Text;fileName:Text;fileSize:Nat32;posterGuid:Text}) : async ?PostType {
        var isAllowed = true;
        let boardResult = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        
        let boardExists = Option.isSome(boardResult);
        switch(boardResult) {
            case(?boardExists) {
                // // not gated
                // if (not boardExists.isGated) { isAllowed := true };

                // // gated and anonymous caller
                // if (boardExists.isGated and Principal.isAnonymous(msg.caller)) { isAllowed := false }

                // // gated and not anonymous caller
                // else {
                //     let userResult = Iter.toArray(Trie.iter(Trie.filter<UserId, UserType>(users, func (k, v) { v.principal == Principal.toText(msg.caller) })));
                //     let userExists = Option.isSome(?userResult[0].1);
                //     switch(userResult) {
                //         case(userExists) {
                //             if (Text.equal(boardExists.gateType,"tokens") and Text.equal(boardExists.gateToken, "ICP") and Float.greaterOrEqual(userResult[0].1.icpBalance, Float.fromInt(Nat32.toNat(boardExists.gateTokenAmount)))) {
                //                 isAllowed := true;
                //             };
                //             if (Text.equal(boardExists.gateType,"nft") and Text.equal(boardExists.gateToken,"") and Float.greaterOrEqual(Float.fromInt(userResult[0].1.nftCollection.size()),0)) {
                //                 isAllowed := true;
                //             };
                //             if (Text.equal(boardExists.gateType,"nft") and boardExists.gateToken != "") {
                //                 for (x in userResult[0].1.nftCollection.vals()) {
                //                     if (Text.equal(x.name, boardExists.gateToken)) { isAllowed := true }
                //                  };
                //             };
                //         };
                //     };
                // };
                if (isAllowed) {
                    var posts = boardExists.posts;
                    let timeStamp = Time.now() : Int;
                    let latestActivityTimeStamp = Time.now() : Int;
                    updateLatestPost(boardAbbreviation,timeStamp);
                    let nextPostId = boardExists.nextPost;
                    var fileCount = 0 : Nat32;
                    if (filePath != "") {
                        fileCount := fileCount + 1;
                    };
                    var newThread = {
                        id = nextPostId;
                        boardAbbreviation = boardAbbreviation;
                        ownerPrincipal = msg.caller;
                        userName = userName;
                        posterGuid = posterGuid;
                        subject = subject;
                        body = body;
                        isStickied = isStickied;
                        isLocked = isLocked;
                        isOp = true;
                        userNameColor = userNameColor;
                        timeStamp = timeStamp;
                        latestActivityTimeStamp = latestActivityTimeStamp;
                        reportCount = 0 : Nat32;
                        replies = Trie.empty();
                        replyCount = 0 : Nat32;
                        fileCount = fileCount : Nat32;
                        filePath = filePath;
                        fileType = fileType;
                        fileExtension = fileExtension;
                        fileName = fileName;
                        fileSize = fileSize;
                    };
                    posts := Trie.replace(
                        posts,
                        natKey(nextPostId),
                        Nat32.equal,
                        ?newThread,
                    ).0;
                    var newBoard = {
                        id = boardExists.id;
                        name = boardExists.name;
                        abbreviation = boardExists.abbreviation;
                        timeStamp = boardExists.timeStamp;
                        latestActivityTimeStamp = boardExists.latestActivityTimeStamp;
                        ownerPrincipal = boardExists.ownerPrincipal;
                        nextPost = boardExists.nextPost+1;
                        threadCount = boardExists.threadCount+1;
                        postCount = boardExists.postCount+1;
                        isSfw = boardExists.isSfw;
                        showFlags = boardExists.showFlags;
                        textOnly = boardExists.textOnly;
                        forceAnonymity = boardExists.forceAnonymity;
                        isGated = boardExists.isGated;
                        gateType = boardExists.gateType;
                        gateToken = boardExists.gateToken;
                        gateTokenAmount = boardExists.gateTokenAmount;
                        isListed = boardExists.isListed;
                        isShownInHeader = boardExists.isShownInHeader;
                        isInDevelopment = boardExists.isInDevelopment;
                        allFileCount = boardExists.allFileCount;
                        allFileSize = boardExists.allFileSize;
                        posts = posts;
                    };
                    boards := Trie.replace(
                        boards,
                        textKey(boardExists.abbreviation),
                        Text.equal,
                        ?newBoard,
                    ).0;
                    return ?newThread;
                }
                else { return null  };
            };
            case(null){ return null };
        };
    };

    public shared(msg) func createReply({boardAbbreviation:Text;threadId:Nat32;userName:Text;subject:Text;body:Text;isStickied:Bool;isLocked:Bool;userNameColor:Text;filePath:Text;fileType:Text;fileExtension:Text;fileName:Text;fileSize:Nat32;posterGuid:Text}) : async ?PostType {
        
        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        let timeStamp = Time.now() : Int;
        let latestActivityTimeStamp = Time.now() : Int;
        
        updateLatestPost(boardAbbreviation,timeStamp);
        let boardExists = Option.isSome(board);
        switch(board) {
            case(?boardExists) {
                var posts = boardExists.posts;

                let thread = Trie.find(posts, natKey(threadId), Nat32.equal);
                let threadExists = Option.isSome(board);
                switch(thread) {
                    case(?threadExists) {
                        var fileCount = threadExists.fileCount;
                        let newPostId = boardExists.nextPost;

                        if (threadExists.filePath != "") {
                            fileCount := fileCount + 1;
                        };
                        
                        var replies  = threadExists.replies;
                        var newReply = {
                            id = newPostId;
                            boardAbbreviation = boardAbbreviation;
                            ownerPrincipal = msg.caller;
                            userName = userName;
                            posterGuid = posterGuid;
                            subject = subject;
                            body = body;
                            isStickied = isStickied;
                            isOp = false;
                            isLocked = isLocked;
                            userNameColor = userNameColor;
                            timeStamp = timeStamp;
                            latestActivityTimeStamp = latestActivityTimeStamp;
                            reportCount = 0 : Nat32;
                            replies = Trie.empty();
                            replyCount = 0 : Nat32;
                            fileCount = 0 : Nat32;
                            filePath = filePath;
                            fileType = fileType;
                            fileExtension = fileExtension;
                            fileName = fileName;
                            fileSize =  fileSize;
                        };
                        replies := Trie.replace(
                            replies,
                            natKey(newPostId),
                            Nat32.equal,
                            ?newReply,
                         ).0;

                         var updatedThread = {
                            id = threadExists.id;
                            boardAbbreviation = threadExists.boardAbbreviation;
                            ownerPrincipal = threadExists.ownerPrincipal;
                            userName = threadExists.userName;
                            posterGuid = threadExists.posterGuid;
                            subject = threadExists.subject;
                            body = threadExists.body;
                            isStickied = threadExists.isStickied;
                            isLocked = threadExists.isLocked;
                            isOp = threadExists.isOp;
                            userNameColor = threadExists.userNameColor;
                            timeStamp = threadExists.timeStamp;
                            latestActivityTimeStamp = latestActivityTimeStamp;
                            reportCount = threadExists.reportCount : Nat32;
                            replies = replies;
                            replyCount = Nat32.fromNat(Trie.size(replies)) : Nat32;
                            fileCount = fileCount: Nat32;
                            filePath = threadExists.filePath;
                            fileType = threadExists.fileType;
                            fileExtension = fileExtension;
                            fileName = threadExists.fileName;
                            fileSize = threadExists.fileSize;
                        };
                        posts := Trie.replace(
                            posts,
                            natKey(threadExists.id),
                            Nat32.equal,
                            ?updatedThread,
                        ).0;

                        var newBoard = {
                            id = boardExists.id;
                            name = boardExists.name;
                            abbreviation = boardExists.abbreviation;
                            timeStamp = boardExists.timeStamp;
                            latestActivityTimeStamp = boardExists.timeStamp;
                            ownerPrincipal = boardExists.ownerPrincipal;
                            nextPost = boardExists.nextPost+1;
                            threadCount = Nat32.fromNat(Trie.size(posts)) : Nat32;
                            postCount = boardExists.postCount;
                            isSfw = boardExists.isSfw;
                            showFlags = boardExists.showFlags;
                            textOnly = boardExists.textOnly;
                            forceAnonymity = boardExists.forceAnonymity;
                            isGated = boardExists.isGated;
                            gateType = boardExists.gateType;
                            gateToken = boardExists.gateToken;
                            gateTokenAmount = boardExists.gateTokenAmount;
                            isListed = boardExists.isListed;
                            isShownInHeader = boardExists.isShownInHeader;
                            isInDevelopment = boardExists.isInDevelopment;
                            allFileCount = boardExists.allFileCount;
                            allFileSize = boardExists.allFileSize;
                            posts = posts;
                        };
                        boards := Trie.replace(
                            boards,
                            textKey(boardExists.abbreviation),
                            Text.equal,
                            ?newBoard,
                        ).0;
                        return ?newReply;
                    };
                    case(null) {
                        return null;
                    };
                }
            };
        };
    };

    public shared(msg) func reportThread(threadId: Nat32, boardAbbreviation : Text, userRole : Text) {

        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);        
        let boardExists = Option.isSome(board);
        switch(board) {
            case(?boardExists) {
                var posts = boardExists.posts;
                let thread = Trie.find(posts, natKey(threadId), Nat32.equal);
                let threadExists = Option.isSome(board);
                switch(thread) {
                    case(?threadExists) {
                        var reportCount = threadExists.reportCount + 1;
                        if (userRole == "admin" or userRole == "mod"){
                            deleteThread(boardAbbreviation,threadId);
                        };

                        var updatedThread = {
                            id = threadExists.id;
                            boardAbbreviation = threadExists.boardAbbreviation;
                            ownerPrincipal = threadExists.ownerPrincipal;
                            userName = threadExists.userName;
                            posterGuid = threadExists.posterGuid;
                            subject = threadExists.subject;
                            body = threadExists.body;
                            isStickied = threadExists.isStickied;
                            isLocked = threadExists.isLocked;
                            isOp = threadExists.isOp;
                            userNameColor = threadExists.userNameColor;
                            timeStamp = threadExists.timeStamp;
                            latestActivityTimeStamp = threadExists.latestActivityTimeStamp;
                            reportCount = reportCount: Nat32;
                            replies = threadExists.replies;
                            replyCount = Nat32.fromNat(Trie.size(threadExists.replies)) : Nat32;
                            fileCount = threadExists.fileCount: Nat32;
                            filePath = threadExists.filePath;
                            fileType = threadExists.fileType;
                            fileExtension = threadExists.fileExtension;
                            fileName = threadExists.fileName;
                            fileSize = threadExists.fileSize;
                        };
                        posts := Trie.replace(
                            posts,
                            natKey(threadExists.id),
                            Nat32.equal,
                            ?updatedThread,
                        ).0;

                        var newBoard = {
                            id = boardExists.id;
                            name = boardExists.name;
                            abbreviation = boardExists.abbreviation;
                            timeStamp = boardExists.timeStamp;
                            latestActivityTimeStamp = boardExists.latestActivityTimeStamp;
                            ownerPrincipal = boardExists.ownerPrincipal;
                            nextPost = boardExists.nextPost+1;
                            threadCount = Nat32.fromNat(Trie.size(posts)) : Nat32;
                            postCount = boardExists.postCount;
                            isSfw = boardExists.isSfw;
                            showFlags = boardExists.showFlags;
                            textOnly = boardExists.textOnly;
                            forceAnonymity = boardExists.forceAnonymity;
                            isGated = boardExists.isGated;
                            gateType = boardExists.gateType;
                            gateToken = boardExists.gateToken;
                            gateTokenAmount = boardExists.gateTokenAmount;
                            isListed = boardExists.isListed;
                            isShownInHeader = boardExists.isShownInHeader;
                            isInDevelopment = boardExists.isInDevelopment;
                            allFileCount = boardExists.allFileCount;
                            allFileSize = boardExists.allFileSize;
                            posts = posts;
                        };
                        boards := Trie.replace(
                            boards,
                            textKey(boardExists.abbreviation),
                            Text.equal,
                            ?newBoard,
                        ).0;
                };
                case(null) {
                };
                }
            };
        };
    };

    public shared(msg) func reportReply(postId : Nat32, threadId: Nat32, isOp : Bool, boardAbbreviation : Text, userRole : Text) {

        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);        
        let boardExists = Option.isSome(board);
        switch(board) {
            case(?boardExists) {
                var posts = boardExists.posts;
                let thread = Trie.find(posts, natKey(threadId), Nat32.equal);
                let threadExists = Option.isSome(board);
                switch(thread) {
                    case(?threadExists) {
                        let reply = Trie.find(threadExists.replies, natKey(postId), Nat32.equal);
                        let replyExists = Option.isSome(reply);
                        switch(reply) {
                            case(?replyExists) {
                                var reportCount = replyExists.reportCount + 1;
                                if (userRole == "admin" or userRole == "mod"){
                                    deleteReply(boardAbbreviation,threadId,postId);
                                };
                                var newReply = {
                                    id = replyExists.id;
                                    boardAbbreviation = replyExists.boardAbbreviation;
                                    ownerPrincipal = replyExists.ownerPrincipal;
                                    userName = replyExists.userName;
                                    posterGuid = replyExists.posterGuid;
                                    subject = replyExists.subject;
                                    body = replyExists.body;
                                    isStickied = replyExists.isStickied;
                                    isOp = replyExists.isOp;
                                    isLocked = replyExists.isLocked;
                                    userNameColor = replyExists.userNameColor;
                                    timeStamp = replyExists.timeStamp;
                                    latestActivityTimeStamp = replyExists.latestActivityTimeStamp;
                                    reportCount = reportCount : Nat32;
                                    replies = replyExists.replies;
                                    replyCount = replyExists.replyCount : Nat32;
                                    fileCount = replyExists.fileCount : Nat32;
                                    filePath = replyExists.filePath;
                                    fileType = replyExists.fileType;
                                    fileExtension = replyExists.fileExtension;
                                    fileName = replyExists.fileName;
                                    fileSize =  replyExists.fileSize;
                                };
                                var replies = Trie.replace(
                                    threadExists.replies,
                                    natKey(replyExists.id),
                                    Nat32.equal,
                                    ?newReply,
                                ).0;

                                var updatedThread = {
                                    id = threadExists.id;
                                    boardAbbreviation = threadExists.boardAbbreviation;
                                    ownerPrincipal = threadExists.ownerPrincipal;
                                    userName = threadExists.userName;
                                    posterGuid = threadExists.posterGuid;
                                    subject = threadExists.subject;
                                    body = threadExists.body;
                                    isStickied = threadExists.isStickied;
                                    isLocked = threadExists.isLocked;
                                    isOp = threadExists.isOp;
                                    userNameColor = threadExists.userNameColor;
                                    timeStamp = threadExists.timeStamp;
                                    latestActivityTimeStamp = threadExists.latestActivityTimeStamp;
                                    reportCount = threadExists.reportCount : Nat32;
                                    replies = replies;
                                    replyCount = Nat32.fromNat(Trie.size(threadExists.replies)) : Nat32;
                                    fileCount = threadExists.fileCount: Nat32;
                                    filePath = threadExists.filePath;
                                    fileType = threadExists.fileType;
                                    fileExtension = threadExists.fileExtension;
                                    fileName = threadExists.fileName;
                                    fileSize = threadExists.fileSize;
                                };
                                posts := Trie.replace(
                                    posts,
                                    natKey(threadExists.id),
                                    Nat32.equal,
                                    ?updatedThread,
                                ).0;

                                var newBoard = {
                                    id = boardExists.id;
                                    name = boardExists.name;
                                    abbreviation = boardExists.abbreviation;
                                    timeStamp = boardExists.timeStamp;
                                    latestActivityTimeStamp = boardExists.latestActivityTimeStamp;
                                    ownerPrincipal = boardExists.ownerPrincipal;
                                    nextPost = boardExists.nextPost+1;
                                    threadCount = Nat32.fromNat(Trie.size(posts)) : Nat32;
                                    postCount = boardExists.postCount;
                                    isSfw = boardExists.isSfw;
                                    showFlags = boardExists.showFlags;
                                    textOnly = boardExists.textOnly;
                                    forceAnonymity = boardExists.forceAnonymity;
                                    isGated = boardExists.isGated;
                                    gateType = boardExists.gateType;
                                    gateToken = boardExists.gateToken;
                                    gateTokenAmount = boardExists.gateTokenAmount;
                                    isListed = boardExists.isListed;
                                    isShownInHeader = boardExists.isShownInHeader;
                                    isInDevelopment = boardExists.isInDevelopment;
                                    allFileCount = boardExists.allFileCount;
                                    allFileSize = boardExists.allFileSize;
                                    posts = posts;
                                };
                                boards := Trie.replace(
                                    boards,
                                    textKey(boardExists.abbreviation),
                                    Text.equal,
                                    ?newBoard,
                                ).0;
                            }
                        }
                };
                case(null) {
                };
                }
            };
        };
    };

    public shared(msg) func listBoardThreads(boardAbbreviation : Text) : async [PostType]  {

        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        let exists = Option.isSome(board);
        switch(board) {
            case(?exists) {
                let threadBuffer : Buffer.Buffer<PostType> = Buffer.Buffer(Trie.size(exists.posts));
                for (thread in Iter.toArray(Trie.iter(exists.posts)).vals()) {threadBuffer.add(thread.1)};
                return threadBuffer.toArray();
            };
            case(null) {
                return [];
            };
        };
    };

    public shared(msg) func listThreadPosts(boardAbbreviation : Text, threadId : Nat32) : async [?PostType] {
        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        let boardExists = Option.isSome(board);
        switch(board) {
            case(?boardExists) {
                let thread = Trie.find(boardExists.posts, natKey(threadId), Nat32.equal);
                let threadExists = Option.isSome(board);
                switch(thread) {
                    case(?threadExists) {
                        let postBuffer : Buffer.Buffer<?PostType> = Buffer.Buffer(Trie.size(threadExists.replies)+1);
                        postBuffer.add(?threadExists);
                        for (reply in Iter.toArray(Trie.iter(threadExists.replies)).vals()) {postBuffer.add(?reply.1);};

                        let postArray = postBuffer.toArray();
                        return postArray;                                
                    };
                    case(null) {
                        return [];
                    };
                };
            };
            case(null) {
                return [];
            };
        };
        return [];
    };
    
    public query func readNextPost(boardAbbreviation:Text) : async Nat32 { return nextPost; };

    public shared(msg) func deleteThreads(boardAbbreviation : Text) {

        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        let exists = Option.isSome(board);
            switch(board) {
                case(?exists) {
                    var newBoard = {
                        id = exists.id;
                        name = exists.name;
                        abbreviation = exists.abbreviation;
                        timeStamp = exists.timeStamp;
                        latestActivityTimeStamp = exists.latestActivityTimeStamp;
                        ownerPrincipal = exists.ownerPrincipal;
                        nextPost = 0 : Nat32;
                        threadCount = 0 : Nat32;
                        postCount = 0 : Nat32;
                        isSfw = exists.isSfw;
                        showFlags = exists.showFlags;
                        textOnly = exists.textOnly;
                        forceAnonymity = exists.forceAnonymity;
                        isGated = exists.isGated;
                        gateType = exists.gateType;
                        gateToken = exists.gateToken;
                        gateTokenAmount = exists.gateTokenAmount;
                        isListed = exists.isListed;
                        isShownInHeader = exists.isShownInHeader;
                        isInDevelopment = exists.isInDevelopment;
                        allFileCount = exists.allFileCount;
                        allFileSize = exists.allFileSize;
                        posts = Trie.empty();
                    };
                    boards := Trie.replace(
                        boards,
                        textKey(exists.abbreviation),
                        Text.equal,
                        ?newBoard,
                    ).0;
                };
                case(null) {
                };
            }
    };

    public shared(msg) func deleteThread(boardAbbreviation : Text, postId : Nat32) {

        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        let boardExists = Option.isSome(board);
        switch(board) {
            case(?boardExists) {
                let filteredPosts = Trie.filter<Nat32, PostType>(boardExists.posts, func (k, v) { k != postId });
                var newBoard = {
                    id = boardExists.id;
                    name = boardExists.name;
                    abbreviation = boardExists.abbreviation;
                    timeStamp = boardExists.timeStamp;
                    latestActivityTimeStamp = boardExists.latestActivityTimeStamp;
                    ownerPrincipal = boardExists.ownerPrincipal;
                    nextPost = boardExists.nextPost+1;
                    threadCount = Nat32.fromNat(Trie.size(filteredPosts)) : Nat32;
                    postCount = boardExists.postCount;
                    isSfw = boardExists.isSfw;
                    showFlags = boardExists.showFlags;
                    textOnly = boardExists.textOnly;
                    forceAnonymity = boardExists.forceAnonymity;
                    isGated = boardExists.isGated;
                    gateType = boardExists.gateType;
                    gateToken = boardExists.gateToken;
                    gateTokenAmount = boardExists.gateTokenAmount;
                    isListed = boardExists.isListed;
                    isShownInHeader = boardExists.isShownInHeader;
                    isInDevelopment = boardExists.isInDevelopment;
                    allFileCount = boardExists.allFileCount;
                    allFileSize = boardExists.allFileSize;
                    posts = filteredPosts;
                };
                boards := Trie.replace(
                    boards,
                    textKey(boardExists.abbreviation),
                    Text.equal,
                    ?newBoard,
                ).0;
            };
            case(null) {
            };
        };
    };

    public shared(msg) func deleteReply(boardAbbreviation : Text, threadId : Nat32, postId : Nat32) {

        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        let boardExists = Option.isSome(board);
        switch(board) {
            case(?boardExists) {
                var posts = boardExists.posts;
                let thread = Trie.find(posts, natKey(threadId), Nat32.equal);
                let threadExists = Option.isSome(thread);
                switch(thread) {
                    case(?threadExists) {
                        var replies  = threadExists.replies;
                            let reply = Trie.find(replies, natKey(postId), Nat32.equal);
                            let replyExists = Option.isSome(reply);
                            switch(reply) {
                                case(?replyExists) {
                                    var updatedThread = {
                                        id = threadExists.id;
                                        boardAbbreviation = threadExists.boardAbbreviation;
                                        ownerPrincipal = threadExists.ownerPrincipal;
                                        userName = threadExists.userName;
                                        posterGuid = threadExists.posterGuid;
                                        subject = threadExists.subject;
                                        body = threadExists.body;
                                        isStickied = threadExists.isStickied;
                                        isLocked = threadExists.isLocked;
                                        isOp = threadExists.isOp;
                                        userNameColor = threadExists.userNameColor;
                                        timeStamp = threadExists.timeStamp;
                                        latestActivityTimeStamp = threadExists.latestActivityTimeStamp;
                                        reportCount = threadExists.reportCount + 1: Nat32;
                                        replies = replies;
                                        replyCount = 0 : Nat32;
                                        fileCount = threadExists.fileCount: Nat32;
                                        filePath = threadExists.filePath;
                                        fileType = threadExists.fileType;
                                        fileExtension = threadExists.fileExtension;
                                        fileName = threadExists.fileName;
                                        fileSize = threadExists.fileSize;
                                    };
                                    posts := Trie.replace(
                                        posts,
                                        natKey(threadExists.id),
                                        Nat32.equal,
                                        ?updatedThread,
                                    ).0;
                                };
                                case(null) {
                                };
                            };
                    };
                    case(null) {
                    };
                };
            };
            case(null) {
            };
        };

    };


    public shared(msg) func deleteReplies(boardAbbreviation : Text,id : Nat32) {

        let board = Trie.find(boards, textKey(boardAbbreviation), Text.equal);
        let boardExists = Option.isSome(board);
        switch(board) {
            case(?boardExists) {
                var posts = boardExists.posts;
                let thread = Trie.find(posts, natKey(id), Nat32.equal);
                let threadExists = Option.isSome(thread);
                switch(thread) {
                    case(?threadExists) {
                        var updatedThread = {
                            id = threadExists.id;
                            boardAbbreviation = threadExists.boardAbbreviation;
                            ownerPrincipal = threadExists.ownerPrincipal;
                            userName = threadExists.userName;
                            posterGuid = threadExists.posterGuid;
                            subject = threadExists.subject;
                            body = threadExists.body;
                            isStickied = threadExists.isStickied;
                            isLocked = threadExists.isLocked;
                            isOp = threadExists.isOp;
                            userNameColor = threadExists.userNameColor;
                            timeStamp = threadExists.timeStamp;
                            latestActivityTimeStamp = threadExists.latestActivityTimeStamp;
                            reportCount = threadExists.reportCount + 1: Nat32;
                            replies = Trie.empty();
                            replyCount = 0 : Nat32;
                            fileCount = threadExists.fileCount: Nat32;
                            filePath = threadExists.filePath;
                            fileType = threadExists.fileType;
                            fileExtension = threadExists.fileExtension;
                            fileName = threadExists.fileName;
                            fileSize = threadExists.fileSize;
                        };
                        posts := Trie.replace(
                            posts,
                            natKey(threadExists.id),
                            Nat32.equal,
                            ?updatedThread,
                        ).0;

                        var newBoard = {
                            id = boardExists.id;
                            name = boardExists.name;
                            abbreviation = boardExists.abbreviation;
                            timeStamp = boardExists.timeStamp;
                            latestActivityTimeStamp = boardExists.latestActivityTimeStamp;
                            ownerPrincipal = boardExists.ownerPrincipal;
                            nextPost = boardExists.nextPost+1;
                            threadCount = Nat32.fromNat(Trie.size(posts)) : Nat32;
                            postCount = boardExists.postCount : Nat32;
                            isSfw = boardExists.isSfw;
                            showFlags = boardExists.showFlags;
                            textOnly = boardExists.textOnly;
                            forceAnonymity = boardExists.forceAnonymity;
                            isGated = boardExists.isGated;
                            gateType = boardExists.gateType;
                            gateToken = boardExists.gateToken;
                            gateTokenAmount = boardExists.gateTokenAmount;
                            isListed = boardExists.isListed;
                            isShownInHeader = boardExists.isShownInHeader;
                            isInDevelopment = boardExists.isInDevelopment;
                            allFileCount = boardExists.allFileCount;
                            allFileSize = boardExists.allFileSize;
                            posts = posts;
                        };
                        boards := Trie.replace(
                            boards,
                            textKey(boardExists.abbreviation),
                            Text.equal,
                            ?newBoard,
                        ).0;
                    };
                    case(null) {
                    };
                };
            };
            case(null) {
            };
        };
    };

    public shared(msg) func deleteAllThreads() {

        let boardArray = Iter.toArray(Trie.iter(boards));
        let boardIter = Trie.iter<Text, BoardType>(boards : Trie.Trie<Text, BoardType>);
        for (board in boardIter) {
            deleteThreads(board.0);
        }
    };

    public shared(msg) func deleteAllReplies() {

        let boardIter = Trie.iter<Text, BoardType>(boards : Trie.Trie<Text, BoardType>);
        for (board in boardIter) {
            let threadIter = Trie.iter<Nat32, PostType>(board.1.posts : Trie.Trie<Nat32, PostType>);
            for (thread in threadIter) {
                deleteReplies(board.0,thread.0);
            }
        }
    };

    // User

    public type UserId = Nat32;

    private stable var nextUser : UserId = 0;
    private stable var users : Trie.Trie<UserId, UserType> = Trie.empty();
    public query func readNextUser() : async UserId { return nextUser };
    public query func readUserCount() : async Nat { return Trie.size(users) };
   
    public shared( msg ) func createUser(principal:Principal,principalSource:Text, icpBalance:Float) : async ?UserType {
        var role = "user";
        if (Utils.isAdmin(principal)) { role := "admin" };
        if (Utils.isMod(principal)) { role := "mod" };
        let principalString = Principal.toText(principal);
        let result = await findUserByPrincipal(principalString:Text);
        let exists = Option.isSome(result);
        switch(result) {
            case(?exists) {
                var updatedUser = {
                    id = exists.id;
                    principal = exists.principal;
                    userName = exists.userName;
                    role = role;
                    registrationTimeStamp = exists.registrationTimeStamp;
                    principalSource = exists.principalSource;
                    icpBalance = icpBalance;
                    nftCollection = exists.nftCollection;
                };
                users := Trie.replace(
                    users,
                    natKey(exists.id),
                    Nat32.equal,
                    ?updatedUser,
                ).0;
                return ?updatedUser;
            };
            case(null) {
                let userId = nextUser;
                nextUser += 1;
                var newUser = {
                    id = userId;
                    principal = principalString;
                    userName = "anon"#Nat32.toText(userId);
                    role = role;
                    registrationTimeStamp = Time.now() : Int;
                    principalSource = principalSource;
                    icpBalance:Float = icpBalance;
                    nftCollection:[NftCollectionType] = [];
                };
                users := Trie.replace(
                    users,
                    natKey(userId),
                    Nat32.equal,
                    ?newUser,
                ).0;
                
                return ?newUser;
            };
        };
    };
    

    public query( msg ) func findUserByPrincipal(principal : Text) : async ?UserType {
        let userTrie = Trie.filter<UserId, UserType>(users, func (k, v) { v.principal == principal });
        let userArray =  Iter.toArray(Trie.iter(userTrie));
        
        if (userArray.size() == 0)
            return null
        else
            return ?userArray[0].1;
    };

    public query func listUsers() : async [(UserId, UserType)]   {
        return Iter.toArray(Trie.iter(users));
    };

    public shared(msg) func addUserNfts(userId: UserId, nftCollection : [NftCollectionType]) : async ?UserType {

        let result = Trie.find(users, natKey(userId), Nat32.equal);
        let exists = Option.isSome(result);
        switch(result) {
            case(?exists) {
                var updatedUser = {
                    id = exists.id;
                    principal = exists.principal;
                    userName = exists.userName;
                    role = exists.role;
                    registrationTimeStamp = exists.registrationTimeStamp;
                    principalSource = exists.principalSource;
                    icpBalance = exists.icpBalance;
                    nftCollection = nftCollection;
                };
                users := Trie.replace(
                    users,
                    natKey(userId),
                    Nat32.equal,
                    ?updatedUser,
                ).0;
                return ?updatedUser;
            };
        };
    };
 

    public shared(msg) func makeMod(userId : UserId, role : Text) : async ?UserType {
                
        let result = Trie.find(users, natKey(userId), Nat32.equal);
        let exists = Option.isSome(result);
        switch(result) {
            case(?exists) {
                var updatedUser = {
                    id = exists.id;
                    principal = exists.principal;
                    userName = exists.userName;
                    role = role;
                    registrationTimeStamp = exists.registrationTimeStamp;
                    principalSource = "Plug";
                    icpBalance = exists.icpBalance;
                    nftCollection = exists.nftCollection;
                };
                users := Trie.replace(
                    users,
                    natKey(userId),
                    Nat32.equal,
                    ?updatedUser,
                ).0;
                return ?updatedUser;
            };
        };
    };

    public shared(msg) func updateUserBalances(userId: Id, icpBalance: Float) : async ?UserType {
        let result = Trie.find(users, natKey(userId), Nat32.equal);
        let exists = Option.isSome(result);
        switch(result) {
            case(?exists) {
                var updatedUser = {
                    id = exists.id;
                    principal = exists.principal;
                    principalSource = exists.principalSource;
                    userName = exists.userName;
                    role = exists.role;
                    icpBalance = icpBalance;
                    registrationTimeStamp =  Time.now() : Int;
                    // principalTimestamp = exists.principalTimestamp;
                    nftCollection = exists.nftCollection;
                };
                users := Trie.replace(
                    users,
                    natKey(userId),
                    Nat32.equal,
                    ?updatedUser,
                ).0;
                return ?updatedUser;
            };
        };
    };

    public shared(msg) func deleteAllUsers () {
        if(Utils.isAdmin(msg.caller)) {
            users := Trie.empty();
            nextUser := 0;
        }
    };

    // Utils
    public func principalToSubAccount(id: Principal) : async [Nat8] {
        let p = Blob.toArray(Principal.toBlob(id));
        Array.tabulate(32, func(i : Nat) : Nat8 {
        if (i >= p.size() + 1) 0
        else if (i == 0) (Nat8.fromNat(p.size()))
        else (p[i - 1])
        })
    };

    // User Auth
    public shared (msg) func getCallerId() : async Principal {
        msg.caller
    };
};
