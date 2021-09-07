Model = {}

Model.getProducts = function () {
  return $.ajax({ url: '/api/products', method: 'GET' });
}

Model.signin = function(email, password) {
  return $.ajax({
    url: '/api/users/signin',
    method: 'POST',
    data: { email, password }
  });
}

Model.getToken = function () {
  var decoded = decodeURIComponent(document.cookie);
  return decoded.substring(6, decoded.length);
}

Model.signout = function () {
  document.cookie = 'token=;expires=0;path=/;'
}

Model.getUserCartQty = function () {
  return $.ajax({
    url: '/api/cart/qty',
    method: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.signup = function(name, surname, address, birth, email, password) {
  return $.ajax({
    url: '/api/users/signup',
    method: 'POST',
    data: { name, surname, address, birth, email, password }
  });
}

Model.buy = function (pid) {
  return $.ajax({
    url: '/api/cart/items/product/'+pid,
    method: 'POST',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.getCart = function () {
  return $.ajax({
    url: '/api/cart',
    method: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.deleteOne = function (pid) {
  return $.ajax({
    url: '/api/cart/items/product/' + pid+'/one',
    method: 'DELETE',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.deleteAll = function (pid) {
  return $.ajax({
    url: '/api/cart/items/product/' + pid+'/all',
    method: 'DELETE',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.purchase = function(date, address, cardNumber, cardHolder) {
  return $.ajax({
    url: '/api/orders',
    method: 'POST',
    data: { date, address, cardNumber, cardHolder },
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.getOrder = function(oid) {
  return $.ajax({
    url: '/api/orders/id/' + oid,
    method: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.getOrders = function() {
  return $.ajax({
    url: '/api/orders',
    method: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}

Model.getProfile = function() {
  return $.ajax({
    url: '/api/users/profile',
    method: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + Model.getToken());
    }
  });
}
