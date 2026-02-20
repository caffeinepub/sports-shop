import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type ProductCategory = {
    #tableTennisBalls;
    #badmintonShuttles;
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : ProductCategory;
    stock : Nat;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
  };

  type NewActor = OldActor;

  // Migration function to update Vixen T.T Ball price from ₹18 to ₹20
  public func run(old : OldActor) : NewActor {
    let updatedProducts = old.products.map<Nat, Product, Product>(
      func(_id, product) {
        if (product.name == "Vixen T.T Ball" and product.price == 18) {
          { product with price = 20 };
        } else {
          product;
        };
      }
    );
    { old with products = updatedProducts };
  };
};
