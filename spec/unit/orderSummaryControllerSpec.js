describe("OrderSummaryController", function () {
  var orderSummaryController, $q, $controller, $rootScope, $scope, $state, $ionicPopup, OrderService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _$state_, _$ionicPopup_, _OrderService_) {
    $q           = _$q_
    $controller  = _$controller_
    $rootScope   = _$rootScope_
    $state       = _$state_
    $ionicPopup  = _$ionicPopup_
    OrderService = _OrderService_

    $scope                 = $rootScope.$new()
    orderSummaryController = $controller("OrderSummaryController", { $scope: $scope, $rootScope: $rootScope })
  }))

  it("have a controller", function () {
    expect(orderSummaryController).toBeDefined()
  })

  it("have a route to order summary", function () {
    expect($state.href("new_order.summary", { "clientId": "999" })).toEqual("#/new_order/999/summary")
  })

  describe("with configured route", function () {
    var state

    beforeEach(function () {
      state = $state.get("new_order.summary")
    })

    it("have an url", function () {
      expect(state.url).toEqual("/summary")
    })

    it("have a view", function () {
      expect(state.views["tab-summary"]).toBeDefined()
    })

    it("have a template", function () {
      expect(state.views["tab-summary"].templateUrl).toEqual("templates/new_order/summary.html")
    })

    it("have a controller", function () {
      expect(state.views["tab-summary"].controller).toEqual("OrderSummaryController")
    })
  })

  describe("#saveOrder", function () {
    beforeEach(function () {
      spyOn(OrderService, "saveOrder")
    })

    xit("calls Order Service to save order", function () {
      $scope.saveOrder()
      expect(OrderService.saveOrder).toHaveBeenCalled()
    })
  })

  describe("#placeDraftOrder", function () {
    var spyPopUp

    beforeEach(function () {
      spyPopUp = spyOn($ionicPopup, 'confirm').and.returnValue({ then: function (success, error){ success(true) } })

      spyOn($scope, "saveDraftOrder")
      spyOn(OrderService, "canBeSaved").and.returnValue(true)
    })

    it("displays popup to user warning about save as a draft", function () {
      $scope.placeDraftOrder()

      expect(spyPopUp).toHaveBeenCalledWith({
        title: "Salvar rascunho",
        template: "Deseja salvar o rascunho?"
      })
    })

    it("calls Order Service to save order as a draft", function () {
      $scope.placeDraftOrder()

      expect($scope.saveDraftOrder).toHaveBeenCalled()
    })
  })

  describe("#closeExceptions(clearReason)", function () {
    var modal  = { hide: function () {} },
        reason = "Some reason"

    beforeEach(function () {
      $scope.modal = modal
      OrderService.order = {}
      OrderService.order.ruleExceptionNote = reason
    })

    it("hides modal with exceptions", function () {
      var spy = spyOn(modal, "hide")

      $scope.closeExceptions(false)
      expect(spy).toHaveBeenCalled()
    })

    describe("when clearReason param is true", function () {
      it("clears the exception reason", function () {
        $scope.closeExceptions(true)
        expect(OrderService.order.ruleExceptionNote).toEqual("")
      })
    })

    describe("when clearReason param is false", function () {
      it("maintains the exception reason", function () {
        $scope.closeExceptions(false)
        expect(OrderService.order.ruleExceptionNote).toEqual(reason)
      })
    })
  })
})
