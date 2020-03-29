describe("OrderConditionsController", function () {
  var orderConditionsController, $q, $controller, $rootScope, $scope, $ionicPopup, $state, ClientsService, OrderService, OfflineInterceptor

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _$ionicPopup_, _$state_, _$httpBackend_, _ClientsService_, _OrderService_, _OfflineInterceptor_) {
    $q                 = _$q_
    $controller        = _$controller_
    $ionicPopup        = _$ionicPopup_
    $rootScope         = _$rootScope_
    $state             = _$state_
    ClientsService     = _ClientsService_
    OrderService       = _OrderService_
    OfflineInterceptor = _OfflineInterceptor_

     _$httpBackend_.whenGET(/\.html$/).respond('');

    spyOn(ClientsService, "loadClientToOrder").and.returnValue($q.when({ nomeFantasia__c: "Test" }))

    spyOn(OfflineInterceptor.prototype, "request")
    spyOn(OrderService, "minDeliveryDate").and.returnValue(moment().add(2, 'days'))

    $scope                    = $rootScope.$new()
    orderConditionsController = $controller("OrderConditionsController", { $scope: $scope, $rootScope: $rootScope })
  }))

  it("have a controller", function () {
    expect(orderConditionsController).toBeDefined()
  })

  it("have a route to order conditions", function () {
    expect($state.href("new_order.conditions", { "clientId": "999" })).toEqual("#/new_order/999/conditions")
  })

  describe("with configured route", function () {
    var state

    beforeEach(function () {
      state = $state.get("new_order.conditions")
    })

    it("have an url", function () {
      expect(state.url).toEqual("/conditions")
    })

    it("have a view", function () {
      expect(state.views["tab-conditions"]).toBeDefined()
    })

    it("have a template", function () {
      expect(state.views["tab-conditions"].templateUrl).toEqual("templates/new_order/conditions.html")
    })

    it("have a controller", function () {
      expect(state.views["tab-conditions"].controller).toEqual("OrderConditionsController")
    })
  })

  describe("#checkException(exception)", function () {
    var functionToBeCalled = "validateSomething"

    beforeEach(function () {
      OrderService[functionToBeCalled] = function () {}
      spyOn(OrderService, functionToBeCalled)
    })

    it("calls Order Service function to check exception", function () {
      $scope.checkException("Something")
      expect(OrderService.validateSomething).toHaveBeenCalled()
    })
  })

  describe("#assertPaymentOption", function () {
    var finDiscount = 2,
        order       = { paymentOption: { maxDescFinanceiro__c: 0 }, finDiscount: finDiscount }

    beforeEach(function () {
      OrderService.order = order
      spyOn($scope, "checkException")
    })

    afterEach(function () {
      order.finDiscount = finDiscount
    })

    describe("when max discount from selected payment option is zero", function () {
      it("turn the finDiscount to zero", function () {
        $scope.assertPaymentOption()
        expect(OrderService.order.finDiscount).toEqual(0)
      })
    })

    describe("when max discount from selected payment option is not zero", function () {
      beforeEach(function () {
        order.paymentOption.maxDescFinanceiro__c = 2
      })

      it("don't changes the finDiscount", function () {
        $scope.assertPaymentOption()
        expect(OrderService.order.finDiscount).toEqual(finDiscount)
      })
    })

    it("checks PaymentOption and FinDiscount exceptions", function () {
      $scope.assertPaymentOption()
      expect($scope.checkException).toHaveBeenCalledWith("PaymentOption")
      expect($scope.checkException).toHaveBeenCalledWith("FinDiscount")
    })
  })

  describe("#hasDeliveryDateException", function () {
    describe("when order service have a delivery date exceptions", function () {
      beforeEach(function () {
        OrderService.exceptions = ["deliveryDate"]
      })

      afterEach(function () {
        OrderService.exceptions = []
      })

      it("returns true", function () {
        expect($scope.hasDeliveryDateException()).toBeTruthy()
      })
    })

    describe("when order service doesn't have a delivery date exceptions", function () {
      beforeEach(function () {
        OrderService.exceptions = []
      })

      it("returns false", function () {
        expect($scope.hasDeliveryDateException()).toBeFalsy()
      })
    })
  })

  describe("#showInvalidFinDiscountMessage", function () {
    describe("when the finDiscount is greater than the maxDiscount", function () {
      var finDiscount,
          maxDiscount

      beforeEach(function () {
        finDiscount = 2
        maxDiscount = 1

        $scope.orderService = {
          order: {
            finDiscount: finDiscount,
            paymentOption: {
              maxDescFinanceiro__c: maxDiscount
            }
          }
        }
      })

      it("show the invalid fin discount modal", function () {
        spyOn($ionicPopup, "alert")

        $scope.showInvalidFinDiscountMessage(finDiscount)
        expect($ionicPopup.alert).toHaveBeenCalledWith({
          title: 'Desconto Inválido',
          template: 'Para essa condição de pagamento, o desconto financeiro não pode ser maior do que <strong>' + maxDiscount + '</strong>%'
        })
      })

      it("assings the $scope.finDiscount to zero", function () {
        $scope.showInvalidFinDiscountMessage(finDiscount)
        expect($scope.orderService.order.finDiscount).toEqual(0)
      })
    })

    describe("when the finDiscount is less than the maxDiscount", function () {
      var finDiscount,
          maxDiscount

      beforeEach(function () {
        finDiscount = 1
        maxDiscount = 2

        $scope.orderService = {
          order: {
            paymentOption: {
              maxDescFinanceiro__c: maxDiscount
            }
          }
        }
      })

      it("doesn't show the invalid fin discount modal", function () {
        spyOn($ionicPopup, "alert")

        $scope.showInvalidFinDiscountMessage(finDiscount)
        expect($ionicPopup.alert).not.toHaveBeenCalled()
      })
    })
  })

  describe("orderService shipping watcher", function () {
    var minimumOrderValues = { minValue: 1, minFobValue: 100 },
        minimumDuplValues  = { minValue: 1, minFobValue: 100 },
        order              = { shipping: 'CIF' }


    beforeEach(function () {
      OrderService.order              = order
      OrderService.minimumOrderValues = minimumOrderValues
      OrderService.minimumDuplValues  = minimumDuplValues
    })

    describe("when the $scope changes order shipping to 'FOB'", function () {
      it("sets itemDiscountField to percDescontoFob__c", function () {
        order.shipping = 'FOB'

        $scope.$apply()

        expect(OrderService.itemDiscountField).toEqual("percDescontoFob__c")
      })

      describe("and min order value does not have special conditions", function () {
        it("sets orderService.minOrderValue to minFobValue from minimum order values", function () {
          order.shipping = 'FOB'

          $scope.$apply()

          expect(OrderService.minOrderValue).toEqual(minimumOrderValues.minFobValue)
        })
      })

      describe("and min dupl value does not have special conditions", function () {
        it("sets orderService.minDuplValue to minFobValue from minimum dupl values", function () {
          order.shipping = 'FOB'

          $scope.$apply()

          expect(OrderService.minDuplValue).toEqual(minimumDuplValues.minFobValue)
        })
      })
    })

    describe("when the $scope changes order shipping to 'CIF'", function () {
      it("sets itemDiscountField to percDescontoFob__c", function () {
        order.shipping = 'CIF'

        $scope.$apply()

        expect(OrderService.itemDiscountField).toEqual("percDesconto__c")
      })

      describe("and min order value does not have special conditions", function () {
        it("sets orderService.minOrderValue to minValue from minimum order values", function () {
          order.shipping = 'CIF'

          $scope.$apply()

          expect(OrderService.minOrderValue).toEqual(minimumOrderValues.minValue)
        })
      })

      describe("and min dupl value does not have special conditions", function () {
        it("sets orderService.minDuplValue to minValue from minimum dupl values", function () {
          order.shipping = 'CIF'

          $scope.$apply()

          expect(OrderService.minDuplValue).toEqual(minimumDuplValues.minValue)
        })
      })
    })
  })
})
