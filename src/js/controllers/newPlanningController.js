'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('new_planning', {
      abstract:true,
      cache: false,      
      url: "/new_planning/:inPlanning/:planDate",
      templateUrl: "templates/planning/new_planning.html",
      controller: "NewPlanningController",
      resolve: {
        loaded: ['$stateParams', 'VisitPlanningService', function ($stateParams, VisitPlanningService) {
          return VisitPlanningService.initialize($stateParams.inPlanning == ""? true : false, $stateParams.planDate)
        }]
      }      
    })

    .state('new_planning.planning_clients', {
      url: "/planning_clients",
      views: {
        "tab-planning-clients": {
          templateUrl: "templates/planning/planning_clients.html",
          controller: "NewPlanningController"        
        }
      }
    })

    .state('new_planning.planning_type',{
      url: "/planning_type",
      views:{
        "tab-visit-type":{
          templateUrl: "templates/planning/planning_type.html",
          controller:"NewPlanningController"
        }
      }
    })    
   
}])

cartaFabrilHome.controller("NewPlanningController", ['$scope', '$state', '$filter', '$stateParams', '$ionicLoading', '$ionicPopup', 'AuthService', 'VisitPlanningService', 
function NewPlanningController($scope, $state, $filter, $stateParams, $ionicLoading, $ionicPopup, AuthService, VisitPlanningService) {
  $scope.query = { term : '' }

  function normalize (str) {
    return $filter('removeDiacritics')(str)
      .replace(/[^A-z0-9\s\.\-\/]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  }

  $scope.visitPlanningService = VisitPlanningService;

  $scope.search = function () {
    var term = normalize($scope.query.term)

    if (term.length < 4 && term.length != 0) {
      $ionicPopup.alert({
        title: 'Busca por <em>"' + $scope.query.term + '"</em>',
        template: 'Favor incluir no mínimo 4 caracteres para refinar sua consulta.'
      })
      return $q.reject()
    }

    $ionicLoading.show({
      template: 'Carregando resultados...'
    })

    return VisitPlanningService.searchClients(term).then(function (res) {
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
    $scope.search()
  }  

  $scope.toggleSelect = function (key, id) {
    VisitPlanningService.invertSelect(key, id)
  }

  $scope.toggleSelectOnOrder = function (id) {
    VisitPlanningService.invertSelectOnType(id)
  }
  
  $scope.moveUpAccount = function (id) {
    VisitPlanningService.moveUpSelect(id)
  }

  $scope.moveDownAccount = function (id) {
    VisitPlanningService.moveDownSelect(id)
  }    

  $scope.placeDraftPlanning = function() {
    $scope.sending = true;

    $ionicLoading.show({
      template: 'Salvando registros...'
    })

    VisitPlanningService.createOrUpdatePlanningSelected().then(function(){
      $scope.sending = false;
      $ionicLoading.hide()

      if (VisitPlanningService.selectedAccounts.length > 0)
        $state.go('viewPlanning', {planningDate: VisitPlanningService.planDate, 
          IdVendedor: AuthService.getUserData().user_id}) 
      else
        $state.go('visitPlannings.list') 
  })
  }

}])
