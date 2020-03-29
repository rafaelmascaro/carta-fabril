describe("InvoiceService", function () {
  var $q, Invoice, InvoiceService, SalesforceService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _Invoice_, _SalesforceService_, _InvoiceService_) {
    $q = _$q_
    Invoice = _Invoice_
    InvoiceService = _InvoiceService_
    SalesforceService = _SalesforceService_
  }))

  it("is the number of visit registrations to get per call", function () {
    expect(InvoiceService.pageSize).toEqual(10)
  })

  it("#objectName has the right value", function () {
    expect(InvoiceService.objectName).toEqual('notaFiscal__c')
  })

  describe("#loadList", function () {
    var clientId = 'cid',
        attributes

    beforeEach(function () {
      attributes = [
        { id: 'id1' },
        { id: 'id2' },
        { id: 'id3' }
      ]

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes)
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })
    })

    xit("calls SalesforceService#loadData with the right params", function () {
      InvoiceService.loadList(clientId)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Name, notaFiscal__c, serieNota__c, dataEmissaoNF__c, valorTotalComImposto__c, valorTotalSemImposto__c, dataEntrega__c, filial__c, condicaoPagamento__c, numeroPedidoOriginal__c, numeroPedidoProtheus__c, carteira__r.tipoPedido__c, (SELECT codProduto__c, quantidade__c, nomeProduto__c, valorUnitario__c, valorTotalSemImposto__c, valorTotalComImposto__c FROM ItensdeNotaFiscal__r ) FROM notaFiscal__c WHERE clienteId__c='" + clientId + "' ORDER BY dataEmissaoNF__c desc LIMIT 11")
    })

    it("calls $q#resolve with an object with an array of Invoices and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      InvoiceService.loadList(clientId)

      expect(resolveSpy).toHaveBeenCalledWith({ results : [
        new Invoice(attributes[0]),
        new Invoice(attributes[1]),
        new Invoice(attributes[2])
      ], isLastPage: true})
    })
  })

  describe("#loadPage", function () {
    var clientId = 'cid',
        attributes

    beforeEach(function () {
      attributes = [
        { id: 'id01' },
        { id: 'id02' },
        { id: 'id03' },
        { id: 'id04' },
        { id: 'id05' },
        { id: 'id06' },
        { id: 'id07' },
        { id: 'id08' },
        { id: 'id09' },
        { id: 'id10' },
        { id: 'id11' },
        { id: 'id12' },
        { id: 'id13' },
        { id: 'id14' },
        { id: 'id15' },
        { id: 'id16' },
        { id: 'id17' },
        { id: 'id18' },
        { id: 'id19' },
        { id: 'id20' },
        { id: 'id21' }
      ]

    })

    xit("for the page 1 calls SalesforceService#loadData with the right params", function () {

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(0, 11))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      InvoiceService.loadPage(clientId, 1)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Name, notaFiscal__c, serieNota__c, dataEmissaoNF__c, valorTotalComImposto__c, valorTotalSemImposto__c, dataEntrega__c, filial__c, condicaoPagamento__c, numeroPedidoOriginal__c, numeroPedidoProtheus__c, carteira__r.tipoPedido__c, (SELECT codProduto__c, quantidade__c, nomeProduto__c, valorUnitario__c, valorTotalSemImposto__c, valorTotalComImposto__c FROM ItensdeNotaFiscal__r ) FROM notaFiscal__c WHERE clienteId__c='" + clientId + "' ORDER BY dataEmissaoNF__c desc LIMIT 11 OFFSET 0")
    })

    xit("for the page 2 calls SalesforceSerive#loadData with the right params", function () {

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(19, 21))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      InvoiceService.loadPage(clientId, 2)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Name, notaFiscal__c, serieNota__c, dataEmissaoNF__c, valorTotalComImposto__c, valorTotalSemImposto__c, dataEntrega__c, filial__c, condicaoPagamento__c, numeroPedidoOriginal__c, numeroPedidoProtheus__c, carteira__r.tipoPedido__c, (SELECT codProduto__c, quantidade__c, nomeProduto__c, valorUnitario__c, valorTotalSemImposto__c, valorTotalComImposto__c FROM ItensdeNotaFiscal__r ) FROM notaFiscal__c WHERE clienteId__c='" + clientId + "' ORDER BY dataEmissaoNF__c desc LIMIT 11 OFFSET 10")
    })

    it("for the page 1 calls $q#resolve with an object with an array of Invoices and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(0, 11))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      InvoiceService.loadPage(clientId, 1)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          new Invoice(attributes[0]),
          new Invoice(attributes[1]),
          new Invoice(attributes[2]),
          new Invoice(attributes[3]),
          new Invoice(attributes[4]),
          new Invoice(attributes[5]),
          new Invoice(attributes[6]),
          new Invoice(attributes[7]),
          new Invoice(attributes[8]),
          new Invoice(attributes[9])
        ],
        isLastPage: false
      })
    })

    it("for the page 3 calls $q#resolve with an object with an array of Invoices and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(20, 21))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      InvoiceService.loadPage(clientId, 3)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          new Invoice(attributes[20])
        ],
        isLastPage: true
      })
    })

  })

})
