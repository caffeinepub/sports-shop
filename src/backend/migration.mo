import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : ProductCategory;
    stock : Nat;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Order = {
    user : Principal;
    items : [CartItem];
    total : Nat;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    deliveryAddress : Text;
    customerName : Text;
  };

  type ProductCategory = {
    #tableTennisBalls;
    #badmintonShuttles;
  };

  type PaymentMethod = {
    #googlePay;
    #cash;
  };

  type UserProfile = {
    name : Text;
  };

  type OrderStatus = {
    #pending;
    #completed;
    #cancelled;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<Nat, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Principal, [CartItem]>;
    orders : Map.Map<Nat, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let updatedProducts = old.products.map<Nat, Product, Product>(
      func(_id, product) {
        { product with price = 20 };
      }
    );
    {
      old with
      products = updatedProducts;
    };
  };
};
