angular.module('cartaFabril')

.factory('ProxyDecorator', function () {
  function getter (target, name) {

    var val = target[name]

    return val == null || val === '' ?
      ' ' :
      val
    ;

  }

  return function ProxyDecorator (C) {
    return function (attributes) {
      return new Proxy(new C(attributes), {
        get : getter
      });
    };
  };
})
