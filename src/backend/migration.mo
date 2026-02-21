import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

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

  type Cart = [CartItem];

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

  // Old Order Type
  type OldOrder = {
    user : Principal;
    items : Cart;
    total : Nat;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
  };

  // New Order Type with address
  type NewOrder = {
    user : Principal;
    items : Cart;
    total : Nat;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    deliveryAddress : Text;
    customerName : Text;
  };

  // Old actor type
  type OldActor = {
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Principal, Cart>;
    orders : Map.Map<Nat, OldOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
  };

  // New actor type
  type NewActor = {
    products : Map.Map<Nat, Product>;
    carts : Map.Map<Principal, Cart>;
    orders : Map.Map<Nat, NewOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    // Convert all old orders to new format with default delivery addresses and customer names
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          deliveryAddress = "not provided";
          customerName = "unknown";
        };
      }
    );

    { old with orders = newOrders };
  };
};
