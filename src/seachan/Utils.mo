import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Array "mo:base/Array";

import Types "./Types";

module {

    // Authorization

    let adminIds: [Text] = ["5ot4w-txwos-csbt5-67fr4-lhweq-olgim-5nmrj-kgaak-6xuls-izgst-nae",
    "kz2zs-eai5n-gijkw-t45g7-pmczv-2vs5d-gdo5c-lwfov-nzp4y-256f5-yae",
    "6lnyf-el23k-uvfsz-3bvct-4vxql-yvjn2-jmpfe-rzvpw-jy5bv-qpm2z-mae",
    "ygiyq-kyegj-i3jm3-jch4w-dcoma-pmuzz-zu32l-2m7fr-2k4cp-zqykg-rqe"];

    let modIds: [Text] = ["63zva-sr2n3-wwqle-ek3ti-7khzg-corss-mysts-b7k3l-4yazq-bq364-iae"];

    public func isAdmin(userPrincipal: Principal): Bool {
        func identity(x: Text): Bool { x == Principal.toText(userPrincipal)};
        Option.isSome(Array.find<Text>(adminIds,identity))
    };

    public func isMod(userPrincipal: Principal): Bool {
        func identity(x: Text): Bool { x == Principal.toText(userPrincipal)};
        Option.isSome(Array.find<Text>(modIds,identity))
    };

    public func isOwner(caller: Principal, ownerPrincipal: Principal): Bool {
        Principal.equal(caller,ownerPrincipal);
    };

    public func isBackend(caller: Principal): Bool {
        Text.equal(Principal.toText(caller),"b3b2k-kiaaa-aaaak-qanma-cai");
    };

    public func isAnonymous(caller: Principal): Bool {
        Text.equal(Principal.toText(caller),"b3b2k-kiaaa-aaaak-qanma-cai");
    };

};