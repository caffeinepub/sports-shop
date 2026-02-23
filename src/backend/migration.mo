import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  // Old types
  type OldCustomSticker = {
    id : Nat;
    creator : Principal;
    image : Storage.ExternalBlob;
    price : Nat;
    name : Text;
    description : ?Text;
  };

  type OldActor = {
    customStickers : Map.Map<Nat, OldCustomSticker>;
  };

  // New actor type
  type NewCustomSticker = {
    id : Nat;
    creator : Principal;
    image : Storage.ExternalBlob;
    price : Nat;
    name : Text;
    category : {
      #sports;
      #animals;
      #food;
      #cartoon;
      #patterns;
    };
    description : ?Text;
  };

  type NewActor = {
    customStickers : Map.Map<Nat, NewCustomSticker>;
  };

  // Migration function called by the actor via the with clause
  public func run(old : OldActor) : NewActor {
    let newCustomStickers = old.customStickers.map<Nat, OldCustomSticker, NewCustomSticker>(
      func(_id, oldCustomSticker) {
        {
          oldCustomSticker with
          category = #sports;
        };
      }
    );
    { customStickers = newCustomStickers };
  };
};
