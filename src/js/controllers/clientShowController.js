'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('client', {
      abstract: true,
      url: "/client/:clientId",
      templateUrl: 'templates/client.html',
      controller: 'ClientShowController',
      resolve: {
        devolutions: ['$stateParams', 'DevolutionService', function($stateParams, DevolutionService) {
          return DevolutionService.loadList($stateParams)
        }],
        delinquencies: ['$stateParams', 'DelinquencyService', function($stateParams, DelinquencyService) {
          return DelinquencyService.loadList($stateParams)
        }],
        lastCheckin: ['$stateParams', 'VisitRegistrationService', function($stateParams, VisitRegistrationService) {
          return VisitRegistrationService.lastCheckin($stateParams.clientId)
        }],
        todayPlan: ['$stateParams', 'VisitPlanningService', function($stateParams, VisitPlanningService) {
          return VisitPlanningService.todayPlan($stateParams.clientId)
        }]        
      }
    })

    .state('client.overview', {
      url: "/overview",
      views: {
        "tab-overview": {
          templateUrl: "templates/client/overview.html",
          controller: "OverviewController"
        }
      }
    })

    .state('client.orderHistory', {
      url: "/order-history",
      views: {
        "tab-order-history": {
          templateUrl: "templates/client/order_history.html",
          controller: "OrdersController",
          resolve: {
            orders: ['$stateParams', '$ionicLoading', '$q', 'OrdersService', 'ProtheusOrderService', "BilledProtheusOrderService", function ($stateParams, $ionicLoading, $q, OrdersService, ProtheusOrderService, BilledProtheusOrderService) {
              $ionicLoading.show({
                template: "Carregando histórico de pedido..."
              })

              return $q.all([
                OrdersService.loadList($stateParams),
                ProtheusOrderService.loadList($stateParams),
                BilledProtheusOrderService.loadList($stateParams)
              ]).finally(function () {
                $ionicLoading.hide()
              })
            }]
          }
        }
      }
    })

    .state('client.visitRegistrations', {
      url: "/visit-registrations",
      views: {
        "tab-visit-registrations": {
          templateUrl: "templates/client/visit_registrations.html",
          controller: "VisitRegistrationsController",
          resolve: {
            visitRegistrations: ['$stateParams', '$ionicLoading', 'VisitRegistrationService', function ($stateParams, $ionicLoading, VisitRegistrationService) {
              $ionicLoading.show({
                template: "Carregando registro de visitas..."
              })

              return VisitRegistrationService.loadList($stateParams).finally(function () {
                $ionicLoading.hide()
              })
            }],

            categories: ['VisitRegistrationService', function (VisitRegistrationService) {
              return VisitRegistrationService.getCategories()
            }]
          }
        }
      }
    })

    .state('client.delinquencies', {
      url: "/delinquencies",
      views: {
        "tab-delinquencies": {
          templateUrl: "templates/client/delinquencies.html",
          controller: "DelinquenciesController",
          resolve: {
            delinquencies: ['$stateParams', '$ionicLoading', 'DelinquencyService', function ($stateParams, $ionicLoading, DelinquencyService) {
              $ionicLoading.show({
                template: "Carregando inadimplências..."
              })

              return DelinquencyService.loadList($stateParams).finally(function () {
                $ionicLoading.hide()
              })
            }]
          }
        }
      }
    })

    .state('client.invoices', {
      url: "/invoices",
      views: {
        "tab-invoices": {
          templateUrl: "templates/client/invoices.html",
          controller: "InvoicesController",
          resolve: {
            invoices: ['$stateParams', '$ionicLoading', 'InvoiceService', function ($stateParams, $ionicLoading, InvoiceService) {
              $ionicLoading.show({
                template: "Carregando notas fiscais..."
              })

              return InvoiceService.loadList($stateParams).finally(function () {
                $ionicLoading.hide()
              })
            }]
          }
        }
      }
    })

    .state('client.devolutions', {
      url: "/devolutions",
      views: {
        "tab-devolutions": {
          templateUrl: "templates/client/devolutions.html",
          controller: "DevolutionsController",
          resolve: {
            devolutions: ['$stateParams', '$ionicLoading', 'DevolutionService', function ($stateParams, $ionicLoading, DevolutionService) {
              $ionicLoading.show({
                template: "Carregando devoluções..."
              })

              return DevolutionService.loadList($stateParams).finally(function () {
                $ionicLoading.hide()
              })
            }]
          }
        }
      }
    })
  }
])

cartaFabrilHome.controller("ClientShowController", ['$scope', '$ionicLoading', '$stateParams', '$ionicModal', '$ionicPopover', '$state', '$cordovaToast', 'ClientsService', 'uiGmapGoogleMapApi', 'devolutions', 'delinquencies', 'lastCheckin', 'todayPlan', 'ContactService',
  function ClientShowController($scope, $ionicLoading, $stateParams, $ionicModal, $ionicPopover, $state, $cordovaToast, ClientsService, uiGmapGoogleMapApi, devolutions, delinquencies, lastCheckin, todayPlan, ContactService) {

  $scope.clientId = $stateParams.clientId
  $scope.displayMap = false

  $scope.devolutionsBadge = devolutions.results.length > 0
  //$scope.delinquenciesBadge = delinquencies.results.length > 0

  var format = false;

  for (var i=0; i < delinquencies.results.length; i++) {
    if(delinquencies.results[i].delayDays > 3){
      format = true;
      break;
    }
  }

  $scope.delinquenciesBadge = format

  $scope.lastCheckin = lastCheckin.results[0]
  $scope.todayPlan = todayPlan
  
  uiGmapGoogleMapApi.then(function(maps) {
    console.log('maps ready')
    console.log(maps)
  })

  $ionicPopover.fromTemplateUrl('templates/client_menu.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover
  })

  $ionicModal.fromTemplateUrl('templates/new_order/blocked.html', {
    scope: $scope,
    animation: 'fade-in',
    hideDelay: true
  }).then(function(modal) {
    $scope.modal = modal
  })

  ClientsService.loadClient($state.params.clientId).then(function (client) {
    $scope.client = client[0]

    $scope.clientAddress = $scope.client.ShippingAddress
    $scope.setMapData($scope.clientAddress)

    $scope.overviewBadge = $scope.client.naoPodeFazerPedido__c

  }, function (err) {
    console.log(err)
  })

  ContactService.loadList($state.params).then(function(contacts){
    $scope.contacts = contacts.results
  }, function (err) {
    console.log(err)
  })

  $scope.setMapData = function (clientAddress) {
    if (clientAddress && clientAddress.latitude && clientAddress.longitude) {
      $scope.map = {
        center: {
          latitude: clientAddress.latitude,
          longitude: clientAddress.longitude
        },
        zoom: 16
      }

      $scope.mapURL = 'geo:' + clientAddress.latitude + ',' + clientAddress.longitude 
                        + '?q=' + encodeURIComponent(clientAddress.street + ' ' + clientAddress.city)
    }
  }

  $scope.newOrder = function (clientId) {
    if (this.client.naoPodeFazerPedido__c) {
      this.openBlockWarning()
    } else {
      $ionicLoading.show({
        template: 'Carregando novo pedido...'
      })

      $state.go("new_order.conditions", { clientId: clientId })
    }
  }

  $scope.openBlockWarning = function () {
    $scope.modal.show()
  }

  $scope.dismissWarning = function () {
    $scope.modal.hide()
  }

  $scope.$on('$ionicView.enter', function () {
    $ionicLoading.hide()
  })
}])

cartaFabrilHome.controller("OverviewController", ['$scope', '$ionicModal', '$ionicPopover', '$state', '$injector', 'ClientsService', 'uiGmapGoogleMapApi', 'VisitRegistrationService', 'VisitPlanningService', 'appTarget',
  function OverviewController($scope, $ionicModal, $ionicPopover, $state, $injector, ClientsService, uiGmapGoogleMapApi, VisitRegistrationService, VisitPlanningService, appTarget) {

  $scope.onMobile = appTarget === 'mobile'
  $scope.dataVerao = new Date('2019/02/16')

  $scope.refreshCheckinStatus = function () {
    $scope.checkinDone = $scope.todayPlan.length > 0 ? 
        ($scope.todayPlan[0].DataCheckin__c == null ? false : true) : false;

    $scope.checkoutDone = $scope.todayPlan.length > 0 ? 
        ($scope.todayPlan[0].DataCheckout__c == null ? false : true) : false;
  }
  
  $scope.refreshCheckinStatus()
  
  $scope.checkIn = function () {
    if (!$scope.onMobile || $scope.checkingIn) { return }

    $scope.checkingIn = true

    var $cordovaToast = $injector.get('$cordovaToast')

    if ($scope.todayPlan.length > 0)
      VisitPlanningService.checkIn($state.params.clientId).then(function (attrs) {
        $cordovaToast.showLongCenter('Check in realizado com sucesso.')
        $scope.lastCheckin = attrs
      }).then(function () {
        return VisitRegistrationService.lastCheckin($state.params.clientId)
      }).then(function (ret){
        $scope.lastCheckin = ret.results[0]   
        return VisitPlanningService.todayPlan($state.params.clientId)     
      }).then(function (ret){
        $scope.todayPlan = ret
        $scope.refreshCheckinStatus()
      }).catch(function (showToast) {
        if (showToast) {
          $cordovaToast.showLongCenter('Algum erro ocorreu, tente novamente.')
        }
      }).finally(function () {
        $scope.checkingIn = false
      })
    else
      VisitRegistrationService.checkIn($state.params.clientId).then(function (attrs) {
        $cordovaToast.showLongCenter('Check in realizado com sucesso.')
        $scope.lastCheckin = attrs
      }).catch(function (showToast) {
        if (showToast) {
          $cordovaToast.showLongCenter('Algum erro ocorreu, tente novamente.')
        }
      }).finally(function () {
        $scope.checkingIn = false
      })    
  }
  
  $scope.doRefresh = function() {
    $injector.get('$state').reload();
  }

  $scope.checkOut = function () {
    if (!$scope.onMobile || $scope.checkingOut) { return }

    $scope.checkingOut = true

    var $cordovaToast = $injector.get('$cordovaToast')

    VisitPlanningService.checkOut($state.params.clientId).then(function (attrs) {
      $cordovaToast.showLongCenter('Check Out realizado com sucesso.')
      $scope.lastCheckin = attrs
    }).then(function () {
      return VisitRegistrationService.lastCheckin($state.params.clientId)
    }).then(function (ret){
      $scope.lastCheckin = ret.results[0]   
      return VisitPlanningService.todayPlan($state.params.clientId)     
    }).then(function (ret){
      $scope.todayPlan = ret
      $scope.refreshCheckinStatus()
    }).catch(function (showToast) {
      if (showToast) {
        $cordovaToast.showLongCenter('Algum erro ocorreu, tente novamente.')
      }
    }).finally(function () {
      $scope.checkingOut = false
    })
  }
}])

cartaFabrilHome.controller("VisitRegistrationsController", ['$scope', '$q', '$stateParams', '$ionicLoading', '$ionicModal', '$ionicPopup', '$injector', 'visitRegistrations', 'categories', 'VisitRegistration', 'VisitRegistrationService', 'UIService', 'appTarget',
  function VisitRegistrationsController($scope, $q, $stateParams, $ionicLoading, $ionicModal, $ionicPopup, $injector, visitRegistrations, categories, VisitRegistration, VisitRegistrationService, UIService, appTarget) {

  $scope.page;
  $scope.isLastPage;
  $scope.currentSearchParams;

  $scope.getMoreVisitRegistration = function(){

    var filterParams = _.extend({ clientId: $stateParams.clientId }, this.searchParams)

    return !this.isLastPage && VisitRegistrationService.loadPage(filterParams, ++this.page).then(function (response) {
      this.visitRegistrations     = [].concat(this.visitRegistrations, response.results)
      this.isLastPage = response.isLastPage
    }.bind(this))
  }

  $scope.filter = function () {

    if ($scope.searchParams.endDate) {
      $scope.searchParams.endDate = moment($scope.searchParams.endDate).endOf('day').toDate()
    }

    $scope.visitRegistrations   = []
    $scope.isLastPage = false
    $scope.page       = 0
    

    $ionicLoading.show({ template: 'Carregando resultados...' })
    $scope.modal.hide()

    return $scope.getMoreVisitRegistration().then(function () {
      $ionicLoading.hide()
    })
  }

  function openModal(templatePath) {

    $scope.searchParams = {};

    $scope.currentSearchParams = $scope.searchParams;

    return $ionicModal.fromTemplateUrl(templatePath, {
      scope: $scope,
      animation: 'fade-in',
      hideDelay: true
    }).then(function (modal) {
      $scope.modal = modal
      modal.show()
    })
  }

  $scope.firstJan2000 = new Date(2000, 0, 1)

  $scope.setMaxStartDate = function () {
    $scope.startDatepicker.options.maxDate = $scope.currentSearchParams.endDate || $scope.today
  }

  $scope.setMinEndDate = function () {
    $scope.endDatepicker.options.minDate = $scope.currentSearchParams.startDate || $scope.firstJan2000
  }

  $scope.resetFilter = function () {
    _.assign($scope.currentSearchParams, { invoiceNumber: null, startDate: null, endDate: null })

    $scope.filter()
  }

  $scope.openFilter = function() {
    $scope.filterName = 'Registro de Visitas'
    $scope.today = moment().startOf('day').toDate()

    $scope.startDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    $scope.endDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        minDate: $scope.firstJan2000,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    openModal('templates/client/visit_registration_filter.html')
  }

  $scope.categories = categories
  $scope.visitRegistrations = visitRegistrations.results
  $scope.isLastPage = visitRegistrations.isLastPage
  $scope.page = 1
  $scope.now = Date.now()
  $scope.onMobile = appTarget === 'mobile'

  $ionicModal.fromTemplateUrl('templates/client/new_visit_registration.html', {
    scope: $scope,
    animation: 'fade-in',
    hideDelay: true
  }).then(function (modal) {
    $scope.newRegisterModal = modal
  })

  $ionicModal.fromTemplateUrl('templates/visit_registration.html', {
    scope: $scope,
    animation: 'fade-in',
    hideDelay: true
  }).then(function (modal) {
    $scope.showRegisterModal = modal
  })

  $scope.getMore = function () {
    return !$scope.isLastPage && VisitRegistrationService.loadPage($stateParams, ++$scope.page).then(function (res) {
      $scope.visitRegistrations = [].concat($scope.visitRegistrations, res.results)
      $scope.isLastPage = res.isLastPage
    })
  }

  $scope.save = function (form) {
    if (form.$invalid) { return }

    $ionicLoading.show({
      template: 'Salvando registro de visita...'
    })

    VisitRegistrationService.save($scope.visitRegistration).then(function (savedAttributes) {
      _.extend($scope.visitRegistration, { id: savedAttributes.id })
      $scope.addToListOnce(VisitRegistration(savedAttributes))

      if (!$scope.images.length) {
        $scope.handleSavingSucess()
      } else {
        $q.all($scope.images.map(function (image, i) {
          return VisitRegistrationService.upload(savedAttributes.id, image).then($scope.handleSavingSucess)
        })).then(function () {
          $scope.images = []
        }, function () {
          $scope.handleUploadError()
        })
      }
    }).catch(function () {
      $scope.handleSavingError()
    })
  }

  $scope.open = function (visitRegistrationId) {
    $scope.visitRegistration = _.find($scope.visitRegistrations, { id : visitRegistrationId })

    $scope.modal = $scope.showRegisterModal
    $scope.modal.show()
  }

  $scope.close = function () {
    $scope.modal.hide()
    $scope.images = []
  }

  $scope.images = []

  $scope.removeImage = function (i) {
    $scope.images.splice(i, 1)
  }

  $scope.getPhoto = function () {
    if (!$scope.onMobile) { return }

    $scope.photo = { source: 'CAMERA' }

    $ionicPopup.show({
      scope: $scope,
      title : "Anexar Foto",
      template : '<label class="popup-list-option" ng-class="{ selected : photo.source === \'CAMERA\' }"><input type="radio" ng-model="photo.source" value="CAMERA" /> Abrir Câmera</label>' +
                 '<label class="popup-list-option" ng-class="{ selected : photo.source === \'PHOTOLIBRARY\' }"><input type="radio" ng-model="photo.source" value="PHOTOLIBRARY" /> Abrir Galeria</label>',
      buttons : [
        { text : 'Cancelar' },
        {
          text : 'Anexar',
          type: 'button-positive',
          onTap : function (e) {
            $injector.get('CameraService').getPicture($scope.photo.source).then(function (image) {
              $scope.images.unshift(image)
            }).catch(function (err) {
              console.log(err)
            })
          }
        }
      ]
    })
  }

  $scope.newRegister = function () {
    $scope.visitRegistration = { clientId: $stateParams.clientId }

    $scope.modal = $scope.newRegisterModal
    $scope.modal.show()
  }

  $scope.addToListOnce = function (item) {
    if (_.filter($scope.visitRegistrations, { id: item.id }).length === 0) {
      $scope.visitRegistrations.unshift(item)
    }
  }

  $scope.visitRegistration = {
    clientId: $stateParams.clientId
  }

  $scope.handleSavingError = function () {
    $ionicLoading.show({
      template: 'Algum erro ocorreu, tente novamente.'
    })

    UIService.waitBefore(function () {
      $ionicLoading.hide()
    })
  }

  $scope.handleUploadError = function () {
    $ionicLoading.show({
      template: 'Erro ao subir a foto, tente novamente.'
    })

    UIService.waitBefore(function () {
      $ionicLoading.hide()
    })
  }

  $scope.handleSavingSucess = function () {
    $ionicLoading.show({
      template: 'Registro de visita salvo com sucesso!'
    })

    UIService.waitBefore(function () {
      $scope.modal.hide()
      $ionicLoading.hide()
    })
  }
}])

cartaFabrilHome.controller('ListController', ['$scope', '$ionicModal', '$stateParams', 'service', 'itemName', 'firstPage',
  function ListController($scope, $ionicModal, $stateParams, service, itemName, firstPage) {

  $scope.page       = 1
  $scope.list       = firstPage.results
  $scope.isLastPage = firstPage.isLastPage

  $scope.getMore = function () {
    return !$scope.isLastPage && service.loadPage($stateParams, ++$scope.page).then(function (response) {
      $scope.list       = [].concat($scope.list, response.results)
      $scope.isLastPage = response.isLastPage
    })
  }

  $scope.doRefresh = function doRefresh() {
    $scope.page       = 0
    $scope.list       = []
    $scope.isLastPage = false

    $scope.getMore().then(function () {
      $scope.$broadcast('scroll.refreshComplete')
    })
  }

  $scope.open = function (itemId) {
    $scope[itemName] = _.find($scope.list, { id : itemId })

    $ionicModal.fromTemplateUrl('templates/' + itemName + '.html', {
      scope: $scope,
      animation: 'fade-in',
      hideDelay: true
    }).then(function(modal) {
      $scope.modal = modal
      modal.show()
    })
  }

  $scope.close = function () {
    $scope.modal.hide()
  }
}])

cartaFabrilHome.controller("DelinquenciesController", ['$scope', '$controller', "$ionicModal", 'DelinquencyService', 'delinquencies', '$ionicLoading', '$stateParams',
  function DelinquenciesController($scope, $controller, $ionicModal, DelinquencyService, delinquencies, $ionicLoading, $stateParams) {

  $controller('ListController', {
    $scope: $scope,
    service: DelinquencyService,
    itemName: 'delinquency',
    firstPage: delinquencies
  }),
  $scope.page;
  $scope.isLastPage;
  $scope.currentSearchParams;

  $scope.getMoreDelinquency = function(){

    var filterParams = _.extend({ clientId: $stateParams.clientId }, this.searchParams)

    return !this.isLastPage && DelinquencyService.loadPage(filterParams, ++this.page).then(function (response) {
      this.list     = [].concat(this.list, response.results)
      this.isLastPage = response.isLastPage
    }.bind(this))
  }

  $scope.filter = function () {

    if ($scope.searchParams.endDate) {
      $scope.searchParams.endDate = moment($scope.searchParams.endDate).endOf('day').toDate()
    }

    $scope.list   = []
    $scope.isLastPage = false
    $scope.page       = 0
    

    $ionicLoading.show({ template: 'Carregando resultados...' })
    $scope.modal.hide()

    return $scope.getMoreDelinquency().then(function () {
      $ionicLoading.hide()
    })
  }

  function openModal(templatePath) {

    $scope.searchParams = {};

    $scope.currentSearchParams = $scope.searchParams;

    return $ionicModal.fromTemplateUrl(templatePath, {
      scope: $scope,
      animation: 'fade-in',
      hideDelay: true
    }).then(function (modal) {
      $scope.modal = modal
      modal.show()
    })
  }

  $scope.firstJan2000 = new Date(2000, 0, 1)

  $scope.setMaxStartDate = function () {
    $scope.startDatepicker.options.maxDate = $scope.currentSearchParams.endDate || $scope.today
  }

  $scope.setMinEndDate = function () {
    $scope.endDatepicker.options.minDate = $scope.currentSearchParams.startDate || $scope.firstJan2000
  }

  $scope.resetFilter = function () {
    _.assign($scope.currentSearchParams, { invoiceNumber: null, startDate: null, endDate: null })

    $scope.filter()
  }

  $scope.openFilter = function() {
    $scope.filterName = 'Inadimplências'
    $scope.today = moment().startOf('day').toDate()

    $scope.startDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    $scope.endDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        minDate: $scope.firstJan2000,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    openModal('templates/client/delinquencies_filter.html')
  }
}])

cartaFabrilHome.controller("InvoicesController", ['$scope', '$controller', "$ionicModal", 'InvoiceService', 'invoices', '$ionicLoading', '$stateParams',
  function InvoicesController($scope, $controller, $ionicModal, InvoiceService, invoices, $ionicLoading, $stateParams) {

  $controller('ListController', {
    $scope: $scope,
    service: InvoiceService,
    itemName: 'invoice',
    firstPage: invoices
  }),

  $scope.page;
  $scope.isLastPage;
  $scope.currentSearchParams;

  $scope.getMoreInvoices = function(){

    var filterParams = _.extend({ clientId: $stateParams.clientId }, this.searchParams)

    return !this.isLastPage && InvoiceService.loadPage(filterParams, ++this.page).then(function (response) {
      this.list     = [].concat(this.list, response.results)
      this.isLastPage = response.isLastPage
    }.bind(this))
  }

  $scope.filter = function () {

    if ($scope.searchParams.endDate) {
      $scope.searchParams.endDate = moment($scope.searchParams.endDate).endOf('day').toDate()
    }

    $scope.list   = []
    $scope.isLastPage = false
    $scope.page       = 0
    

    $ionicLoading.show({ template: 'Carregando resultados...' })
    $scope.modal.hide()

    return $scope.getMoreInvoices().then(function () {
      $ionicLoading.hide()
    })
  }

  function openModal(templatePath) {

    $scope.searchParams = {};

    $scope.currentSearchParams = $scope.searchParams;

    return $ionicModal.fromTemplateUrl(templatePath, {
      scope: $scope,
      animation: 'fade-in',
      hideDelay: true
    }).then(function (modal) {
      $scope.modal = modal
      modal.show()
    })
  }

  $scope.firstJan2000 = new Date(2000, 0, 1)

  $scope.setMaxStartDate = function () {
    $scope.startDatepicker.options.maxDate = $scope.currentSearchParams.endDate || $scope.today
  }

  $scope.setMinEndDate = function () {
    $scope.endDatepicker.options.minDate = $scope.currentSearchParams.startDate || $scope.firstJan2000
  }

  $scope.resetFilter = function () {
    _.assign($scope.currentSearchParams, { invoiceNumber: null, startDate: null, endDate: null })

    $scope.filter()
  }

  $scope.openFilter = function() {
    $scope.filterName = 'Notas Fiscais'
    $scope.today = moment().startOf('day').toDate()

    $scope.startDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    $scope.endDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        minDate: $scope.firstJan2000,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    openModal('templates/client/invoices_filter.html')
  }

}])

cartaFabrilHome.controller("DevolutionsController", ['$scope', '$controller', "$ionicModal", 'DevolutionService', 'devolutions', '$ionicLoading', '$stateParams',
  function DevolutionsController($scope, $controller, $ionicModal, DevolutionService, devolutions, $ionicLoading, $stateParams) {

  $controller('ListController', {
    $scope: $scope,
    service: DevolutionService,
    itemName: 'devolution',
    firstPage: devolutions
  }),
  $scope.page;
  $scope.isLastPage;
  $scope.currentSearchParams;

  $scope.getMoreDevolution = function(){

    var filterParams = _.extend({ clientId: $stateParams.clientId }, this.searchParams)

    return !this.isLastPage && DevolutionService.loadPage(filterParams, ++this.page).then(function (response) {
      this.list     = [].concat(this.list, response.results)
      this.isLastPage = response.isLastPage
    }.bind(this))
  }

  $scope.filter = function () {

    if ($scope.searchParams.endDate) {
      $scope.searchParams.endDate = moment($scope.searchParams.endDate).endOf('day').toDate()
    }

    $scope.list   = []
    $scope.isLastPage = false
    $scope.page       = 0
    

    $ionicLoading.show({ template: 'Carregando resultados...' })
    $scope.modal.hide()

    return $scope.getMoreDevolution().then(function () {
      $ionicLoading.hide()
    })
  }

  function openModal(templatePath) {

    $scope.searchParams = {};

    $scope.currentSearchParams = $scope.searchParams;

    return $ionicModal.fromTemplateUrl(templatePath, {
      scope: $scope,
      animation: 'fade-in',
      hideDelay: true
    }).then(function (modal) {
      $scope.modal = modal
      modal.show()
    })
  }

  $scope.firstJan2000 = new Date(2000, 0, 1)

  $scope.setMaxStartDate = function () {
    $scope.startDatepicker.options.maxDate = $scope.currentSearchParams.endDate || $scope.today
  }

  $scope.setMinEndDate = function () {
    $scope.endDatepicker.options.minDate = $scope.currentSearchParams.startDate || $scope.firstJan2000
  }

  $scope.resetFilter = function () {
    _.assign($scope.currentSearchParams, { invoiceNumber: null, startDate: null, endDate: null })

    $scope.filter()
  }

  $scope.openFilter = function() {
    $scope.filterName = 'Devoluções'
    $scope.today = moment().startOf('day').toDate()

    $scope.startDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    $scope.endDatepicker = {
      options:  {
        formatYear: 'yyyy',
        maxDate: $scope.today,
        minDate: $scope.firstJan2000,
        startingDay: 0,
        showWeeks: false
      },

      opened: false,

      toggleOpened: function () {
        this.opened = !this.opened
      }
    }

    openModal('templates/client/devolutions_filter.html')
  }
}])