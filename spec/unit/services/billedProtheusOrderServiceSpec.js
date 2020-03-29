describe("BilledProtheusOrderService", function () {
  var BilledProtheusOrderService, SalesforceService, ProtheusOrder, $q

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _ProtheusOrder_, _SalesforceService_, _BilledProtheusOrderService_) {
    $q = _$q_
    ProtheusOrder = _ProtheusOrder_
    SalesforceService = _SalesforceService_
    BilledProtheusOrderService = _BilledProtheusOrderService_
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

    it("calls SalesforceSerive#loadData without clientId", function () {
      BilledProtheusOrderService.loadList()
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, numeroPedidoCliente__c, numeroPedidoProtheus__c, status__c, CreatedDate, dataEmissaoProtheus__c, valorTotalSemImpostos__c, valorSaldo__c, codigoCliente__c, loja__c, lojaCliente__c, razaoSocial__c, codigoTransportadora__c, tipoCliente__c, mensagemNotaFiscal__c, estado__c, codigoRede__c, rede__r.Name, tabelaRegional__r.Name, canal__c, condicaoPagamentoId__r.Name, percDescontoFinanceiro__c, tipoFrete__c, codigoVendedor__c, vendedor__r.Name, percComissao__c, codigoGerencia__c, supervisor__r.Name, observacaoPedido__c, tipoPedido__c, dataEntrega__c, percDescontoDuplicata__c, valorPedidoMinimo__c, quantidadeFaturada__c, quantidadePedida__c, valorTotalImpostos__c, mensagemPadrao__c, percContrato__c, conta__r.Name, conta__r.nomeFantasia__c, percentualBonus__c, tipoBloqueio__c, unidadeFaturamentoId__r.descricaoFilial__c, pedidoSalesforce__r.OrderNumber, pedidoSalesforce__r.id_protheus__c, pedidoSalesforce__r.Id, pedidoSalesforce__r.AccountId, pedidoSalesforce__r.CNPJ__c, pedidoSalesforce__r.nomeGerencia__c, pedidoSalesforce__r.necessitaAgendamento__c, pedidoSalesforce__r.aceitaEntregaParcial__c, pedidoSalesforce__r.valorDuplicataMinima__c, (SELECT quantidadeFaturada__c, quantidadePedida__c, dataEntrega__c, descricaoProduto__c, tes__c, codigoProduto__c, valorSaldo__c, valorTotal__c, valorTotalImpostos__c, novaUnidadeFaturamento__r.descricaoFilial__c, precoLiquido__c, itemPedido__r.idItemTabelaRegional__c FROM ItensCarteira__r ) FROM Carteira__c WHERE valorSaldo__c = 0 ORDER BY dataEmissaoProtheus__c desc, numeroPedidoProtheus__c desc LIMIT 11")
    })

    it("calls SalesforceSerive#loadData with the right params", function () {
      BilledProtheusOrderService.loadList(clientId)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, numeroPedidoCliente__c, numeroPedidoProtheus__c, status__c, CreatedDate, dataEmissaoProtheus__c, valorTotalSemImpostos__c, valorSaldo__c, codigoCliente__c, loja__c, lojaCliente__c, razaoSocial__c, codigoTransportadora__c, tipoCliente__c, mensagemNotaFiscal__c, estado__c, codigoRede__c, rede__r.Name, tabelaRegional__r.Name, canal__c, condicaoPagamentoId__r.Name, percDescontoFinanceiro__c, tipoFrete__c, codigoVendedor__c, vendedor__r.Name, percComissao__c, codigoGerencia__c, supervisor__r.Name, observacaoPedido__c, tipoPedido__c, dataEntrega__c, percDescontoDuplicata__c, valorPedidoMinimo__c, quantidadeFaturada__c, quantidadePedida__c, valorTotalImpostos__c, mensagemPadrao__c, percContrato__c, conta__r.Name, conta__r.nomeFantasia__c, percentualBonus__c, tipoBloqueio__c, unidadeFaturamentoId__r.descricaoFilial__c, pedidoSalesforce__r.OrderNumber, pedidoSalesforce__r.id_protheus__c, pedidoSalesforce__r.Id, pedidoSalesforce__r.AccountId, pedidoSalesforce__r.CNPJ__c, pedidoSalesforce__r.nomeGerencia__c, pedidoSalesforce__r.necessitaAgendamento__c, pedidoSalesforce__r.aceitaEntregaParcial__c, pedidoSalesforce__r.valorDuplicataMinima__c, (SELECT quantidadeFaturada__c, quantidadePedida__c, dataEntrega__c, descricaoProduto__c, tes__c, codigoProduto__c, valorSaldo__c, valorTotal__c, valorTotalImpostos__c, novaUnidadeFaturamento__r.descricaoFilial__c, precoLiquido__c, itemPedido__r.idItemTabelaRegional__c FROM ItensCarteira__r ) FROM Carteira__c WHERE valorSaldo__c = 0 AND conta__c = 'cid' ORDER BY dataEmissaoProtheus__c desc, numeroPedidoProtheus__c desc LIMIT 11")
    })

    it("calls $q#resolve with an array of ProtheusOrder", function () {
      var resolveSpy = spyOn($q, 'resolve')

      BilledProtheusOrderService.loadList(clientId)

      expect(resolveSpy).toHaveBeenCalledWith({ results : [
        new ProtheusOrder(attributes[0]),
        new ProtheusOrder(attributes[1]),
        new ProtheusOrder(attributes[2])
      ], isLastPage: true})
    })
  })
})
