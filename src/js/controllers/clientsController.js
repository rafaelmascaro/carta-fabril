'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('clients', {
      url: '/clients',
      templateUrl: 'templates/clients.html',
      controller: 'ClientsController'
    })
  }
])

cartaFabrilHome.controller("ClientsController", ['$scope', '$state', '$filter', '$ionicLoading', '$ionicPopup', '$q', 'ClientsService', function($scope, $state, $filter, $ionicLoading, $ionicPopup, $q, ClientsService) {

  $scope.query = { term : '' }

  function normalize (str) {
    return $filter('removeDiacritics')(str)
      .replace(/[^A-z0-9\s\.\-\/]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  }

  $scope.search = function () {
    var term = normalize($scope.query.term)

    if (term.length < 4) {
      $ionicPopup.alert({
        title: 'Busca por <em>"' + $scope.query.term + '"</em>',
        template: 'Favor incluir no mínimo 4 caracteres para refinar sua consulta.'
      })
      return $q.reject()
    }

    $ionicLoading.show({
      template: 'Carregando resultados...'
    })

    return ClientsService.searchClients(term).then(function (res) {
      $scope.sortedClients = _.groupBy(res, function (client) {
        return client.nomeFantasia__c[0]
      })
    }, function(err) {
      if (err.message != 'CONNECTION_TIMEOUT' || err.message != 'CONNECTION_ERROR') {
        $ionicPopup.alert({
          title: 'Busca por <em>"' + $scope.query.term + '"</em>',
          template: err.message == 'NO_RESULTS' ?
            'Nenhum resultado encontrado' :
            'A busca excedeu o limite de 100 registros. Favor refinar sua consulta.'
        })
      }
    }).then(function () {
      $ionicLoading.hide()
    })
  }

  $scope.clearQuery = function () {
    $scope.query.term = '';
  }

  $scope.goToClient = function (clientId) {
    $ionicLoading.show({
      template: 'Carregando cliente...'
    })

    $state.go('client.overview', { clientId: clientId })
  }
}])
