describe("OrderItemsController", function () {
  var orderItemsController, $q, $controller, $rootScope, $scope, $state, OrderService, $ionicPopup

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _$state_, _OrderService_, _$ionicPopup_) {
    $q           = _$q_
    $controller  = _$controller_
    $rootScope   = _$rootScope_
    $state       = _$state_
    OrderService = _OrderService_
    $ionicPopup  = _$ionicPopup_

    $scope               = $rootScope.$new()
    orderItemsController = $controller("OrderItemsController", { $scope: $scope, $rootScope: $rootScope })
  }))

  it("have a controller", function () {
    expect(orderItemsController).toBeDefined()
  })

  it("have a route to order items", function () {
    expect($state.href("new_order.items", { "clientId": "999" })).toEqual("#/new_order/999/items")
  })

  describe("with configured route", function () {
    var state

    beforeEach(function () {
      state = $state.get("new_order.items")
    })

    it("have an url", function () {
      expect(state.url).toEqual("/items")
    })

    it("have a view", function () {
      expect(state.views["tab-items"]).toBeDefined()
    })

    it("have a template", function () {
      expect(state.views["tab-items"].templateUrl).toEqual("templates/new_order/items.html")
    })

    it("have a controller", function () {
      expect(state.views["tab-items"].controller).toEqual("OrderItemsController")
    })
  })

  describe("#checkException(exception)", function () {
    var exception        = "Items",
        validationMethod = "validate" + exception

    beforeEach(function () {
      spyOn(OrderService, validationMethod)
      spyOn(OrderService, 'clearRuleExceptionNote')
    })

    it("calls OrderService validate method accordind param", function () {
      $scope.checkException(exception)
      expect(OrderService[validationMethod]).toHaveBeenCalled()
    })

    it("always calls OrderService.clearRuleExceptionNote", function () {
      $scope.checkException(exception)
      expect(OrderService.clearRuleExceptionNote).toHaveBeenCalled()
    })
  })

  describe("#toggleEdition(id)", function () {
    beforeEach(function () {
      spyOn(OrderService, "toggleEdition")
    })

    it("calls Order Service to select desired product", function () {
      var id = "999"
      $scope.toggleEdition(id)
      expect(OrderService.toggleEdition).toHaveBeenCalledWith(id)
    })
  })

  describe("#removeItem(id)", function () {
    beforeEach(function () {
      spyOn(OrderService, "unselectProduct")
    })

    it("calls Order Service remove item from selected products", function () {
      var id = "999"
      $scope.removeItem(id)
      expect(OrderService.unselectProduct).toHaveBeenCalledWith(id)
    })
  })

  describe("#toggleFooter()", function () {
    describe("when footerOpened is true", function () {
      beforeEach(function () {
        $scope.footerOpened = true
      })

      it("sets footerOpened to false", function () {
        $scope.toggleFooter()
        expect($scope.footerOpened).toBeFalsy()
      })
    })

    describe("when footerOpened is false", function () {
      beforeEach(function () {
        $scope.footerOpened = false
      })

      it("sets footerOpened to true", function () {
        $scope.toggleFooter()
        expect($scope.footerOpened).toBeTruthy()
      })
    })
  })

  describe("#openExceptions()", function () {
    var modal = { show: function () {} }

    beforeEach(function () {
      $scope.modal = modal
      OrderService.order = {}
    })

    describe("when order service have exceptions", function () {
      beforeEach(function () {
        OrderService.exceptions = ["test"]
      })

      it("show exceptions modal", function () {
        var spy = spyOn(modal, "show")

        $scope.openExceptions()
        expect(spy).toHaveBeenCalled()
      })

      it("sets previous rule exception note", function () {
        var spy = spyOn(modal, "show")
        OrderService.order.ruleExceptionNote = 'a note'

        $scope.openExceptions()
        expect($scope.previousRuleExceptionNote).toEqual('a note')
      })
    })

    describe("when order service has no exceptions", function () {
      beforeEach(function () {
        OrderService.exceptions = []
      })

      it("do nothing", function () {
        var spy = spyOn(modal, "show")

        $scope.openExceptions()
        expect(spy).not.toHaveBeenCalled()
      })
    })
  })

  describe("#closeExceptions(undoReason)", function () {
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

    describe("when undoReason param is true", function () {
      it("brings back old exception reason", function () {
        $scope.previousRuleExceptionNote = 'ye olde reason'
        $scope.closeExceptions(true)

        expect(OrderService.order.ruleExceptionNote).toEqual('ye olde reason')
      })
    })

    describe("when undoReason param is false", function () {
      it("maintains the exception reason", function () {
        $scope.closeExceptions(false)
        expect(OrderService.order.ruleExceptionNote).toEqual(reason)
      })
    })
  })
})

