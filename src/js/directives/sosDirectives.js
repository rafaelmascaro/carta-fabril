angular.module('cartaFabril.home')

.directive('sosUnity', [function sosContactDirective() {
  return {
    resrict: 'E',
    templateUrl: 'templates/_sos_unity.html',
    link: function (scope) {
      var unity = scope.unity

      if (unity.cnpj) {
        scope.cnpj = '- ' + unity.cnpj
      }

      if (unity.address) {
        scope.addressLines = unity.address.split("\n")
      }
    }
  }
}])

.directive('sosContact', [function sosContactDirective() {
  return {
    resrict: 'E',
    templateUrl: 'templates/_sos_contact.html',
    link: function (scope) {
      var contact = scope.contact

      if (contact.role) {
        scope.role = '(' + contact.role + ')'
      }

      if (contact.responsibilities) {
        scope.responsibilities = contact.responsibilities.split("\n")
      }
    }
  }
}])

.directive('cfPhone', ['$compile', function cfPhoneDirective($compile) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      number: '='
    },
    link: function (scope, elem) {
      if (scope.number) {
        scope.tel = scope.number.replace(/\D/g, '')

        elem.html('{{::label}} <a href="tel:{{::tel}}">{{::number}}</a>')

        $compile(elem.contents())(scope)
      }
    }
  }
}])
