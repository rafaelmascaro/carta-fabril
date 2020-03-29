'use strict';

angular.module('cartaFabril.login', [])
  .config([
    '$stateProvider',

    function ($stateProvider) {
      $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginController'
      });
    }
  ])

  .controller("LoginController", ['$scope', '$state', 'SalesforceService', function($scope, $state, SalesforceService) {
    $scope.version = '@@version'
    $scope.env = '@@env' !== 'production' ? '@@env ' : ''

    $scope.login = function (internal) {

      SalesforceService.login(internal).then(function() {
        SalesforceService.versionIsValid($scope.version).then((result) => { 
          if(result.sucesso)
            $state.go('home')
          else
            $state.go('version_alert')
        })
      }, function(msg) {
        console.error(msg)
      })

    }
  }]);
