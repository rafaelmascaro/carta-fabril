'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('version_alert', {
      url: '/',
      templateUrl: 'templates/version_alert.html',
      controller: 'VersionAlertController',
      cache : false
    })
  }
])

cartaFabrilHome.controller("VersionAlertController", ["$scope", "$state", function ($scope, $state) {
    $scope.$on("$ionicView.beforeEnter", function() {

        setTimeout(function() {
            document.getElementsByClassName('has-header')[0].style.top = 0;
            document.getElementsByClassName('nav-bar-container')[0].parentNode.removeChild(document.getElementsByClassName('nav-bar-container')[0]);
            document.getElementsByClassName('menu-left')[0].parentNode.removeChild(document.getElementsByClassName('menu-left')[0]);
        }, 500);
    });
}])