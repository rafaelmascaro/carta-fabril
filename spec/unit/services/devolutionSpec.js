describe("DevolutionService", function () {
  var $q,
      Devolution,
      DevolutionService,
      SalesforceService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _SalesforceService_, _Devolution_, _DevolutionService_) {
    $q                = _$q_
    Devolution        = _Devolution_
    DevolutionService = _DevolutionService_
    SalesforceService = _SalesforceService_
  }))

  it("is the number of visit registrations to get per call", function () {
    expect(DevolutionService.pageSize).toEqual(10)
  })

  describe('#objectName', function () {
    it("is the salesforce's object name", function () {
      expect(DevolutionService.objectName).toEqual('Devolucoes__c')
    })
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

    xit("calls SalesforceSerive#loadData with the right params", function () {
      DevolutionService.loadList(clientId)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Name, NotadeOrigem__c, NotadeDevolucao__c, valorDevolucao__c, emissaoNotaOrigem__c, emissaoNotaDevolucao__c, Tipo_de_Devolucao__c, motivoDevolucao__c, nomeCliente__c, SerieNFOrigem__c, numeroPedidoOriginal__c, numeroPedidoProtheus__c, ItensDeNotaFiscal__r.codProduto__c, ItensDeNotaFiscal__r.nomeProduto__c, ItensDeNotaFiscal__r.quantidade__c, ItensDeNotaFiscal__r.valorUnitario__c, ItensDeNotaFiscal__r.valorTotalcomImposto__c, ItensDeNotaFiscal__r.valorTotalSemImposto__c, NotaFiscal__r.carteira__r.tipoPedido__c FROM Devolucoes__c WHERE clienteId__c='" + clientId + "' ORDER BY emissaoNotaDevolucao__c desc LIMIT 11")
    })

    it("calls $q#resolve with an object with an array of Devolutions and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      DevolutionService.loadList(clientId)

      expect(resolveSpy).toHaveBeenCalledWith({ results : [
        new Devolution(attributes[0]),
        new Devolution(attributes[1]),
        new Devolution(attributes[2])
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

    xit("for the page 1 calls SalesforceSerive#loadData with the right params", function () {

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(0, 11))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      DevolutionService.loadPage(clientId, 1)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Name, NotadeOrigem__c, NotadeDevolucao__c, valorDevolucao__c, emissaoNotaOrigem__c, emissaoNotaDevolucao__c, Tipo_de_Devolucao__c, motivoDevolucao__c, nomeCliente__c, SerieNFOrigem__c, numeroPedidoOriginal__c, numeroPedidoProtheus__c, ItensDeNotaFiscal__r.codProduto__c, ItensDeNotaFiscal__r.nomeProduto__c, ItensDeNotaFiscal__r.quantidade__c, ItensDeNotaFiscal__r.valorUnitario__c, ItensDeNotaFiscal__r.valorTotalcomImposto__c, ItensDeNotaFiscal__r.valorTotalSemImposto__c, NotaFiscal__r.carteira__r.tipoPedido__c FROM Devolucoes__c WHERE clienteId__c='" + clientId + "' ORDER BY emissaoNotaDevolucao__c desc LIMIT 11 OFFSET 0")
    })

    xit("for the page 2 calls SalesforceSerive#loadData with the right params", function () {

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(19, 21))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      DevolutionService.loadPage(clientId, 2)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Name, NotadeOrigem__c, NotadeDevolucao__c, valorDevolucao__c, emissaoNotaOrigem__c, emissaoNotaDevolucao__c, Tipo_de_Devolucao__c, motivoDevolucao__c, nomeCliente__c, SerieNFOrigem__c, numeroPedidoOriginal__c, numeroPedidoProtheus__c, ItensDeNotaFiscal__r.codProduto__c, ItensDeNotaFiscal__r.nomeProduto__c, ItensDeNotaFiscal__r.quantidade__c, ItensDeNotaFiscal__r.valorUnitario__c, ItensDeNotaFiscal__r.valorTotalcomImposto__c, ItensDeNotaFiscal__r.valorTotalSemImposto__c, NotaFiscal__r.carteira__r.tipoPedido__c FROM Devolucoes__c WHERE clienteId__c='" + clientId + "' ORDER BY emissaoNotaDevolucao__c desc LIMIT 11 OFFSET 10")
    })

    it("for the page 1 calls $q#resolve with an object with an array of Devolutions and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(0, 11))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      DevolutionService.loadPage(clientId, 1)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          new Devolution(attributes[0]),
          new Devolution(attributes[1]),
          new Devolution(attributes[2]),
          new Devolution(attributes[3]),
          new Devolution(attributes[4]),
          new Devolution(attributes[5]),
          new Devolution(attributes[6]),
          new Devolution(attributes[7]),
          new Devolution(attributes[8]),
          new Devolution(attributes[9])
        ],
        isLastPage: false
      })
    })

    it("for the page 3 calls $q#resolve with an object with an array of Devolutions and a flag indicating if it is the last page", function () {
      var resolveSpy = spyOn($q, 'resolve')

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes.slice(20, 21))
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })

      DevolutionService.loadPage(clientId, 3)

      expect(resolveSpy).toHaveBeenCalledWith({
        results : [
          new Devolution(attributes[20])
        ],
        isLastPage: true
      })
    })

  })

})
