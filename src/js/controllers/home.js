'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      cache : false
    })
  }
])

cartaFabrilHome.controller("HomeController", ["$scope", "$state", "AuthService", function ($scope, $state, AuthService) {
  $scope.auth = JSON.stringify(AuthService.getAuthData())
  $scope.user = AuthService.getUserData()

  $scope.goToClients = function () {
    $state.go('clients')
  }

  $scope.goToOrders = function () {
    $state.go('orders')
  }

  $scope.goToInfo = function () {
    $state.go('informations')
  }
}])
