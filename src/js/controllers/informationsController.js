'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('informations', {
      url: '/informations',
      templateUrl: 'templates/informations.html',
      controller: 'InformationsController',
      resolve: {
        infos: ['$ionicLoading', '$q', 'SosSectorsService', 'SosUnitiesService', 'SosProceduresService', function ($ionicLoading, $q, SosSectorsService, SosUnitiesService, SosProceduresService) {
          $ionicLoading.show({
            template: "Carregando Informações gerais..."
          })

          return $q.all([
            SosSectorsService.loadList(),
            SosUnitiesService.loadList(),
            SosProceduresService.loadList()
          ]).finally(function () {
            $ionicLoading.hide()
          })
        }]
      }
    })
  }
])

cartaFabrilHome.controller("InformationsController", ["$scope", 'infos', '$state', '$injector','SosSectorsService', 'SosUnitiesService', 'SosProceduresService', function ($scope, infos, $state, $injector,SosSectorsService, SosUnitiesService, SosProceduresService) {
  var openedCategories = {},
      sectorsContacts = _.groupBy(infos[0].results, 'sector')

  _.each(sectorsContacts.null, function (sector) {
    sector.contacts = _.sortBy(sectorsContacts[sector.name], 'order')
  })

  $scope.sectors = _.sortBy(sectorsContacts.null, 'order')
  $scope.unities = infos[1].results
  $scope.procedures = infos[2].results

  $scope.isOpened = function (sector) {
    return openedCategories[sector]
  }

  $scope.toggleCategory = function (category) {
    openedCategories[category]  = !openedCategories[category]
  }

  $scope.toggleSector = function (sector) {
    sector.isOpened  = !sector.isOpened
  }

  $scope.doRefresh = function() { 
	
    openedCategories = {};
    sectorsContacts = {};
    
    SosSectorsService.loadList().then(function(res){
      
      sectorsContacts = _.groupBy(res.results, 'sector');

      console.log(sectorsContacts);

      _.each(sectorsContacts.null, function (sector) {
        sector.contacts = _.sortBy(sectorsContacts[sector.name], 'order');
      });
      
      $scope.sectors = _.sortBy(sectorsContacts.null, 'order');

    });
    
    SosUnitiesService.loadList().then(function(res){
      $scope.unities = res.results;
    });

    SosProceduresService.loadList().then(function(res){3
      $scope.procedures = res.results;
    });
    
    $scope.$broadcast('scroll.refreshComplete');
  }

}])
