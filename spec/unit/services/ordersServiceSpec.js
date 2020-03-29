describe("OrdersService", function () {
  var OrdersService, SalesforceService, Order, $q

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _Order_, _SalesforceService_, _OrdersService_) {
    $q = _$q_
    Order = _Order_
    SalesforceService = _SalesforceService_
    OrdersService = _OrdersService_
  }))

  describe("#loadList", function () {
    var clientId = 'cid',
        attributes

    beforeEach(function () {
      attributes = [
        { Id: 'id1' },
        { Id: 'id2' },
        { Id: 'id3' }
      ]

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes)
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })
    })

    it("calls SalesforceService#loadData without clientId", function () {
      OrdersService.loadList()
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, AccountId, Account.Name, Account.nomeFantasia__c, OrderNumber, valorTotalSemImpostos__c, QuantidadeTotal__c, QuantidadeTotalBonificada__c, CreatedDate, Status, valorTotalBonusImpostos__c, valorTotalBonus__c, valorTotalImpostos__c, percBonus__c, Cod_Cliente__c, loja__c, Loja_do_Cliente__c, razaoSocial__c, NomeFantasia__c, tipoCliente__c, mensagemNf__c, CNPJ__c, Estado__c , codigoRede__c, Rede__c, canalCliente__c, condicaoPgto__r.Name, percDescFinanceiro__c, tipoFrete__c, codigoVendedor__c, Vendedor_Representante__c, codGerenciaVendas__c, nomeGerencia__c, supervisorVendas__c, dataEmissao__c, obsPedido__c, numeroPedidoCliente__c, numeroPedidoClienteBon__c, expTransgressaoRegra__c, percTotalContrato__c, custoDescargaFD__c, diferencaDescarga__c, custoDescargaPallet__c, percOutrosCustosLogisticos__c, numeroAjudantes__c, tipoBloqueio__c, custoAjudante__c, aceitaEntregaParcial__c, valorPedidoMinimo__c, valorDuplicataMinima__c, motivoRejeicao__c, dataEntrega__c, id_protheus__c, (SELECT PricebookEntry.Product2.Name, UnitPrice, Quantity, descricaoProduto__c, PricebookEntry.Product2.ProductCode, valorTotalBonus__c, valorTotalBonusImpostos__c, ListPrice, percDesconto__c, qtdVenda__c, qtdBonificada__c, percBonificado__c, percPoliticaCliente__c, valorDesconto__c, descontoMedio__c, percDescontoNf__c, valorTotalItemSemImposto__c, valorTotalSemImpostos__c, valorTotalComImpostos__c FROM OrderItems ) FROM Order WHERE Status != 'Liberado' ORDER BY CreatedDate desc, OrderNumber desc LIMIT 11")
    })

    it("calls SalesforceService#loadData with the right params", function () {
      OrdersService.loadList(clientId)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, AccountId, Account.Name, Account.nomeFantasia__c, OrderNumber, valorTotalSemImpostos__c, QuantidadeTotal__c, QuantidadeTotalBonificada__c, CreatedDate, Status, valorTotalBonusImpostos__c, valorTotalBonus__c, valorTotalImpostos__c, percBonus__c, Cod_Cliente__c, loja__c, Loja_do_Cliente__c, razaoSocial__c, NomeFantasia__c, tipoCliente__c, mensagemNf__c, CNPJ__c, Estado__c , codigoRede__c, Rede__c, canalCliente__c, condicaoPgto__r.Name, percDescFinanceiro__c, tipoFrete__c, codigoVendedor__c, Vendedor_Representante__c, codGerenciaVendas__c, nomeGerencia__c, supervisorVendas__c, dataEmissao__c, obsPedido__c, numeroPedidoCliente__c, numeroPedidoClienteBon__c, expTransgressaoRegra__c, percTotalContrato__c, custoDescargaFD__c, diferencaDescarga__c, custoDescargaPallet__c, percOutrosCustosLogisticos__c, numeroAjudantes__c, tipoBloqueio__c, custoAjudante__c, aceitaEntregaParcial__c, valorPedidoMinimo__c, valorDuplicataMinima__c, motivoRejeicao__c, dataEntrega__c, id_protheus__c, (SELECT PricebookEntry.Product2.Name, UnitPrice, Quantity, descricaoProduto__c, PricebookEntry.Product2.ProductCode, valorTotalBonus__c, valorTotalBonusImpostos__c, ListPrice, percDesconto__c, qtdVenda__c, qtdBonificada__c, percBonificado__c, percPoliticaCliente__c, valorDesconto__c, descontoMedio__c, percDescontoNf__c, valorTotalItemSemImposto__c, valorTotalSemImpostos__c, valorTotalComImpostos__c FROM OrderItems ) FROM Order WHERE Status != 'Liberado' AND AccountId = 'cid' ORDER BY CreatedDate desc, OrderNumber desc LIMIT 11")
    })

    it("calls $q#resolve with an array of Orders", function () {
      var resolveSpy = spyOn($q, 'resolve')

      OrdersService.loadList(clientId)

      expect(resolveSpy).toHaveBeenCalledWith({ results : [
        new Order(attributes[0]),
        new Order(attributes[1]),
        new Order(attributes[2])
      ], isLastPage: true})
    })
  })
})
