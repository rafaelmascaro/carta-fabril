'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('visitPlannings', {
      url: "/visit-Plannings",
      templateUrl: "templates/planning/visit_plannings.html",
      controller: "PlanningsController",
      resolve: {
        visitPlannings: ['$stateParams', '$ionicLoading', 'VisitPlanningService', function ($stateParams, $ionicLoading, VisitPlanningService) {
          $ionicLoading.show({
            template: "Carregando registro de planejamentos..."
          })
    
          return VisitPlanningService.loadPlanning().finally(function () {
            $ionicLoading.hide()
          })
        }]
      }
    })
    .state('visitPlannings.list', {
      url: "/visit-plannings-list",
      views:{
        "tab-list": {
          templateUrl: "templates/planning/visit_plannings_list.html",
          controller: "PlanningsController"
        }
      }
    })      
    .state('visitPlannings.justify', {
      url: "/visit-plannings-justify",
      views:{
        "tab-justify": {
          templateUrl: "templates/planning/visit_plannings_justify.html",
          controller: "PlanningsController"
        }
      }
    })         
}])

cartaFabrilHome.controller("PlanningsController", ['$scope', '$state', '$filter', '$stateParams', '$ionicLoading','$ionicPopup', '$ionicModal', 'UIService', 'visitPlannings', 'VisitPlanningService', 'AuthService', 
function PlanningsController($scope, $state, $filter, $stateParams, $ionicLoading, $ionicPopup, $ionicModal, UIService, visitPlannings, VisitPlanningService, AuthService) {
  $scope.visitPlannings = visitPlannings.List
  $scope.hasToJustify = visitPlannings.Justifications.length > 0 ? true : false
  $scope.justifications = visitPlannings.Justifications
  $scope.visitPlanningService = VisitPlanningService
  $scope.picklistJustify = visitPlannings.PicklistMotivosJust

  var tomorow = new Date();
  tomorow.setDate(tomorow.getDate());  

  $scope.planDatepicker = {
    options:  {
      formatYear: 'yyyy',
      language: 'pt-BR',
      minDate: tomorow,
      startingDay: 0,
      showWeeks: false
    },

    opened: false,

    toggleOpened: function () {
      this.opened = !this.opened
    }
  }  

  $scope.newPlanning = function (clientId) {

    if ($scope.hasToJustify){
      $ionicPopup.alert({
        title: 'Visita não justificada',
        template: 'Existe(m) visita(s) não realizada(s) sem justificativa.'
      })
      $state.go('visitPlannings.justify')
    }
    else{
      $scope.planDate = { date : VisitPlanningService.newPlanningData.planningDate }
      $scope.modal = $scope.showPlanDate
      $scope.modal.show()
    }
    
  }

  $scope.dateException = { Error : "" }

  $scope.checkException = function () {
    var pardt = $scope.planDate.date

    var date = [pardt.getFullYear(),
      ( (pardt.getMonth() + 1) >9 ? '' : '0') + (pardt.getMonth() + 1),
      (pardt.getDate() >9 ? '' : '0') + pardt.getDate()].join('-')

    var plan = _.find($scope.visitPlannings, { DataDaVisita: date, IdVendedor : AuthService.getUserData().user_id })      

    if (plan != null)
      $scope.dateException.Error = "Data já planejada!"
    else
      $scope.dateException.Error = ""

  }  

  $scope.confirmDate = function (form) {
    if (form.$invalid || $scope.dateException.Error != "" || $scope.planDate.date == null) { return }

    $scope.modal.hide()    

    var pardt = $scope.planDate.date

    var date = [pardt.getFullYear(),
      ( (pardt.getMonth() + 1) >9 ? '' : '0') + (pardt.getMonth() + 1),
      (pardt.getDate() >9 ? '' : '0') + pardt.getDate()].join('-')

    if ($scope.hasToJustify)
      $state.go('visitPlannings.justify')
    else
      $state.go('new_planning.planning_clients', { planDate: date}) 
  }

  $ionicModal.fromTemplateUrl('templates/planning/planning_date.html', {
    scope: $scope,
    animation: 'fade-in',
    hideDelay: true
  }).then(function (modal) {
    $scope.showPlanDate = modal
  })    

  $ionicModal.fromTemplateUrl('templates/planning/visit_plannings_justify_new.html', {
    scope: $scope,
    animation: 'fade-in',
    hideDelay: true
  }).then(function (modal) {
    $scope.showRegisterModal = modal
  })  

  $scope.openJustify = function (visitId) {
    $scope.visitRegistration = _.find($scope.justifications, { Id: visitId })
  
    $scope.modal = $scope.showRegisterModal
    $scope.modal.show()
  }  

  $scope.close = function () {
    $scope.modal.hide()
  }  


  $scope.save = function (form) {
    if (form.$invalid) { return }

    $ionicLoading.show({
      template: 'Salvando justificativa...'
    })

    VisitPlanningService.updateJustify($scope.visitRegistration).then(function (savedAttributes) {
      var visit = _.find($scope.justifications, { Id: $scope.visitRegistration.Id })

      if (visit) {
        _.pull($scope.justifications, visit)
      }

      $scope.hasToJustify = $scope.justifications.length > 0 ? true : false

      $scope.modal.hide()
      $ionicLoading.hide()

      var obj = function()
      {
        this.List = $scope.visitPlannings
        this.Justifications = $scope.justifications
      }

      if ($scope.hasToJustify)
        $state.go('visitPlannings.justify')
      else
        $state.go('visitPlannings.list', { visitPlannings: obj } )

    }).catch(function () {
      $scope.handleSavingError()
    })
  }
  
  $scope.open = function(planDate, idVendedor){
    $state.go('viewPlanning', {planningDate: planDate, IdVendedor: idVendedor}) 
  }

  $scope.handleSavingError = function () {
    $ionicLoading.show({
      template: 'Algum erro ocorreu, tente novamente.'
    })

    UIService.waitBefore(function () {
      $ionicLoading.hide()
    })
  }  
}])
