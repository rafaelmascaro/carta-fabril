'use strict';

cartaFabrilHome.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('orders', {
      url: '/orders',
      templateUrl: 'templates/orders.html',
      controller: 'OrdersController',
      resolve: {
        orders: ['$ionicLoading', '$q', 'OrdersService', 'ProtheusOrderService', 'BilledProtheusOrderService', function ($ionicLoading, $q, OrdersService, ProtheusOrderService, BilledProtheusOrderService) {
          $ionicLoading.show({
            template: "Carregando pedidos..."
          })

          return $q.all([
            OrdersService.loadList(),
            ProtheusOrderService.loadList(),
            BilledProtheusOrderService.loadList()
          ]).finally(function () {
            $ionicLoading.hide()
          })
        }]
      }
    })
  }
])

cartaFabrilHome.controller("OrdersController", ["$scope", "$state", "orders", "$ionicModal", "$ionicLoading", "$stateParams", "OrdersService", "ProtheusOrderService", "BilledProtheusOrderService",
  function OrdersController($scope, $state, orders, $ionicModal, $ionicLoading, $stateParams, OrdersService, ProtheusOrderService, BilledProtheusOrderService) {

  var scopes = {
        original: {
          service: OrdersService,
          display: 'pendentes',
          orders: orders[0].results,
          isLastPage: orders[0].isLastPage
        },
        protheus: {
          service: ProtheusOrderService,
          orders: orders[1].results,
          display: 'carteiras',
          isLastPage: orders[1].isLastPage
        },
        billed: {
          service: BilledProtheusOrderService,
          display: 'finalizados',
          orders: orders[2].results,
          isLastPage: orders[2].isLastPage
        }
      }

  function getMoreOrders() {
    var filterParams = _.extend({ clientId: $stateParams.clientId }, this.searchParams)

    return !this.isLastPage && this.service.loadPage(filterParams, ++this.page).then(function (response) {
      this.orders     = [].concat(this.orders, response.results)
      this.isLastPage = response.isLastPage
    }.bind(this))
  }

  _.each(scopes, function (scope) {
    _.assign(scope, {
      page: 1,
      searchParams: {},
      getMoreOrders: getMoreOrders.bind(scope)
    })
  })

  $scope.scopes = scopes

  $scope.displayCompleteDetails = !$stateParams.clientId

  $scope.firstJan2000 = new Date(2000, 0, 1)

  $scope.changeTab = function (tab) {
    $scope.activeTab = tab
    $scope.currentSearchParams = scopes[tab].searchParams
  }

  $scope.changeTab("original")

  function openModal(templatePath) {
    return $ionicModal.fromTemplateUrl(templatePath, {
      scope: $scope,
      animation: 'fade-in',
      hideDelay: true
    }).then(function (modal) {
      $scope.modal = modal
      modal.show()
    })
  }

  $scope.setMaxStartDate = function () {
    $scope.startDatepicker.options.maxDate = $scope.currentSearchParams.endDate || $scope.today
  }

  $scope.setMinEndDate = function () {
    $scope.endDatepicker.options.minDate = $scope.currentSearchParams.startDate || $scope.firstJan2000
  }

  $scope.openFilter = function() {
    $scope.filterName = scopes[$scope.activeTab].display
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


    openModal('templates/order_filter.html')
  }

  $scope.openProtheusOrder = function (protheusCode) {
    $scope.order = _.find(scopes.protheus.orders, { protheusCode: protheusCode })

    openModal('templates/protheus_order.html')
  }

  $scope.openBilledProtheusOrder = function (protheusCode) {
    $scope.order = _.find(scopes.billed.orders, { protheusCode: protheusCode })

    openModal('templates/protheus_order.html')
  }

  $scope.resetFilter = function () {
    _.assign($scope.currentSearchParams, { orderNumber: null, startDate: null, endDate: null })

    $scope.filter()
  }

  $scope.filter = function () {
    var scope = scopes[$scope.activeTab]

    if (scope.searchParams.endDate) {
      scope.searchParams.endDate = moment(scope.searchParams.endDate).endOf('day').toDate()
    }

    scope.orders     = []
    scope.isLastPage = false
    scope.page       = 0

    $ionicLoading.show({ template: 'Carregando resultados...' })
    $scope.modal.hide()

    return scope.getMoreOrders().then(function () {
      $ionicLoading.hide()
    })
  }

  $scope.doRefresh = function () {

    var scope = scopes[$scope.activeTab]

    scope.orders     = []
    scope.isLastPage = false
    scope.page       = 0

    return scope.getMoreOrders().then(function () {
      $scope.$broadcast('scroll.refreshComplete')
    })
  }

  $scope.close = function () {
    $scope.modal.hide()
  }

  $scope.goToOrder = function (orderNumber) {
    var order = _.find(scopes.original.orders, { orderNumber: orderNumber })

    if (order.status == 'Rascunho' || order.status == 'Reprovado') {
      $state.go("new_order.conditions", { clientId: order.accountId, orderId: order.id })
    } else {
      $scope.order = order

      openModal('templates/order.html')
    }
  }

  $scope.cloneOrder = function (orderId) {
    var order = _.find(scopes.original.orders, { id: orderId })

    $state.go("new_order.conditions", {
      clientId: order.accountId,
      orderId: order.id,
      clone: '1'
    }).then($scope.close)
  }

  $scope.cloneProtheusOrder = function (protheusCode) {
    var protheusOrder = _.find([].concat(scopes.protheus.orders, scopes.billed.orders), { protheusCode: protheusCode })

    $state.go("new_order.conditions", {
        clientId: protheusOrder.accountId,
        orderId: protheusOrder.originalOrderId,
        clone: '2',
        products: _.map(protheusOrder.products, 'regionalTableId').join(';'),
        orderType: protheusOrder.orderType
      }).then($scope.close)
  }

}])
