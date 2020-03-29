describe("OrderService", function () {
  var SalesforceService, OrderService, $ionicPopup

  beforeEach(module("cartaFabril"))

  beforeEach(inject(function (_$q_, _SalesforceService_, _OrderService_, _$ionicPopup_) {
    $q                = _$q_
    SalesforceService = _SalesforceService_
    OrderService      = _OrderService_
    $ionicPopup       = _$ionicPopup_
  }))

  describe("#initialize(clientId, orderId)", function () {
    var clientId = "aWere999",
        orderId  = "999000",
        client   = { tipoFrete__c: "CIF" },
        products = [ { TabelaNacionalId__c: "999"} ],
        order    = {
          something: "aloha",
          tipoBloqueio__c: "foo;bar",
          condicaoPgto__c: "54321"
        },
        orderParams = { custoDescargaCartaFabril__c : 0.53 },
        paymentOptions = {
          default: { Id: "12345" },
          order:   { Id: "54321" }
        },
        regionalTables = { CIF : "foo" },
        ufDelays = [ { unidade__r: { Name: '02' }, delay__c: 5 } ]
        result = {
          orderData: {
            minOrderValue: 1000,
            minOrderValueFob: 100,
            minDuplValue: 1000,
            minDuplValueFob: 100,
            hasMinOrderSpecialCondition: true,
            defaultPaymentOption: paymentOptions.default.Id,
            client: client,
            products: products,
            orderParams : orderParams,
            regionalTables : regionalTables,
            ufDelays: ufDelays,
            paymentOptions: Object.values(paymentOptions)
          }
        }

    beforeEach(function () {
      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(result)
      })

      spyOn(SalesforceService, "loadOrderData").and.returnValue({ then: thenSpy })
      spyOn(OrderService, "mountOrder")
      spyOn(OrderService, "mountItems")
    })

    it("initializes exceptions messages", function () {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.exceptionsMessages).toEqual({
        paymentOption: { name: "Condição de pagamento", message: "Condição de pagamento não permitida" },
        finDiscount: { name: "Desconto financeiro", message: "Desconto financeiro acima do permitido" },
        deliveryDate: { name: "Data de entrega", message: "Data de entrega acima do permitido" },
        minOrderValue: { name: "Valor mínimo do pedido", message: "Valor do pedido abaixo do mínimo permitido" },
        minDuplValue: { name: "Valor de duplicata mínima", message: "Valor de duplicata abaixo do mínimo permitido" },
        itemDiscount: { name: "Itens com desconto acima do permitido", message: "Existem itens no pedido com desconto maior do que o permitido na tabela regional" },
        bonusOnly: { name: 'Pedido somente de bônus', message: 'Existem itens no pedido apenas com quantidade bonificada' }
      })
    })

    it("sets client with client from order service", function () {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.client).toEqual(result.orderData.client)
    })

    it("sets hasMinOrderConditions with hasMinOrderSpecialCondition from order data", function () {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.hasMinOrderConditions).toEqual(result.orderData.hasMinOrderSpecialCondition)
    })

    it("sets minimumOrderValues with an object that contains min order values", function () {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.minimumOrderValues).toEqual({ minValue: result.orderData.minOrderValue, minFobValue: result.orderData.minOrderValueFob })
    })

    it("sets hasMinDuplConditions with hasMinDuplSpecialCondition from order data", function () {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.hasMinDuplConditions).toEqual(result.orderData.hasMinDuplSpecialCondition)
    })

    it("sets minimumDuplValues with an object that contains min dupl values", function () {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.minimumDuplValues).toEqual({ minValue: result.orderData.minDuplValue, minFobValue: result.orderData.minDuplValueFob })
    })

    it("sets ufDelays with an object that contains delays by unit name", function () {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.ufDelays).toEqual({ '02': 5 })
    })

    it("sets default payment option as order payment option", function() {
      OrderService.initialize(clientId, orderId)
      expect(OrderService.order.paymentOption).toEqual(paymentOptions.default)
    })

    describe("when client shipping is 'FOB'", function () {
      beforeEach(function () {
        result.orderData.client.tipoFrete__c = "FOB"
      })

      it("sets minOrderValue with minOrderValueFob from order data", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.minOrderValue).toEqual(result.orderData.minOrderValueFob)
      })

      it("sets minDuplValue with minDuplValueFob from order data", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.minDuplValue).toEqual(result.orderData.minDuplValueFob)
      })

      it("sets itemDiscountField with 'percDescontoFob__c'", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.itemDiscountField).toEqual("percDescontoFob__c")
      })
    })

    describe("when the client shipping is other one", function () {
      beforeEach(function () {
        result.orderData.client.tipoFrete__c = "CIF"
      })

      it("sets minOrderValue with minOrderValue from order data", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.minOrderValue).toEqual(result.orderData.minOrderValue)
      })

      it("sets minDuplValue with minDuplValue from order data", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.minDuplValue).toEqual(result.orderData.minDuplValue)
      })

      it("maintains itemDiscountField with 'percDesconto__c'", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.itemDiscountField).toEqual("percDesconto__c")
      })
    })

    describe("when result data has an order", function () {
      beforeEach(function () {
        result.orderData.order = order
      })

      afterEach(function () {
        delete(result.orderData.order)
      })

      it("calls function to mount order", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.mountOrder).toHaveBeenCalledWith(result.orderData.order)
      })

      it("keeps payment option from order", function() {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.order.paymentOption).toEqual(paymentOptions.order)
      })
    })

    describe("when result does not have an order", function () {
      it("don't calls function to mount order", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.mountOrder).not.toHaveBeenCalled()
      })
    })

    describe("when result data has order items", function () {
      var items = [{ Id: "123321" }]

      beforeEach(function () {
        result.orderData.orderItems = items
      })

      afterEach(function () {
        delete(result.orderData.orderItems)
      })

      it("calls function to mount items", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.mountItems).toHaveBeenCalledWith(result.orderData.orderItems, 0, [], undefined)
      })
    })

    describe("when result does not have order items", function () {
      it("don't calls function to mount items", function () {
        OrderService.initialize(clientId, orderId)
        expect(OrderService.mountItems).not.toHaveBeenCalled()
      })
    })
  })

  describe("#mountOrder", function () {
    var order = {
      Id: "99999",
      percDescFinanceiro__c: 1,
      dataEntrega__c: "2016-10-10",
      mensagemNf__c: "Nf message",
      numeroPedidoCliente__c: "N123",
      numeroPedidoClienteBon__c: "BN123",
      obsPedido__c: "Order observation",
      tipoFrete__c: "CIF",
      expTransgressaoRegra__c: "Something",
      condicaoPgto__c: 999,
    }

    var paymentOptions = [
      { Id: 999, name: "Condition" }
    ]

    beforeEach(function () {
      OrderService.paymentOptions = paymentOptions
      OrderService.order = {}
    })

    it("sets order data to service", function () {
      OrderService.mountOrder(order)

      // expect(OrderService.order.finDiscount).toEqual(order.percDescFinanceiro__c)
      // expect(OrderService.order.shipping).toEqual(order.tipoFrete__c)
      // expect(OrderService.order.paymentOption).toEqual(paymentOptions[0])
      expect(OrderService.order.deliveryDate).toEqual(moment(order.dataEntrega__c, 'YYYY-MM-DD').toDate())
      expect(OrderService.order.nfMsg).toEqual(order.mensagemNf__c)
      expect(OrderService.order.customerOrderNumber).toEqual(order.numeroPedidoCliente__c)
      expect(OrderService.order.customerOrderBonification).toEqual(order.numeroPedidoClienteBon__c)
      expect(OrderService.order.observation).toEqual(order.obsPedido__c)
      expect(OrderService.order.ruleExceptionNote).toEqual(order.expTransgressaoRegra__c)
    })
  })

  describe("#mountShipping", function () {
    beforeEach(function () {
      OrderService.order = { shipping: null }
    })

    afterEach(function () {
      OrderService.order           = { shipping: null }
      OrderService.shippingOptions = []
    })

    describe("when client shipping is 'CIF'", function () {
      var clientShipping   = 'CIF',
          shippingSplitted = clientShipping.split(" / ")

      it("sets shipping options", function () {
        OrderService.mountShipping(clientShipping)

        expect(OrderService.shippingOptions).toEqual(shippingSplitted)
      })

      it("sets order shipping with the client shipping", function () {
        OrderService.mountShipping(clientShipping)

        expect(OrderService.order.shipping).toEqual(clientShipping)
      })
    })

    describe("when client shipping is 'FOB'", function () {
      var clientShipping   = 'FOB',
          shippingSplitted = clientShipping.split(" / ")

      it("sets shipping options", function () {
        OrderService.mountShipping(clientShipping)

        expect(OrderService.shippingOptions).toEqual(shippingSplitted)
      })

      it("sets order shipping with the client shipping", function () {
        OrderService.mountShipping(clientShipping)

        expect(OrderService.order.shipping).toEqual(clientShipping)
      })
    })

    describe("when client shipping is 'CIF / FOB'", function () {
      var clientShipping   = 'CIF / FOB',
          shippingSplitted = clientShipping.split(" / ")

      it("sets shipping options", function () {
        OrderService.mountShipping(clientShipping)

        expect(OrderService.shippingOptions).toEqual(shippingSplitted)
      })

      it("does not sets order shipping with the client shipping", function () {
        OrderService.mountShipping(clientShipping)

        expect(OrderService.order.shipping).not.toEqual(clientShipping)
      })
    })

    describe("when client shipping is undefined", function () {
      var clientShipping   = null

      it("do nothing", function () {
        OrderService.mountShipping(clientShipping)

        expect(OrderService.shippingOptions).toEqual(undefined)
      })
    })
  })

  describe("#minDeliveryDate", function () {
    beforeEach(function () {
      OrderService.ufDelays = { '02': 5, '03': 4, '11': 6, '14': 3 }
      OrderService.client = { codUnFatVigente__c: '03', codUnidadeFaturamento__c: '11' }
      OrderService.selectedProducts = []
      OrderService.holidays = []
    })

    describe("when selected products is empty", function () {
      it("returns the delay for the client current unit", function () {
        var result = momentBusiness.addWeekDays(moment(), 4).startOf('day')
        expect(OrderService.minDeliveryDate()).toEqual(result)
      })
    })

    describe("when selected products is not empty", function () {
      it("returns the maximum delay for the selected products", function () {
        // adds unit 03 product
        OrderService.selectedProducts.push({ codUnidadeFaturamento__c: '03' })
        var result = momentBusiness.addWeekDays(moment(), 4).startOf('day')
        expect(OrderService.minDeliveryDate()).toEqual(result)

        // adds unit 11 product
        OrderService.selectedProducts.push({ codUnidadeFaturamento__c: '11' })
        result = momentBusiness.addWeekDays(moment(), 6).startOf('day')
        expect(OrderService.minDeliveryDate()).toEqual(result)

        // adds unit 02 product
        OrderService.selectedProducts.push({ codUnidadeFaturamento__c: '02' })
        expect(OrderService.minDeliveryDate()).toEqual(result)

        // removes unit 11 product
        OrderService.selectedProducts.splice(1, 1)
        result = momentBusiness.addWeekDays(moment(), 5).startOf('day')
        expect(OrderService.minDeliveryDate()).toEqual(result)

        // removes all and adds unit 14
        OrderService.selectedProducts = [{ codUnidadeFaturamento__c: '14' }]
        result = momentBusiness.addWeekDays(moment(), 3).startOf('day')
        expect(OrderService.minDeliveryDate()).toEqual(result)
      })

      it("considers holidays in period", function () {
        OrderService.selectedProducts.push({ codUnidadeFaturamento__c: '03' })
        OrderService.holidays.push(momentBusiness.addWeekDays(moment(), 4).startOf('day'))
        var result = momentBusiness.addWeekDays(moment(), 5).startOf('day')
        expect(OrderService.minDeliveryDate()).toEqual(result)

        OrderService.holidays.push(momentBusiness.addWeekDays(moment(), 3).startOf('day'))
        var result = momentBusiness.addWeekDays(moment(), 6).startOf('day')
        expect(OrderService.minDeliveryDate()).toEqual(result)
      })
    })
  })

  describe("#selectProduct(id)", function () {
    var idToSelect = "123456",
        selectedProduct = { Id: idToSelect }

    beforeEach(function () {
      selectedProduct.selected = false
      OrderService.products         = [selectedProduct, { Id: "654321", selected: false }]
      OrderService.selectedProducts = []
    })

    it("sets true attribute on desired product", function () {
      OrderService.selectProduct(idToSelect)

      var product = _.find(OrderService.products, { Id: idToSelect })

      expect(product.selected).toBeTruthy()
    })

    it("copy desired product to selected products collection", function () {
      OrderService.selectProduct(idToSelect)

      expect(OrderService.selectedProducts).toContain(selectedProduct)
    })
  })

  describe("#unselectProduct(id)", function () {
    var idToRemove     = "123456",
        removedProduct = { Id: idToRemove }

    beforeEach(function () {
      removedProduct.selected = true
      OrderService.selectedProducts = [removedProduct]
      OrderService.products         = [removedProduct, { Id: "654321", selected: false }]
    })

    it("sets false attribute on desired product", function () {
      OrderService.unselectProduct(idToRemove)

      var product = _.find(OrderService.products, { Id: idToRemove })

      expect(product.selected).toBeFalsy()
    })

    it("removes desired product from selected products collection", function () {
      OrderService.unselectProduct(idToRemove)

      expect(OrderService.selectedProducts).not.toContain(removedProduct)
    })
  })

  describe("#toggleEdition(id)", function () {
    var idToSelect    = "123456",
        editing       = false,
        editedProduct = { Id: idToSelect, editing: editing }

    beforeEach(function () {
      OrderService.products = [editedProduct, { Id: "654321" }]
    })

    it("toggles editing attribute on product", function () {
      OrderService.toggleEdition(idToSelect)

      editedProduct = _.find(OrderService.products, { Id: idToSelect })

      expect(editedProduct.editing).toEqual(!editing)
    })
  })

  describe("#canBeSaved", function () {
    var order = {
      deliveryDate: moment(new Date()),
      shipping: "CIF",
      paymentOption: { Id: "999" }
    }

    var item1 = {
      descProdutoNf__c: "Item 1",
      CodigoProduto__c: "123456",
      saleQtd: 3,
      bonusQtd: 0,
      price: 15.0,
      selected: true
    }

    var item2 = {
      descProdutoNf__c: "Item 2",
      CodigoProduto__c: "999999",
      saleQtd: 5,
      bonusQtd: 0,
      price: 10.0,
      selected: true
    }

    var selectedProducts = [item1, item2]

    beforeEach(function () {
      OrderService.selectedProducts  = selectedProducts
      OrderService.order             = order
    })

    describe("when one of selected products have zero quantities", function () {
      beforeEach(function () {
        item1.saleQtd = 0
      })

      afterEach(function () {
        item1.saleQtd = 3
      })

      it("returns false", function () {
        expect(OrderService.canBeSaved()).toBeFalsy()
      })

      it("adds quantity error message to each product", function () {
        OrderService.canBeSaved()

        expect(OrderService.errors).toEqual(jasmine.objectContaining({
          products: jasmine.arrayContaining([
            jasmine.objectContaining({
              name: 'Item 1',
              code: '123456',
              quantity: 'não pode ser zero'
            })
          ])
        }))
      })
    })

    describe("when one of selected products have zero price", function () {
      beforeEach(function () {
        item2.price = 0
      })

      afterEach(function () {
        item2.price = 15.0
      })

      it("returns false", function () {
        expect(OrderService.canBeSaved()).toBeFalsy()
      })

      it("adds price error message to each product", function () {
        OrderService.canBeSaved()

        expect(OrderService.errors).toEqual(jasmine.objectContaining({
          products: jasmine.arrayContaining([
            jasmine.objectContaining({
              name: 'Item 2',
              code: '999999',
              price: 'não pode ser zero'
            })
          ])
        }))
      })
    })

    describe("when selected products have quantities", function () {
      describe("and all order attributes were filled", function () {
        it("returns true", function () {
          expect(OrderService.canBeSaved()).toBeTruthy()
        })

        it("doesn't add error message", function () {
          OrderService.canBeSaved()
          expect(OrderService.errors).toEqual({})
        })
      })

      describe("and delivery date is not filled", function () {
        beforeEach(function () {
          order.deliveryDate = null
        })

        afterEach(function () {
          order.deliveryDate = new Date()
        })

        it("returns false", function () {
          expect(OrderService.canBeSaved()).toBeFalsy()
        })

        it("adds error message", function () {
          OrderService.canBeSaved()
          expect(OrderService.errors).toEqual(jasmine.objectContaining({
            deliveryDate: 'está vazio'
          }))
        })
      })

      describe("and shipping is not filled", function () {
        beforeEach(function () {
          order.shipping = null
        })

        afterEach(function () {
          order.shipping = "CIF"
        })

        it("returns false", function () {
          expect(OrderService.canBeSaved()).toBeFalsy()
        })

        it("adds error message", function () {
          OrderService.canBeSaved()
          expect(OrderService.errors).toEqual(jasmine.objectContaining({
            shipping: 'está vazio'
          }))
        })
      })

      describe("and payment option is not filled", function () {
        beforeEach(function () {
          order.paymentOption = null
        })

        afterEach(function () {
          order.paymentOption = { Id: "999" }
        })

        it("returns false", function () {
          expect(OrderService.canBeSaved()).toBeFalsy()
        })

        it("adds error message", function () {
          OrderService.canBeSaved()
          expect(OrderService.errors).toEqual(jasmine.objectContaining({
            paymentOption: 'está vazio'
          }))
        })
      })
    })
  })

  describe("#fullErrorMessages", function () {
    beforeEach(function () {
      OrderService.errors = {}
    })

    afterEach(function () {
      delete OrderService.errors
    })

    function itBehavesLikeHasErrorIn(fieldName, humanName) {
      describe("when has " + fieldName + " error", function () {
        beforeEach(function () {
          OrderService.errors[fieldName] = 'não pode estar vazio'
        })

        it("includes " + fieldName + " error message", function () {
          expect(OrderService.fullErrorMessages()).toContain('Campo ' + humanName + ' não pode estar vazio')
        })
      })
    }

    itBehavesLikeHasErrorIn('deliveryDate', 'Data de entrega')
    itBehavesLikeHasErrorIn('shipping', 'Frete')
    itBehavesLikeHasErrorIn('paymentOption', 'Cond. pagamento')

    describe("when has error in a product", function () {
      beforeEach(function () {
        OrderService.errors.products = [{
          name: 'Item 1',
          code: '123456',
          quantity: 'não pode ser zero',
          price: 'não pode ser zero'
        }]
      })

      it("includes error message for products", function () {
        expect(OrderService.fullErrorMessages()).toContain('Quantidade do produto Item 1 123456 não pode ser zero')
        expect(OrderService.fullErrorMessages()).toContain('Preço do produto Item 1 123456 não pode ser zero')
      })
    })
  })

  describe("#validatePaymentOption", function () {
    var order = { paymentOption: { bloqueiaPedido__c: false } }

    beforeEach(function () {
      OrderService.exceptions = []
      OrderService.order = order
    })

    describe("when the configuration of selected payment option does not blocks the order", function () {
      beforeEach(function () {
        OrderService.exceptions.push("paymentOption")
      })

      afterEach(function () {
        _.pull(OrderService.exceptions, "paymentOption")
      })

      it("removes the exception to payment option", function () {
        OrderService.validatePaymentOption()
        expect(OrderService.exceptions).not.toContain("paymentOption")
      })
    })

    describe("when the configuration of selected payment option blocks the order", function () {
      beforeEach(function () {
        OrderService.order.paymentOption.bloqueiaPedido__c = true
      })

      it("adds an exception to payment option", function () {
        OrderService.validatePaymentOption()
        expect(OrderService.exceptions).toContain("paymentOption")
      })
    })
  })

  describe('#validateBonusOnly', function() {
    afterEach(function () {
      OrderService.exceptions = []
      OrderService.selectedProducts = []
    })

    describe('when order has sale quantity', function () {
      beforeEach(function () {
        OrderService.exceptions = ['bonusOnly']
        OrderService.selectedProducts = [{ saleQtd: 10, bonusQtd: 1 }]
      })

      it('removes the exception to bonus only', function () {
        OrderService.validateBonusOnly()
        expect(OrderService.exceptions).not.toContain('bonusOnly')
      })
    })

    describe('when order does not have sale quantity', function () {
      beforeEach(function () {
        OrderService.exceptions = []
        OrderService.selectedProducts = [{ saleQtd: 0, bonusQtd: 1 }]
      })

      it('adds an exception to bonus only', function () {
        OrderService.validateBonusOnly()
        expect(OrderService.exceptions).toContain('bonusOnly')
      })
    })
  })

  describe("#validateFinDiscount", function () {
    var order = { paymentOption: { maxDescFinanceiro__c: 2 } }

    beforeEach(function () {
      OrderService.exceptions = []
      OrderService.order = order
    })

    describe("when the fin discount is less than 'maxDescFinanceiro__c' of selected payment option", function () {
      beforeEach(function () {
        order.finDiscount = 1
        OrderService.exceptions.push("finDiscount")
      })

      afterEach(function () {
        _.pull(OrderService.exceptions, "finDiscount")
      })

      it("removes the exception to fin discount", function () {
        OrderService.validateFinDiscount()
        expect(OrderService.exceptions).not.toContain("finDiscount")
      })
    })

    describe("when the fin discount is greater than 'maxDescFinanceiro__c' of selected payment option", function () {
      beforeEach(function () {
        order.finDiscount = 3
      })

      it("adds an exception to fin discount", function () {
        OrderService.validateFinDiscount()
        expect(OrderService.exceptions).toContain("finDiscount")
      })
    })
  })

  describe("#validateDeliveryDate", function () {
    var order  = { deliveryDate: null },
        client = { diaMesEntrega__c: 15, mesEntregaSubsequente__c: 1 },
        now    = new Date()

    beforeEach(function () {
      jasmine.clock().install()
      OrderService.order = order
      OrderService.client = client
      OrderService.exceptions = []
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    describe("when delivery date is greater than next month's 15th day", function () {
      var deliveryDate = moment(now).add(1, "months").endOf("month")

      beforeEach(function () {
        order.deliveryDate = deliveryDate
      })

      it("adds an exception to delivery date", function () {
        jasmine.clock().mockDate(now)
        OrderService.validateDeliveryDate()
        expect(OrderService.exceptions).toContain("deliveryDate")
      })
    })

    describe("when delivery date is less than next month's 15th day", function () {
      var deliveryDate = moment(now).add(1, "months").startOf("month")

      beforeEach(function () {
        order.deliveryDate = deliveryDate
        OrderService.exceptions.push("deliveryDate")
      })

      afterEach(function () {
        _.pull(OrderService.exceptions, "deliveryDate")
      })

      it("removes exception to delivery date", function () {
        jasmine.clock().mockDate(now)
        OrderService.validateDeliveryDate()
        expect(OrderService.exceptions).not.toContain("deliveryDate")
      })
    })
  })

  describe("#buildOrderStatus", function () {
    describe("when the order has no exceptions", function () {
      beforeEach(function () {
        OrderService.exceptions = []
      })

      describe("and order quantity greater than 0", function () {
        beforeEach(function () {
          spyOn(OrderService, 'orderQuantity').and.returnValue(100)
        })

        it("sets 'Pronto' to orderStatus", function () {
          OrderService.buildOrderStatus()
          expect(OrderService.orderStatus).toEqual("Pronto")
        })
      })

      describe("and order quantity equals 0", function () {
        beforeEach(function () {
          spyOn(OrderService, 'orderQuantity').and.returnValue(0)
        })

        it("sets 'Pronto' to orderStatus", function () {
          OrderService.buildOrderStatus()
          expect(OrderService.orderStatus).toEqual("Pronto")
        })
      })
    })

    describe("when the order has any exception", function () {
      beforeEach(function () {
        OrderService.exceptions = ["itemDiscount"]
      })

      it("sets 'Pronto' to orderStatus", function () {
        OrderService.buildOrderStatus()
        expect(OrderService.orderStatus).toEqual("Pronto")
      })
    })

    describe("when the order already have a status", function () {
      var status = "Sbrubles"

      beforeEach(function () {
        OrderService.orderStatus = status
      })

      it("sets 'Pronto' to orderStatus", function () {
        OrderService.buildOrderStatus()
        expect(OrderService.orderStatus).toEqual("Pronto")
      })
    })

    describe("when the method param is true", function () {
      it("sets 'Rascunho' to orderStatus", function () {
        OrderService.buildOrderStatus(true)
        expect(OrderService.orderStatus).toEqual("Rascunho")
      })
    })
  })

  describe("#buildHeader", function () {
    var baseDate = new Date(),
        date     = baseDate,
        expectedDate = date.toISOString().split('T')[0],
        client = { Id: "123456789" },
        regionalTables = { CIF : "foo" }
        order  = {
          accountId: client.Id,
          pricebookId: "123",
          finDiscount: 10,
          paymentOption: { Id: "123", name: "someName" },
          deliveryDate: date,
          nfMsg: "Message",
          customerOrderNumber: "QA9999",
          customerOrderBonification: "BON999",
          observation: "No delivery at mornings",
          shipping: "CIF",
          ruleExceptionNote: "Something",
          deliveryFractions: true
        },
        orderQuantity = 10,
        bonusQuantity = 10,
        orderBonusTotalWithTax = 15,
        orderBonusTotal = 20,
        orderTotalWithTax = 40



    beforeEach(function () {
      jasmine.clock().install()

      OrderService.orderStatus    = "Rascunho"
      OrderService.client         = client
      OrderService.regionalTables = regionalTables
      OrderService.order          = order
      OrderService.exceptions     = []
      OrderService.minOrderValue  = 1000
      OrderService.minDuplValue   =  500

      spyOn(OrderService, "orderQuantity").and.returnValue(orderQuantity)
      spyOn(OrderService, "bonusQuantity").and.returnValue(bonusQuantity)
      spyOn(OrderService, "orderBonusTotalWithTax").and.returnValue(orderBonusTotalWithTax)
      spyOn(OrderService, "orderBonusTotal").and.returnValue(orderBonusTotal)
      spyOn(OrderService, "orderTotalWithTax").and.returnValue(orderTotalWithTax)
    })

    afterEach(function () {
      jasmine.clock().uninstall()
    })

    xit("builds order header", function () {
      jasmine.clock().mockDate(baseDate);

      var expectedBuild = {
        attributes: {
          type: "Order"
        },
        EffectiveDate: expectedDate,
        Status: OrderService.orderStatus,
        accountId: client.Id,
        PriceBook2Id: order.pricebookId,
        percDescFinanceiro__c: order.finDiscount,
        condicaoPgto__c: order.paymentOption.Id,
        dataEmissao__c: expectedDate,
        DataEnvio__c: expectedDate,
        dataEntrega__c: expectedDate,
        mensagemNf__c: order.nfMsg,
        numeroPedidoCliente__c: order.customerOrderNumber,
        numeroPedidoClienteBon__c: order.customerOrderBonification,
        obsPedido__c: order.observation,
        tipoFrete__c: order.shipping,
        tipoPedido__c: 'Normal',
        QuantidadeTotal__c: orderQuantity,
        QuantidadeTotalBonificada__c: bonusQuantity,
        tipoBloqueio__c: "",
        expTrangressaoRegra__c: order.ruleExceptionNote,
        valorPedidoMinimo__c: OrderService.minOrderValue,
        valorDuplicataMinima__c: OrderService.minDuplValue,
        valorTotalBonusImpostos__c : orderBonusTotalWithTax,
        valorTotalBonus__c : orderBonusTotal,
        valorTotalImpostos__c : orderTotalWithTax,
        aceitaEntregaParcial__c : order.deliveryFractions
      }

      expect(OrderService.buildHeader()).toEqual(expectedBuild)
    })
  })

  describe("#buildItems", function () {
    var client = { Id: "123456789" }
    var item1 = {
      name: "Item 1",
      ProductCode: "123456",
      PricebookentryId__c: "price123",
      saleQtd: "3",
      UnitPrice: "10",
      discountValue: "2",
      discountPercent: "1",
      liquidPrice: "8",
      bonusQtd: "0",
      bonusPerc: "0",
      selected: true,
      codUnidadeFaturamento__c: "02",
      percDesconto__c: 10,
      averageDiscount: 10,
      Id: "999999",
      invoiceValueWithTax:10,
      invoiceValue:9,
      averageDiscount:26.5,
      realValuePerItem:2.9
    }

    var item2 = {
      name: "Item 2",
      ProductCode: "999999",
      PricebookentryId__c: "price321",
      saleQtd: "5",
      discountValue: "0",
      discountPercent: "0",
      liquidPrice: "4",
      bonusQtd: "0",
      bonusPerc: "0",
      selected: true,
      codUnidadeFaturamento__c: "02",
      percDesconto__c: 5,
      averageDiscount: 5,
      Id: "888888",
      invoiceValueWithTax:10,
      invoiceValue:9,
      averageDiscount:26.5,
      realValuePerItem:2.9
    }

    var selectedProducts = [item1, item2]

    beforeEach(function () {
      OrderService.client = client
      OrderService.selectedProducts  = selectedProducts
    })

    xit("buils order items", function () {
      var expectedBuild = [
        {
          attributes: {
            type: "OrderItem"
          },
          PricebookEntryId: item1.PricebookentryId__c,
          Quantity: item1.saleQtd + item1.bonusQtd,
          qtdVenda__c: item1.saleQtd,
          valorDesconto__c: item1.discountValue,
          percDesconto__c: item1.discountPercent,
          UnitPrice: item1.liquidPrice,
          qtdBonificada__c: item1.bonusQtd,
          percBonificado__c: item1.bonusPerc,
          filial__c: item1.codUnidadeFaturamento__c,
          percDescontoNf__c: item1.discountPercent,
          percPoliticaCliente__c: item1.percDesconto__c,
          percDescontoTotal__c: item1.averageDiscount,
          idItemTabelaRegional__c: item1.Id,
          valorTotalComImpostos__c : item1.invoiceValueWithTax,
          valorTotalSemImpostos__c: item1.invoiceValue,
          descontoMedio__c: item1.averageDiscount,
          valorTotalItemSemImposto__c: item1.realValuePerItem
        },
        {
          attributes: {
            type: "OrderItem"
          },
          PricebookEntryId: item2.PricebookentryId__c,
          Quantity: item2.saleQtd + item2.bonusQtd,
          qtdVenda__c: item2.saleQtd,
          valorDesconto__c: item2.discountValue,
          percDesconto__c: item2.discountPercent,
          UnitPrice: item2.liquidPrice,
          qtdBonificada__c: item2.bonusQtd,
          percBonificado__c: item2.bonusPerc,
          filial__c: item2.codUnidadeFaturamento__c,
          percDescontoNf__c: item2.discountPercent,
          percPoliticaCliente__c: item2.percDesconto__c,
          percDescontoTotal__c: item2.averageDiscount,
          idItemTabelaRegional__c: item2.Id,
          valorTotalComImpostos__c : item2.invoiceValueWithTax,
          valorTotalSemImpostos__c: item2.invoiceValue,
          descontoMedio__c: item2.averageDiscount,
          valorTotalItemSemImposto__c: item2.realValuePerItem
        }
      ]

      expect(OrderService.buildItems()).toEqual(expectedBuild)
    })
  })

  describe("#buildBody", function () {
    var header = { attributes: { type: "Order" }, EffectiveDate: "Some Date", Status: "Some status" },
        items  = [ { attributes: { type: "OrderItem" }, name: "Some Item", ProductCode: "123456"} ]

    beforeEach(function () {
      spyOn(OrderService, "buildHeader").and.returnValue(header)
      spyOn(OrderService, "buildItems").and.returnValue(items)
    })

    it("calls buildHeader to build the header", function () {
      OrderService.buildBody()
      expect(OrderService.buildHeader).toHaveBeenCalled()
    })

    it("calls buildItems to build the items", function () {
      OrderService.buildBody()
      expect(OrderService.buildItems).toHaveBeenCalled()
    })

    it("builds the body", function () {
      var expectedBuild = { order: [header] }
      expectedBuild.order[0].OrderItems = { records: items }

      expect(OrderService.buildBody()).toEqual(expectedBuild)
    })
  })

  describe("#saveOrder", function () {
    var body = { order: [ { something: 123 } ] }

    beforeEach(function () {
      spyOn(OrderService, "buildOrderStatus")
      spyOn(OrderService, "buildBody").and.returnValue(body)
      spyOn(SalesforceService, "placeOrder")
    })

    it("sets order status to ready", function () {
      OrderService.saveOrder()
      expect(OrderService.orderStatus).toEqual("Pronto")
    })

    it("calls buildBody to build body", function () {
      OrderService.saveOrder()
      expect(OrderService.buildBody).toHaveBeenCalled()
    })

    it("calls SalesforceService.placeOrder to save order at Salesforce", function () {
      OrderService.saveOrder()
      expect(SalesforceService.placeOrder).toHaveBeenCalledWith(body)
    })
  })

  describe("#saveDraftOrder", function () {
    var body = { order: [ { something: 123 } ] }

    beforeEach(function () {
      spyOn(OrderService, "buildBody").and.returnValue(body)
      spyOn(SalesforceService, "placeOrder")
    })

    it("sets orderStatus to 'Rascunho'", function () {
      OrderService.saveDraftOrder()
      expect(OrderService.orderStatus).toEqual("Rascunho")
    })

    it("calls buildBody to build body", function () {
      OrderService.saveDraftOrder()
      expect(OrderService.buildBody).toHaveBeenCalled()
    })

    it("calls SalesforceService.placeOrder to save order at Salesforce", function () {
      OrderService.saveDraftOrder()
      expect(SalesforceService.placeOrder).toHaveBeenCalledWith(body)
    })
  })

  describe("#nullifyFields", function () {
    describe("when the fields to be nulled aren't null", function () {
      var product,
          fieldsToBeNulled = [
            'saleQtd',
            'price',
            'discount',
            'bonusQtd'
          ]

      beforeEach(function () {
        product = {}

        _.each(fieldsToBeNulled, function (field) {
          product[field] = 0
        })
      })

      it("calls _#each on the right fields", function () {
        spyOn(_, 'each')
        OrderService.nullifyFields(product)
        expect(_.each).toHaveBeenCalledWith(fieldsToBeNulled, jasmine.any(Function))
      })

      it("nullify the fields", function () {
        _.each(fieldsToBeNulled, function (field) {
          expect(OrderService.nullifyFields(product)[field]).toBeNull()
        })
      })
    })
  })

  describe("#updateOrder", function () {
    var header  = { Status: "Something" },
        items   = [{ foo: "123" }, { foo: "321" }],
        body    = { order: header, items: items }
        orderId = "999"

    beforeEach(function () {
      OrderService.orderId = orderId
      spyOn(OrderService, "buildHeader").and.returnValue(header)
      spyOn(OrderService, "buildOrderStatus")
      spyOn(OrderService, "buildItems").and.returnValue(items)
      spyOn(SalesforceService, "updateOrder")
    })

    it("builds the header", function () {
      OrderService.updateOrder()
      expect(OrderService.buildHeader).toHaveBeenCalled()
    })

    it("sets the order id on header", function () {
      OrderService.updateOrder()
      expect(header.Id).toEqual(orderId)
    })

    it("builds the ready status", function () {
      OrderService.updateOrder(false)
      expect(OrderService.orderStatus).toEqual('Pronto')
    })

    it("builds the draft status", function () {
      OrderService.updateOrder(true)
      expect(OrderService.orderStatus).toEqual('Rascunho')
    })

    it("builds the items", function () {
      OrderService.updateOrder()
      expect(OrderService.buildItems).toHaveBeenCalled()
    })

    it("calls SalesforceService.updateOrder to update the order", function () {
      OrderService.updateOrder()
      expect(SalesforceService.updateOrder).toHaveBeenCalledWith(body)
    })
  })

  describe("#sendOrder", function () {
    beforeEach(function () {
      spyOn(OrderService, "updateOrder")
      spyOn(OrderService, "saveDraftOrder")
      spyOn(OrderService, "saveOrder")
    })

    describe("when the service has order id", function () {
      beforeEach(function () {
        OrderService.orderId = "123"
      })

      afterEach(function () {
        OrderService.orderId = null
      })

      it("updates the order", function () {
        OrderService.sendOrder(true)
        expect(OrderService.updateOrder).toHaveBeenCalled()
      })
    })

    describe("when the service has no order id", function () {
      describe("and the draft param is true", function () {
        var draft = true

        it("saves the order as a draft", function () {
          OrderService.sendOrder(draft)
          expect(OrderService.saveDraftOrder).toHaveBeenCalled()
          expect(OrderService.saveOrder).not.toHaveBeenCalled()
        })
      })

      describe("and the draft param is false", function () {
        var draft = false

        it("saves the order", function () {
          OrderService.sendOrder(draft)
          expect(OrderService.saveOrder).toHaveBeenCalled()
          expect(OrderService.saveDraftOrder).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe("#calculateDiscount(product)", function () {
    var product  = { price: 35, precoLista__c: 40 },
        expected = round(100 * (1 - (product.price / product.precoLista__c)))

    beforeEach(function () {
      spyOn(OrderService, "calculateLiquidPrice")
    })

    it("calculates discount", function () {
      OrderService.calculateDiscount(product)
      expect(product.discount).toEqual(expected)
    })

    it("calls function to calculate liquid price passing product as a param", function () {
      OrderService.calculateDiscount(product)
      expect(OrderService.calculateLiquidPrice).toHaveBeenCalledWith(product)
    })

    describe("when price is equal or higher than precoLista__c", function() {
      var product = { price: 50, precoLista__c: 40 },
          expected = round(100 * (1 - (product.price / product.precoLista__c)))

      describe("popup confirmation", function() {
        beforeEach(function() {
          spyOn($ionicPopup, 'confirm').and.returnValue({then: function(callback) { callback(true) }})
        })

        it("calculates discount", function() {
          OrderService.calculateDiscount(product)
          expect(product.discount).toEqual(expected)
        })
      })

      describe("popup cancelation", function() {
        beforeEach(function() {
          spyOn($ionicPopup, 'confirm').and.returnValue({then: function(callback) { callback(false) }})
        })

        it("sets product.price equals product.precoLista__c", function() {
          OrderService.calculateDiscount(product)
          expect(product.price).toEqual(product.precoLista__c)
        })
      })
    })
  })

  describe("#calculatePrice(product)", function () {
    var product  = { discount: 10, precoLista__c: 40 },
        expected = +(product.precoLista__c * (1 - (product.discount / 100))).toFixed(2)

    beforeEach(function () {
      spyOn(OrderService, "calculateLiquidPrice")
    })

    it("calculates price", function () {
      OrderService.calculatePrice(product)
      expect(product.price).toEqual(expected)
    })

    it("calls function to calculate liquid price passing product as a param", function () {
      OrderService.calculateDiscount(product)
      expect(OrderService.calculateLiquidPrice).toHaveBeenCalledWith(product)
    })

    it("maintains discount as 100 if its higher", function() {
      product.discount = 105
      OrderService.calculatePrice(product)
      expect(product.discount).toEqual(100)
    });

    it("maintains discount as 0 if its lesser", function() {
      product.discount = -10
      OrderService.calculatePrice(product)
      expect(product.discount).toEqual(0)
    });
  })

  describe("#calculateTax(product)", function () {
    var product       = { liquidPrice: 10, saleQtd: 10, aliquotaImposto__c: 10 },
        expectedTotal = ((product.liquidPrice * product.saleQtd) * (product.aliquotaImposto__c / 100)) + (product.liquidPrice * product.saleQtd)

    it("sets the total with taxes on product", function () {
      OrderService.calculateTax(product)
      expect(product.saleTotalWithTax).toEqual(expectedTotal)
    })
  })


  describe("#calculateLiquidPrice(product)", function () {
    var order   = {},
        product = { precoLista__c: 40, price: 30 }

    beforeEach(function () {
      OrderService.order = order

      spyOn(OrderService, "calculateAverageDiscounts")
    })

    describe("when the financial discount is greater than 0", function () {
      beforeEach(function () {
        order.finDiscount = 1
      })

      afterEach(function () {
        delete order.finDiscount
      })

      it("calculates liquid price", function () {
        var discount = 100 * (1 - (product.price / product.precoLista__c))

        expected = +Number(discount ?
          ((100 - discount) * (100 - (order.finDiscount || 0)) * product.precoLista__c) / 10000 :
          (100 - (order.finDiscount || 0)) * product.precoLista__c / 100
        ).toFixed(2)

        OrderService.calculateLiquidPrice(product)
        expect(product.liquidPrice).toEqual(expected)
      })
    })

    describe("when the financial discount is 0", function () {
      beforeEach(function () {
        order.finDiscount = 0
      })

      afterEach(function () {
        delete order.finDiscount
      })

      it("calculates liquid price", function () {
        var expected = +Number(product.price).toFixed(2)

        OrderService.calculateLiquidPrice(product)
        expect(product.liquidPrice).toEqual(expected)
      })
    })

    it("calls function to calculate average discounts", function () {
      OrderService.calculateLiquidPrice(product)
      expect(OrderService.calculateAverageDiscounts).toHaveBeenCalled()
    })
  })

  describe("#calculateBonusDiscount(product)", function () {
    var product = { bonusQtd: 5 }

    beforeEach(function () {
      spyOn(OrderService, "calculateLiquidPrice")
    })

    describe("when the product has saleQtd", function () {
      beforeEach(function () {
        product.saleQtd = 20
      })

      afterEach(function () {
        delete product.saleQtd
      })

      it("calculates bonus discount", function () {
        var expected = Math.round(100 * (product.bonusQtd / product.saleQtd))

        OrderService.calculateBonusDiscount(product)
        expect(product.bonusPerc).toEqual(expected)
      })
    })

    describe("when the product has no saleQtd", function () {
      it("calculates bonus discount", function () {
        var expected = 100

        OrderService.calculateBonusDiscount(product)
        expect(product.bonusPerc).toEqual(expected)
      })
    })

    it("calls function to calculate average discounts", function () {
      OrderService.calculateBonusDiscount(product)
      expect(OrderService.calculateLiquidPrice).toHaveBeenCalled()
    })
  })

  describe("#calculateAverageDiscounts()", function () {
    var products = [ { saleQtd: 1 }, { saleQtd: 2 } ]

    beforeEach(function () {
      OrderService.selectedProducts = products

      spyOn(OrderService, "calculateAverageDiscount")
    })

    it("calls function to calculate average discount on each selected product", function () {
      OrderService.calculateAverageDiscounts()

      _.each(OrderService.selectedProducts, function (product, index, list) {
        expect(OrderService.calculateAverageDiscount).toHaveBeenCalledWith(product, index, list)
      })
    })
  })

})
