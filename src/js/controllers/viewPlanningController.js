'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('viewPlanning', {
      url: "/view-planning/:planningDate/:IdVendedor",
      templateUrl: "templates/planning/planning_view.html",
      controller: "ViewPlanningController",
      resolve: {
        visitPlannings: ['$stateParams', '$ionicLoading', 'VisitPlanningService', function ($stateParams, $ionicLoading, VisitPlanningService) {
          $ionicLoading.show({
            template: "Carregando registro de planejamento..."
          })

          return VisitPlanningService.initializeDate($stateParams.planningDate, $stateParams.IdVendedor).finally(function () {
            $ionicLoading.hide()
          })
        }]
      }
    })        
}])

cartaFabrilHome.controller("ViewPlanningController", ['$scope', '$state', '$filter', '$stateParams', '$ionicLoading', '$ionicModal', 'UIService', 'VisitPlanningService', 
function ViewPlanningController($scope, $state, $filter, $stateParams, $ionicLoading, $ionicModal, UIService, VisitPlanningService) {

    $scope.visitPlanningService = VisitPlanningService
    $scope.planningDate = $stateParams.planningDate

    $scope.finish = function(){
        $ionicLoading.show({
          template: 'Finalizando registros...'
        })
        
        VisitPlanningService.finishPlanning($stateParams.planningDate).then(function (){
            return VisitPlanningService.initializeDate($stateParams.planningDate, $stateParams.IdVendedor)
        }).then(function(){
          $ionicLoading.hide()     
          $state.go('viewPlanning', {planningDate: $stateParams.planningDate, IdVendedor: $stateParams.IdVendedor}) 
        })        
    }

    $scope.edit = function(){
      $state.go('new_planning.planning_type', { planDate: $stateParams.planningDate }) 
    }

    $scope.newVisit = function(){
      $state.go('new_planning.planning_type', {inPlanning: false, planDate: $stateParams.planningDate}) 
    }

    $scope.openClient = function(id){
      $state.go('client.overview', { clientId: id })
    }

}])
