import Buffer "mo:base/Buffer";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
// import BigInt "mo:base/BigInt";

module Types {

  public type UserId = Principal;
  public type Id = Nat32;

  public type BoardDescType = {
    id:Nat32;
    abbreviation:Text;
    name:Text;
    timeStamp:Int;
    latestActivityTimeStamp:Int;
    threadCount:Nat32;
    isSfw:Bool;
    showFlags:Bool;
    textOnly:Bool;
    isGated:Bool;
    gateType:Text;
    gateToken:Text;
    gateTokenAmount:Nat32;
    isListed:Bool;
    isShownInHeader:Bool;
    forceAnonymity:Bool;
    isInDevelopment:Bool;
  };

  public type BoardType = {
    id:Nat32;
    abbreviation:Text;
    name:Text;
    timeStamp:Int;
    latestActivityTimeStamp:Int;
    ownerPrincipal:Principal;
    nextPost:Nat32;
    threadCount:Nat32;
    postCount:Nat32;
    isSfw:Bool;
    showFlags:Bool;
    textOnly:Bool;
    isGated:Bool;
    gateType:Text;
    gateToken:Text;
    gateTokenAmount:Nat32;
    isListed:Bool;
    isShownInHeader:Bool;
    forceAnonymity:Bool;
    isInDevelopment:Bool;
    allFileCount:Nat32;
    allFileSize:Nat32;
    posts:Trie.Trie<Nat32, PostType>;
  };

  public type PostType = {
    id:Nat32;
    // threadId:Nat32;
    boardAbbreviation:Text;
    ownerPrincipal:Principal;
    userName:Text;
    posterGuid:Text;
    subject:Text;
    body:Text;
    isOp:Bool;
    isStickied:Bool;
    isLocked:Bool;
    userNameColor:Text;
    timeStamp:Int;
    latestActivityTimeStamp:Int;
    reportCount:Nat32;
    replies:Trie.Trie<Nat32, PostType>;
    replyCount:Nat32;
    fileCount:Nat32;
    filePath:Text;
    fileType:Text;
    fileExtension:Text;
    fileName:Text;
    fileSize:Nat32;
  };

  public type UserType = {
    id: Nat32;
    principal:Text;
    userName: Text;
    role: Text;
    registrationTimeStamp: Int;
    principalSource: Text;
    icpBalance:Float;
    nftCollection:[NftCollectionType];
  };

  
  // TODO
  public type NftCollectionType = {
    name: Text;
    canisterId: Text;
    standard: Text;
    tokens: [NFTDetails];
    icon: Text;
    description: Text;
  };

  public type NFTDetails = {
    index: Nat32;
    url: Text;
  };

  // public type NFTDetails = {
  //   index: Nat32;
  //   canister: Text;
  //   id: ?Text;
  //   name: ?Text;
  //   url: Text;
  //   metadata: Any;
  //   standard: Text;
  //   collection: ?Text;
  // };

  // TODO
  public type Role = {
    #owner;
    #admin;
    #mod;
    #user;
  };
};