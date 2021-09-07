var User = require('./user');
var Cart = require('./shopping-cart');
var Product = require('./product');
var Order = require('./order');

Model = {}

Model.signin = function (email, password) {
  return User.findOne({ email, password });
}

Model.signup = function (name, surname, address, birth, email, password) {
  return User.findOne({ email }).then(function (user) {
    if (!user) {
      var cart = new Cart({ items: [], qty: 0, total: 0, subtotal: 0, tax: 0 });
      var user = new User({ email, password, name, surname, birth, address, shoppingCart: cart, orders: [] });
      return cart.save().then(function () { return user.save(); })
    } else return null;
  })
}

Model.updateShoppingCart = function(user, qty, price) {
  user.shoppingCart.qty += qty;
  user.shoppingCart.subtotal += price;
  user.shoppingCart.tax = user.shoppingCart.subtotal*0.21;  //for the books is 0.04, actually
  user.shoppingCart.total = user.shoppingCart.subtotal + user.shoppingCart.tax;
}


Model.buy = function (uid, pid) {
  return Promise.all([Model.getProductById(pid), Model.getUserByIdWithCart(uid)])
    .then(function (results) {
      var product = results[0];
      var user = results[1];
      if (user && product) {
        var item = null;
        for (var i = 0; i < user.shoppingCart.items.length; i++) {
          if (user.shoppingCart.items[i].product == pid) {
            item = user.shoppingCart.items[i];
            user.shoppingCart.items.remove(item);
          }
        }
        if (!item) { item = { qty: 0 }; }
        item.qty++;
        item.product = product._id;
        item.title = product.title;        
        item.price = product.price;
        item.total = item.qty * item.price;
        user.shoppingCart.items.push(item);
        Model.updateShoppingCart(user, 1, product.price);
        return user.shoppingCart.save()
          .then(function (result) { return result });
      } else return null;
    }).catch(function (errors) { console.error(errors); return null; })
}


Model.deleteOne = function (uid, pid) {
  return Promise.all([Model.getProductById(pid), Model.getUserByIdWithCart(uid)])
    .then(function (results) {
      var product = results[0];
      var user = results[1];
      if (user && product) {
        var item = null;
        for (let i = 0; i < user.shoppingCart.items.length; i++) {
          item = user.shoppingCart.items[i];
          if (item.product == pid) {
            if (item.qty > 1) {
              item.qty--;
              item.total -= item.price;
            }
            else {
              user.shoppingCart.items.splice(i, 1);
            }
            Model.updateShoppingCart(user, -1, -item.price);
            break;
          }
        }
        return user.shoppingCart.save();
      } else return null;
    }).catch(function (errors) { console.error(errors); return null; })
}


Model.deleteAll = function(uid, pid) {
  return Promise.all([Model.getProductById(pid), Model.getUserByIdWithCart(uid)])
    .then(function (results) {
      var product = results[0];
      var user = results[1];
      if (user && product) {
        var item = null;
        for (let i = 0; i < user.shoppingCart.items.length; i++) {
          item = user.shoppingCart.items[i];
          if (item.product == pid) {
            user.shoppingCart.items.splice(i, 1);
            Model.updateShoppingCart(user, -item.qty, -item.qty*item.price);
            break;
          }
        }
        return user.shoppingCart.save();
      } else return null;
    }).catch(function (errors) { console.error(errors); return null; })
}


Model.purchase = function(uid, date, address, cardNumber, cardHolder) {
  return Model.getProfile(uid)
    .then(function (user) {
      if (user && user.shoppingCart.items.length > 0) {
        var orderNumber = new Date().getTime();
        var order = new Order({
          number: orderNumber,
          date: date,
          address: address,
          cardNumber: cardNumber,
          cardHolder: cardHolder,
          subtotal: user.shoppingCart.subtotal,
          tax: user.shoppingCart.tax,
          total: user.shoppingCart.total,
          items: user.shoppingCart.items
        });

        user.shoppingCart.items = [];
        user.shoppingCart.qty = 0;
        user.shoppingCart.subtotal = 0;
        user.shoppingCart.tax = 0;
        user.shoppingCart.total = 0;
        user.orders.push(order);

        return order.save()
          .then(function() {
            return user.shoppingCart.save();
          })
          .then(function() {
            return user.save();
          })
          .then(function() {
            return Model.getOrder(uid, orderNumber);
          });
      } else return null;
    }).catch(function (errors) { console.error(errors); return null; })
}

Model.getOrders = function(uid) {
  return User.findById(uid).populate('orders')
    .then(function(user) {
      if (user) return user.orders;
      else return null;
    });
}

Model.getOrder = function(uid, oid) {
  return Model.getOrders(uid)
    .then(function (orders) {
      if (orders) {
        for (let order of orders) {
          if (order.number == oid) {
            return order;
          }
        }
      }
      return null;
    });
}


Model.getUserByIdWithCart = function (userid) {
  return User.findById(userid).populate('shoppingCart');
}


Model.getUserCartQty = function (userid) {
  return User.findById(userid).populate({ path: 'shoppingCart', select: 'qty' })
}


Model.getProductById = function (pid) {
  return Product.findById(pid);
}


Model.getCartByUserId = function(uid) {
  return Model.getUserByIdWithCart(uid)
    .then(function (user) {
      if (user) return user.shoppingCart;
      else return null;
    });
}

Model.getProducts = function() {
  return Product.find();
}

Model.getProfile = function(uid) {
  return User.findById(uid).populate(['shoppingCart', 'orders']);
}

module.exports = Model;