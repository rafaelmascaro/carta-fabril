'use strict';

cartaFabrilOrders.config([
  '$stateProvider',

  function ($stateProvider) {
    $stateProvider.state('new_order', {
      abstract: true,
      url: "/new_order/:clientId",
      templateUrl: 'templates/new_order.html',
      cache: false,
      params: {
        orderId: null,
        clone: 0,
        products: '',
        orderType: ''
      },
      controller: function ($scope, $stateParams) {
        $scope.clientId = $stateParams.clientId
        $scope.orderId  = $stateParams.orderId
      },
      resolve: {
        loaded: function (OrderService, $stateParams,$ionicLoading) {
          $ionicLoading.show({
            template: "Carregando pedido..."
          })
          return OrderService.initialize($stateParams.clientId, $stateParams.orderId, 
            $stateParams.clone, $stateParams.products, $stateParams.orderType)
            .finally(function () {
              $ionicLoading.hide()
            })
        }
      }
    })

    .state('new_order.conditions', {
      url: "/conditions",
      views: {
        "tab-conditions": {
          templateUrl: "templates/new_order/conditions.html",
          controller: "OrderConditionsController"
        }
      }
    })

    .state('new_order.items', {
      url: "/items",
      views: {
        "tab-items": {
          //templateUrl: "templates/new_order/items.html",
          templateUrl: !ionic.Platform.isAndroid() ? "templates/new_order/itemsweb.html" : "templates/new_order/items.html",
          controller: "OrderItemsController"
        }
      }
    })

    .state('new_order.summary', {
      url: "/summary",
      views: {
        "tab-summary": {
          templateUrl: "templates/new_order/summary.html",
          controller: "OrderSummaryController"
        }
      }
    })
  }
])


angular.module("ngLocale", [], ["$provide", function($provide) {
  var PLURAL_CATEGORY = {ZERO: "zero", ONE: "one", TWO: "two", FEW: "few", MANY: "many", OTHER: "other"};
  $provide.value("$locale", {
    "DATETIME_FORMATS": {
      "AMPMS": [
        "AM",
        "PM"
      ],
      "DAY": [
        "domingo",
        "segunda-feira",
        "ter\u00e7a-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "s\u00e1bado"
      ],
      "ERANAMES": [
        "Antes de Cristo",
        "Ano do Senhor"
      ],
      "ERAS": [
        "a.C.",
        "d.C."
      ],
      "FIRSTDAYOFWEEK": 6,
      "MONTH": [
        "janeiro",
        "fevereiro",
        "mar\u00e7o",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
      ],
      "SHORTDAY": [
        "dom",
        "seg",
        "ter",
        "qua",
        "qui",
        "sex",
        "s\u00e1b"
      ],
      "SHORTMONTH": [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez"
      ],
      "WEEKENDRANGE": [
        5,
        6
      ],
      "fullDate": "EEEE, d 'de' MMMM 'de' y",
      "longDate": "d 'de' MMMM 'de' y",
      "medium": "d 'de' MMM 'de' y HH:mm:ss",
      "mediumDate": "d 'de' MMM 'de' y",
      "mediumTime": "HH:mm:ss",
      "short": "dd/MM/yy HH:mm",
      "shortDate": "dd/MM/yy",
      "shortTime": "HH:mm"
    },
    "NUMBER_FORMATS": {
      "CURRENCY_SYM": "R$",
      "DECIMAL_SEP": ",",
      "GROUP_SEP": ".",
      "PATTERNS": [
        {
          "gSize": 3,
          "lgSize": 3,
          "maxFrac": 3,
          "minFrac": 0,
          "minInt": 1,
          "negPre": "-",
          "negSuf": "",
          "posPre": "",
          "posSuf": ""
        },
        {
          "gSize": 3,
          "lgSize": 3,
          "maxFrac": 2,
          "minFrac": 2,
          "minInt": 1,
          "negPre": "\u00a4-",
          "negSuf": "",
          "posPre": "\u00a4",
          "posSuf": ""
        }
      ]
    },
    "id": "pt-br",
    "pluralCat": function(n, opt_precision) {  if (n >= 0 && n <= 2 && n != 2) {    return PLURAL_CATEGORY.ONE;  }  return PLURAL_CATEGORY.OTHER;}
  });
  }])


cartaFabrilOrders.controller("OrderConditionsController", ["$scope", "$ionicPopup", "$ionicLoading", "OrderService", function($scope, $ionicPopup, $ionicLoading, OrderService) {
  $scope.orderService = OrderService

  $scope.minDate = $scope.orderService.minDeliveryDate().toDate()

  $scope.deliveryDatepicker = {
    options:  {
      formatYear: 'yyyy',
      language: 'pt-BR',
      minDate: OrderService.minDeliveryDate(),
      startingDay: 0,
      showWeeks: false
    },

    opened: false,

    toggleOpened: function () {
      this.opened = !this.opened
    }
  }

  $scope.$on('calculate:averageDiscount:finish', function () {
    $scope.checkException("Items")
  })
  
  $scope.$on('update:DatepickerMinDate', function () {
    var minDate = OrderService.minDeliveryDate();
    $scope.deliveryDatepicker.options = {
      formatYear: 'yyyy',
      language: 'pt-BR',
      minDate: minDate,
      startingDay: 0,
      showWeeks: false
    }

    if(OrderService.order.deliveryDate && OrderService.order.deliveryDate < minDate)
      OrderService.order.deliveryDate = null;
    
  })

  $scope.checkException = function (exception) {
    var functionToBeCalled = "validate" + exception
    OrderService[functionToBeCalled]()
  }

  $scope.assertPaymentOption = function () {
    if (this.orderService.order.paymentOption.maxDescFinanceiro__c == 0) {
      this.orderService.order.finDiscount = 0
    }

    this.checkException("PaymentOption")
    this.checkException("FinDiscount")
  }

  $scope.hasDeliveryDateException = function () {
    return _.includes(OrderService.exceptions, "deliveryDate")
  }

  $scope.showInvalidFinDiscountMessage = function (finDiscount) {
    var maxDiscount = $scope.orderService.order.paymentOption.maxDescFinanceiro__c

    if (finDiscount > maxDiscount) {
      $ionicPopup.alert({
        title: 'Desconto Inválido',
        template: 'Para essa condição de pagamento, o desconto financeiro não pode ser maior do que ' +
                  '<strong>' + maxDiscount + '</strong>%'
      })

      $scope.orderService.order.finDiscount = 0
    }
  }

  $scope.$watch("orderService.order.shipping", function (newValue, oldValue) {
    var minValueField;

    if (newValue == 'CIF' || newValue == undefined) {
      $scope.orderService.itemDiscountField = "percDesconto__c"
      minValueField = 'minValue'
    } else {
      $scope.orderService.itemDiscountField = "percDescontoFob__c"
      minValueField = 'minFobValue'
    }

    if (!$scope.orderService.hasMinOrderConditions) {
      $scope.orderService.minOrderValue = $scope.orderService.minimumOrderValues[minValueField]
    }

    if (!$scope.orderService.hasMinDuplConditions) {
      $scope.orderService.minDuplValue = $scope.orderService.minimumDuplValues[minValueField]
    }

    if(OrderService.order)
      OrderService['validateDeliveryDate']();

  })

  $scope.$watch('orderService.order.finDiscount', function (newValue, oldValue) {
    if (!_.isNumber(newValue)) { return }

    $scope.showInvalidFinDiscountMessage(newValue)
  })

  $scope.$on('$ionicView.enter', function () {
    $ionicLoading.hide()
  })
}])

cartaFabrilOrders.controller("OrderItemsController", ["$scope", "$rootScope","$ionicModal", "$ionicScrollDelegate", "$ionicPopup", "$timeout", "$location", "OrderService", function ($scope, $rootScope,$ionicModal, $ionicScrollDelegate, $ionicPopup, $timeout, $location, OrderService) {
  $scope.orderService = OrderService
  $scope.verifyingStandardPrice = false

  $scope.$on('$ionicView.enter', function () {
    $scope.orderService.calculateValuesForSelectedProducts()
  })

  $ionicModal.fromTemplateUrl('templates/new_order/exceptions.html', {
    scope: $scope,
    animation: 'fade-in',
    hideDelay: true
  }).then(function(modal) {
    $scope.modal = modal
  })

  $scope.checkException = function (exception) {
    var functionToBeCalled = "validate" + exception
    OrderService[functionToBeCalled]()

    OrderService.clearRuleExceptionNote();
  }

  $scope.$on("drawer-opened", function () {
    $scope.opened = true
  })

  $scope.$on("drawer-closed", function () {
    $scope.opened = false
  })

  $scope.toggleEdition = function (id) {
    OrderService.toggleEdition(id)
    //$timeout(function(){
    //  $location.hash('product-' + id);
    //  $ionicScrollDelegate.anchorScroll();
    //}, 150)
  }

  $scope.removeItem = function (id) {
    OrderService.unselectProduct(id);
	$rootScope.$broadcast('update:DatepickerMinDate');
  }

  $scope.toggleFooter = function () {
    $scope.footerOpened = !$scope.footerOpened
  }

  $scope.openExceptions = function () {
    if (this.orderService.exceptions.length > 0) {
      this.previousRuleExceptionNote = OrderService.order.ruleExceptionNote
      this.modal.show()
    }
  }

  $scope.closeExceptions = function (undoReason) {
    if (undoReason) {
      OrderService.order.ruleExceptionNote = this.previousRuleExceptionNote
    }

    this.modal.hide()
  }

  $scope.saleOrBonus = function(productChanged, orderService){
    for(var i=0; i < orderService.selectedProducts.length; i++){
      if(orderService.selectedProducts[i].saleQtd != null){
        return 'sale';
      }

      if(orderService.selectedProducts[i].bonusQtd != null){
        return 'bonus';
      }
    }
  }

  $scope.verifyStandardPrice = function (product) {
    if ($scope.verifyingStandardPrice) { return }

    $scope.verifyingStandardPrice = !_.isNil(product.price) && product.price < product.standardPrice

    if ($scope.verifyingStandardPrice) {
      $ionicPopup.alert({
        title: 'Preço inválido',
        template: 'O preço líquido está abaixo do preço padrão.<br/>Revise os valores ou entre em contato com a Adm. Vendas.'
      }).then(function () {
        $scope.verifyingStandardPrice = false
        product.price = null
        product.discount = null

        $scope.orderService.calculateLiquidPrice(product)
      })
    }
  }

}])

cartaFabrilOrders.controller("OrderSummaryController", ["$scope", "$ionicModal", "$ionicPopup", "$state", "OrderService", "SalesforceService", function ($scope, $ionicModal, $ionicPopup, $state, OrderService, SalesforceService) {
  $scope.date = new Date()
  $scope.orderService = OrderService

  $scope.$on('$ionicView.enter', function () {
    $scope.orderService.calculateValuesForSelectedProducts()
  })

  $ionicModal.fromTemplateUrl('templates/new_order/exceptions.html', {
    scope: $scope,
    animation: 'fade-in',
    hideDelay: true
  }).then(function(modal) {
    $scope.modal = modal
  })

  $scope.sending = false

  $scope.saveOrder = function () {
    $scope.sending = true

    OrderService.sendOrder(false).then(function (res) {
      var orderId = _.get(res, 'records.0.Id');

      if (orderId) {
        SalesforceService.loadData(
          "SELECT OrderNumber FROM Order WHERE Id = '" + orderId + "'"
        ).then(function (orders) {
          $ionicPopup.alert({
            title: 'Pedido enviado',
            template: 'Pedido <b>' + orders[0].OrderNumber + '</b> enviado com sucesso.'
          }).then(function (res) {
            $scope.sending = false
            $state.go("client.orderHistory", { clientId: $state.params.clientId })
          })
        })
      } else {
        $scope.sending = false
        $ionicPopup.alert({
          title: 'Erro no envio',
          template: 'O pedido não foi enviado. Revise os dados e tente novamente.'
        })
      }

    }, function (err) {
      $scope.sending = false
      $ionicPopup.alert({
        title: 'Erro no envio',
        template: 'O pedido não foi enviado. Revise os dados e tente novamente.'
      })
    })
  }

  $scope.saveDraftOrder = function () {
    $scope.sending = true

    OrderService.sendOrder(true).then(function (res) {
      var orderId = _.get(res, 'records.0.Id');

      if (orderId) {
        SalesforceService.loadData(
          "SELECT OrderNumber FROM Order WHERE Id = '" + orderId + "'"
        ).then(function (orders) {
          $ionicPopup.alert({
            title: 'Rascunho salvo',
            template: 'Rascunho pedido <b>' + orders[0].OrderNumber + '</b> salvo com sucesso.'
          }).then(function (res) {
            $scope.sending = false
            $state.go("client.orderHistory", { clientId: $state.params.clientId })
          })
        })
      } else {
        $scope.sending = false
        $ionicPopup.alert({
          title: 'Erro ao salvar rascunho',
          template: 'O rascunho não foi salvo. Revise os dados e tente novamente.'
        })
      }
    }, function (err) {
      $scope.sending = false
      $ionicPopup.alert({
        title: 'Erro ao salvar rascunho',
        template: 'O rascunho não foi salvo. Revise os dados e tente novamente.'
      })
    })
  }

  function placeOrder(popupConfig, isDraft) {
    if ($scope.sending) { return }

    if (OrderService.canBeSaved()) {
      if (isDraft || OrderService.exceptionsAreJustified()) {
        $ionicPopup.confirm(popupConfig).then(function (confirmed) {
          if (confirmed) {

            //Caso dê erro no envio e tentar novamente, a lista vai ser separada por ; ao invês de Array
            if(OrderService.order.allCombos instanceof Array) {

              var valoresCombo = '';
              
              OrderService.order.allCombos.forEach(function (v, i) { 
                  
                  if(v.checked == true) {
                    if(valoresCombo === '')
                      valoresCombo = v.id;
                    else
                      valoresCombo += ';' + v.id;
                  }

              });

              OrderService.order.allCombos = valoresCombo;

            }

            isDraft ? $scope.saveDraftOrder() : $scope.saveOrder()
          }
        })
      } else if (!isDraft) {
        $scope.modal.show()
      }
    } else {
      var errorMessages = OrderService.fullErrorMessages()

      $ionicPopup.alert({
        title: 'Impossível enviar pedido',
        subTitle: 'Verifique os erros abaixo',
        template: '<ul><li>' + errorMessages.join("</li><li>") + '</li></ul>'
      })
    }
  }

  $scope.placeOrder = function () {
    placeOrder({
      title: 'Envio do pedido',
      template: 'Confirma envio do pedido?'
    })
  }

  $scope.placeDraftOrder = function () {
    placeOrder({
      title: 'Salvar rascunho',
      template: 'Deseja salvar o rascunho?'
    }, true)
  }

  $scope.closeExceptions = function (clearReason) {
    if (clearReason) {
      OrderService.order.ruleExceptionNote = ""
    }

    this.modal.hide()
  }
}])

cartaFabrilOrders.directive('focusMe', ['$timeout', function focusMeDirective ($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value) {
          $timeout(function(){
            element[0].focus();
            if(ionic.Platform.isAndroid()){
              _.invoke(cordova, 'plugins.Keyboard.show');
            }
            // scope.trigger = false;
          }, 150)
        }
      });
    }
  };
}])
