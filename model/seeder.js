var mongoose = require('mongoose');
var bcryptjs = require('bcryptjs');

var User = require('./user');
var Cart = require('./shopping-cart');
var Product = require('./product');
var Order = require('./order');

var uri = 'mongodb://localhost/bookshop';
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('connecting', function () { console.log('Connecting to ', uri); });
db.on('connected', function () { console.log('Connected to ', uri); });
db.on('disconnecting', function () { console.log('Disconnecting from ', uri); });
db.on('disconnected', function () { console.log('Disconnected from ', uri); });
db.on('error', function (err) { console.error('Error ', err.message); });

var cart = new Cart({ items: [], qty: 0, total: 0, subtotal: 0, tax: 0 });
var user = new User({ email: 'tesorieror@gmail.com', password: 'admin', name: 'Ricardo', surname: 'Tesoriero', birth: '1977-07-01', address: 'ESII, UCLM', shoppingCart: cart, orders: []});
user.password = bcryptjs.hashSync('admin', bcryptjs.genSaltSync(10));

var products = [
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    url: '/images/book1.jpg',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla tincidunt lobortis laoreet. Sed pulvinar
      sollicitudin neque, ac volutpat leo rhoncus eu. Proin non velit in nisi rutrum euismod. Aliquam mattis
      nibh ac eros tincidunt fringilla. Aliquam erat volutpat. Mauris vitae iaculis leo. Ut a justo justo.
      Aenean scelerisque efficitur ante vehicula ullamcorper.`,
    price: 10
  },
  {
    title: 'Ready Player One',
    author: 'Ernest Cline',
    url: '/images/book2.jpg',
    description: `Nulla molestie vel urna ut lacinia. Proin fermentum molestie vestibulum. Aenean non mattis mi, eu
      feugiat nulla. Morbi sit amet cursus ante. In nec nisl turpis. Pellentesque dictum lectus at justo
      commodo, eu pulvinar sem placerat. Vivamus eu consectetur augue. In id nisi finibus, dictum sapien non,
      tempus odio. Cras eu nunc nec lorem sollicitudin pharetra. Quisque ornare felis bibendum viverra
      accumsan. Mauris ligula orci, feugiat sit amet ornare sed, sagittis vitae justo. Sed a odio id lorem
      pretium consectetur.`,
    price: 12
  },
  {
    title: 'The Final Empire (Mistborn Saga)',
    author: 'Brandon Sanderson',
    url: '/images/book3.jpg',
    description: `Quisque vehicula, sem sit amet semper ullamcorper, velit odio ullamcorper risus, eu scelerisque risus
      nisi a arcu. Nullam accumsan ullamcorper massa, sed laoreet magna condimentum non. Fusce viverra diam ut
      eros euismod tincidunt. Donec convallis diam at libero ultrices, id interdum lectus viverra. Sed mollis
      arcu nec quam bibendum dictum. Ut vel nulla mattis, venenatis arcu a, blandit purus. Nulla id blandit
      turpis. In sollicitudin quis risus sit amet vehicula.`,
    price: 20
  },
  {
    title: 'The Fellowship of the Ring (The Lord of the Rings)',
    author: 'J.R.R. Tolkien',
    url: '/images/book4.jpg',
    description: `Quisque vehicula, sem sit amet semper ullamcorper, velit odio ullamcorper risus, eu scelerisque risus
      nisi a arcu. Nullam accumsan ullamcorper massa, sed laoreet magna condimentum non. Fusce viverra diam ut
      eros euismod tincidunt. Donec convallis diam at libero ultrices, id interdum lectus viverra. Sed mollis
      arcu nec quam bibendum dictum. Ut vel nulla mattis, venenatis arcu a, blandit purus. Nulla id blandit
      turpis. In sollicitudin quis risus sit amet vehicula.`,
    price: 15
  },
  {
    title: 'The Age of Revolution: 1789-1848',
    author: 'Eric Hobsbawm',
    url: '/images/book5.jpg',
    description: `Etiam vitae ipsum vel purus faucibus luctus. Vivamus sem neque, suscipit at aliquam in, iaculis sed
      elit. Donec velit libero, ultrices laoreet posuere et, pellentesque vel nibh. Integer iaculis, arcu
      euismod faucibus mollis, lorem mauris molestie orci, vel mollis velit est sed sem. Fusce elementum nulla
      tellus, in accumsan leo venenatis sit amet. Cras hendrerit lacus nec facilisis bibendum. Maecenas
      convallis nunc nec dui luctus, quis semper velit faucibus. Sed sit amet tristique mauris, eu gravida
      felis. Aenean rutrum et erat quis luctus. Donec varius cursus auctor.`,
    price: 30
  },
  {
    title: '1914-1918: The History of the First World War',
    author: 'David Stevenson',
    url: '/images/book6.jpg',
    description: `Suspendisse sed congue ipsum. Nullam fermentum lectus nulla, euismod posuere nisl egestas vel. Aenean
      pellentesque blandit cursus. Fusce eget erat sed lectus mattis mattis. Vestibulum auctor, nisi quis
      rutrum luctus, nunc nibh vehicula sem, vel vehicula nunc orci non neque. Praesent vitae tempor velit. In
      ex quam, cursus nec felis nec, suscipit bibendum nisl. Vestibulum pellentesque facilisis magna, ac
      tincidunt dolor pellentesque eu. Maecenas sit amet consequat sem, et ultricies sem. Donec pellentesque,
      mi sed faucibus vulputate, tortor lacus bibendum dui, sit amet pretium ex orci id dui. Vestibulum a odio
      vel leo dapibus fringilla. Proin non lectus urna.`,
    price: 15
  }
];


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(function () { return Product.deleteMany() })
  .then(function () { return Cart.deleteMany() })
  .then(function () { return Order.deleteMany() })
  .then(function () { return User.deleteMany() })
  .then(function () { return Product.insertMany(products)})
  .then(function () { return cart.save() })
  .then(function () { return user.save() })
  .then(function (result) { console.log(result); return result})
  .then(function (result) { console.log(bcryptjs.compareSync('admin',result.password));})
  .then(function () { return mongoose.disconnect(); })
  .catch(function (err) { console.error('Error ', err.message); })
