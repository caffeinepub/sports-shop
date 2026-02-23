import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
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

  public type UserProfile = {
    name : Text;
  };

  type OrderStatus = {
    #pending;
    #completed;
    #cancelled;
  };

  type Order = {
    user : Principal;
    items : Cart;
    total : Nat;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    deliveryAddress : Text;
    customerName : Text;
  };

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, Cart>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextProductId = 1;
  var nextOrderId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  system func preupgrade() {};
  system func postupgrade() {};

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func addProduct(name : Text, description : Text, category : ProductCategory, stock : Nat) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description;
      price = 20; // Set price to ₹20
      category;
      stock;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    ?product.id;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, name : Text, description : Text, category : ProductCategory, stock : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id = productId;
          name;
          description;
          price = 20; // Update price to ₹20
          category;
          stock;
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func removeProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(productId);
      };
    };
  };

  // Shopping Cart Logic

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    // Validate product exists and has sufficient stock
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (product.stock < quantity) {
      Runtime.trap("Insufficient stock available");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    // Check if product already exists in cart
    var productExists = false;
    let updatedCart = currentCart.map(
      func(item) {
        if (item.productId == productId) {
          productExists := true;
          let newQuantity = item.quantity + quantity;
          if (product.stock < newQuantity) {
            Runtime.trap("Insufficient stock available");
          };
          { productId; quantity = newQuantity };
        } else {
          item;
        };
      }
    );

    if (productExists) {
      carts.add(caller, updatedCart);
    } else {
      carts.add(caller, currentCart.concat([{ productId; quantity }]));
    };
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0. Use removeCartItem to remove items.");
    };

    // Validate product exists and has sufficient stock
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (product.stock < quantity) {
      Runtime.trap("Insufficient stock available");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Product not in cart") };
      case (?cart) { cart };
    };

    var itemFound = false;
    let updatedCart = currentCart.map(
      func(item) {
        if (item.productId == productId) {
          itemFound := true;
          { productId; quantity };
        } else {
          item;
        };
      }
    );

    if (not itemFound) {
      Runtime.trap("Product not in cart");
    };

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeCartItem(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let updatedCart = currentCart.filter(
      func(item) { item.productId != productId }
    );

    if (updatedCart.size() == currentCart.size()) {
      Runtime.trap("Product not in cart");
    };

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // Checkout Logic

  public shared ({ caller }) func checkout(paymentMethod : PaymentMethod, deliveryAddress : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart empty") };
      case (?cart) {
        if (cart.size() == 0) {
          Runtime.trap("Cart empty");
        };
        cart;
      };
    };

    // Validate stock availability for all items
    for (item in cart.vals()) {
      switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
        case (?product) {
          if (product.stock < item.quantity) {
            Runtime.trap("Insufficient stock for product: " # product.name);
          };
        };
      };
    };

    let total = cart.foldLeft(
      0,
      func(acc, item) {
        switch (products.get(item.productId)) {
          case (null) { acc };
          case (?product) { acc + (product.price * item.quantity) };
        };
      },
    );

    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let newOrder : Order = {
      user = caller;
      items = cart;
      total;
      paymentMethod;
      status = #pending;
      deliveryAddress;
      customerName = userProfile.name;
    };

    orders.add(nextOrderId, newOrder);

    // Reduce stock for all items in the order
    for (item in cart.vals()) {
      switch (products.get(item.productId)) {
        case (null) {};
        case (?product) {
          let updatedProduct : Product = {
            id = product.id;
            name = product.name;
            description = product.description;
            price = product.price;
            category = product.category;
            stock = product.stock - item.quantity;
          };
          products.add(item.productId, updatedProduct);
        };
      };
    };

    carts.remove(caller);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (caller != order.user and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    orders.values().filter(func(order) { order.user == caller }).toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          user = order.user;
          items = order.items;
          total = order.total;
          paymentMethod = order.paymentMethod;
          status;
          deliveryAddress = order.deliveryAddress;
          customerName = order.customerName;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };
};
