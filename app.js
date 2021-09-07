var mongoose = require('mongoose');

const passport = require('passport');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const secretKey = 'your_jwt_secret';
const bcryptjs = require('bcryptjs');
const User = require('./model/user');
const jwt = require('jsonwebtoken'); 

var uri = 'mongodb://localhost/bookshop';
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('connecting', function () { console.log('Connecting to ', uri); });
db.on('connected', function () { console.log('Connected to ', uri); });
db.on('disconnecting', function () { console.log('Disconnecting from ', uri); });
db.on('disconnected', function () { console.log('Disconnected from ', uri); });
db.on('error', function (err) { console.error('Error ', err.message); });

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
  function (email, password, cb) {
    return User.findOne({ email }).select('email password name surname')
      .then(function (user) {
        if (!user) {
          return cb({ message: 'Email not found' }, false);
        }
        if (!bcryptjs.compareSync(password, user.password)) {
          return cb({ message: 'Incorrect password' }, false);
        }
        return cb(null, user);
      })
      .catch(function (err) { console.error('ERR STGY', err); cb(err) });
  }
));

passport.use(new JWTStrategy({ jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: secretKey },
  function (jwtPayload, cb) {
    return cb(null, { _id: jwtPayload.id });
  }
));

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })


var model = require('./model/model');


// Import express module
var express = require('express');
// Import path module
var path = require('path');
// Import logger module
var logger = require('morgan');
// Import cookie-parser module
var cookieParser = require('cookie-parser');

// Instantiate the express middleware
var app = express();

// Support JSON object parsing
app.use(express.json());
// Allow more than 2 levels of nesting in JSON parsing
app.use(express.urlencoded({ extended: true }));

// Support cookie parsing
app.use(cookieParser());

// Load logger module
app.use(logger('dev'));

//Set public folder to publish static content
app.use(express.static(path.join(__dirname ,'public')));


// ReST API (before the method that returns index.html because it could ne used for any request)
// HTTP GET every product that can be purchased
app.get('/api/products', function (req, res, next) {
  return model.getProducts()
    .then(function (products) {
      return res.json(products);
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).send({ message: 'Cannot get products' })
    });
});

// HTTP POST sign in
app.post('/api/users/signin', function (req, res, next) {
  return passport.authenticate('local', { session: false },
    function (err, user, info) {
      if (err || !user) { console.error(err, user); return res.status(401).json(err); }
      return req.logIn(user, { session: false }, function (err) {
        if (err) { res.status(401).send(err); }
        useridFromToken(req, res);
        return res.json(user);
      });
    })(req, res);
});


// Store user information (_id) into the cookie (encrypted)
function useridFromToken(req, res) {
  if (req.user) {
    res.cookie('token', jwt.sign({ id: req.user._id }, secretKey, { expiresIn: 60 }));
    return req.user._id;
  } else {
    //res.cookie.removeOne('token');
    res.clearCookie('token');
    return null;
  }
}


// HTTP GET shopping cart quantity (number of items)
app.get('/api/cart/qty', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var userid = useridFromToken(req, res); // We use this instead of req.user._id in order to renew the token (res.cookie...)
    if (!userid) return res.status(401).send({ message: 'User has not signed in' });
    return model.getUserCartQty(userid)
      .then(function (userCartQty) {
        if (userCartQty) return res.json(userCartQty);
        else return res.status(500).send({ message: 'Cannot retrieve user cart quantity' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot retrieve user cart quantity' })
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP POST create new user
app.post('/api/users/signup', function (req, res, next) {
  return model.signup(req.body.name, req.body.surname, req.body.address, req.body.birth, req.body.email, bcryptjs.hashSync(req.body.password, bcryptjs.genSaltSync(10)))
    .then(function (user) {
      if (user) return res.status(201).send({message: 'User has been successfully registered!'});
      else return res.status(409).send({message: 'Email already registered'});
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).send({ message: 'Cannot register user' })
    });
  });


// HTTP POST add item to shopping cart
app.post('/api/cart/items/product/:id', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var pid = req.params.id;
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return Model.buy(uid, pid)
      .then(function (cart) {
        if (cart) return res.json(cart);
        else return res.status(401).send({ message: 'User or Product not found' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot add product to cart' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP GET shopping cart
app.get('/api/cart', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return Model.getCartByUserId(uid)
      .then(function (cart) {
        if (cart) { return res.json(cart); }
        else return res.status(401).send({ message: 'User shopping cart not found' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot get cart' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP DELETE one cart item
app.delete('/api/cart/items/product/:id/one', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var pid = req.params.id;
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return Model.deleteOne(uid, pid)
      .then(function (cart) {
        if (cart) { return res.json(cart); }
        else return res.status(401).send({ message: 'User or Product not found' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot delete that product' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP DELETE every unit of a cart item
app.delete('/api/cart/items/product/:id/all', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var pid = req.params.id;
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return Model.deleteAll(uid, pid)
      .then(function (cart) {
        if (cart) { return res.json(cart); }
        else return res.status(401).send({ message: 'User or Product not found' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot delete those products' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP POST create new order (purchase)
app.post('/api/orders', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return model.purchase(uid, req.body.date, req.body.address, req.body.cardNumber, req.body.cardHolder)
      .then(function(order) {
        if (order) return res.json(order);
        else return res.status(401).send({ message: 'User not found or empty cart' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot purchase' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP GET one order
app.get('/api/orders/id/:oid', passport.authenticate('jwt', { session: false, failWithError: true}),
  function (req, res, next) {
    var oid = req.params.oid;
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return Model.getOrder(uid, oid)
      .then(function(order) {
        if (order) { return res.json(order); }
        else return res.status(401).send({ message: 'User or order not found' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot get order' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP GET user profile
app.get('/api/users/profile', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return Model.getProfile(uid)
      .then(function(user) {
        if (user) { return res.json(user); }
        else return res.status(401).send({ message: 'User profile not found' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot get the user profile' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });


// HTTP GET all orders
app.get('/api/orders', passport.authenticate('jwt', { session: false, failWithError: true }),
  function (req, res, next) {
    var uid = useridFromToken(req, res);
    if (!uid) return res.status(401).send({ message: 'User has not signed in' });
    return Model.getOrders(uid)
      .then(function(orders) {
        if (orders) { return res.json(orders); }
        else return res.status(401).send({ message: 'User profile or orders not found' });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).send({ message: 'Cannot get the orders' });
      });
  },
  function(err, req, res, next) {
    // Handle error
    return res.status(401).send({ message: 'User has not signed in' })
  });



// Redirect request to index.html file
app.get(/\/.*/, function (req, res) {
    res.sendFile(path.join(__dirname ,'public/index.html'));
});

// Listen to port 3000
app.listen(3000, function () {
    console.log('BookShop WebApp listening on port 3000!');
});