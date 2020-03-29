cartaFabrilServices.service("ProtheusOrderService", ["$q", "ProtheusOrder", "SalesforceModelUtils", "createProtheusOrderBuildListQuery",
  function ProtheusOrderService ($q, ProtheusOrder, SalesforceModelUtils, createProtheusOrderBuildListQuery) {

  this.pageSize = 10
  this.objectName = "Carteira__c"
  this.model = ProtheusOrder
  this.userColumn = 'conta__c'

  this.buildListQuery = createProtheusOrderBuildListQuery.call(this, 'valorSaldo__c > 0')

  this.loadList = SalesforceModelUtils.loadList.bind(this);
  this.loadPage = SalesforceModelUtils.loadPage.bind(this);
}])

cartaFabrilFactories.factory("createProtheusOrderBuildListQuery", function createProtheusOrderBuildListQueryFactory() {
  return function createProtheusOrderBuildListQuery(mainCondition) {
    return function buildListQuery(filterParams) {
      filterParams = filterParams || {}

      return _.compact([
        "SELECT",
          "Id, numeroPedidoCliente__c, numeroPedidoProtheus__c, status__c,",
          "CreatedDate, dataEmissaoProtheus__c, valorTotalSemImpostos__c, valorSaldo__c,",
          "codigoCliente__c, loja__c, lojaCliente__c, razaoSocial__c,",
          "codigoTransportadora__c, tipoCliente__c, mensagemNotaFiscal__c,",
          "estado__c, codigoRede__c, rede__r.Name, tabelaRegional__r.Name, canal__c,",
          "condicaoPagamentoId__r.Name, percDescontoFinanceiro__c, tipoFrete__c,",
          "codigoVendedor__c, vendedor__r.Name, percComissao__c, codigoGerencia__c,",
          "supervisor__r.Name, observacaoPedido__c, tipoPedido__c, dataEntrega__c,",
          "percDescontoDuplicata__c, valorPedidoMinimo__c, quantidadeFaturada__c, quantidadePedida__c,",
          "valorTotalImpostos__c, mensagemPadrao__c, percContrato__c,",
          "conta__r.Name, conta__r.nomeFantasia__c,",
          "percentualBonus__c, tipoBloqueio__c,",
          "unidadeFaturamentoId__r.descricaoFilial__c,",
          "pedidoSalesforce__r.OrderNumber,",
          "pedidoSalesforce__r.id_protheus__c,",
          "pedidoSalesforce__r.Id,",
          "pedidoSalesforce__r.AccountId,",
          "pedidoSalesforce__r.CNPJ__c,",
          "pedidoSalesforce__r.nomeGerencia__c,",
          "pedidoSalesforce__r.necessitaAgendamento__c,",
          "pedidoSalesforce__r.aceitaEntregaParcial__c,",
          "pedidoSalesforce__r.valorDuplicataMinima__c,",

          "pedidoSalesforce__r.possuiCombo__c,",
          "pedidoSalesforce__r.combos__c,",
          "pedidoSalesforce__r.PodeAnteciparEntrega__c,",

          "(SELECT",
            "quantidadeFaturada__c, quantidadePedida__c, dataEntrega__c, descricaoProduto__c, tes__c,",
            "codigoProduto__c, valorSaldo__c, valorTotal__c, valorTotalImpostos__c, novaUnidadeFaturamento__r.descricaoFilial__c,",
            "precoLiquido__c, itemPedido__r.idItemTabelaRegional__c",
            "FROM ItensCarteira__r",
          ")",
        "FROM " + this.objectName,
        "WHERE " + mainCondition,
        (filterParams.orderNumber ? "AND numeroPedidoProtheus__c LIKE '%" + filterParams.orderNumber + "%'" : ""),
        (filterParams.startDate ? "AND dataEmissaoProtheus__c >= " + filterParams.startDate.toISOString().split('T')[0] : ""),
        (filterParams.endDate ? "AND dataEmissaoProtheus__c <= " + filterParams.endDate.toISOString().split('T')[0] : ""),
        (filterParams.clientId ? "AND " + this.userColumn + " = '" + filterParams.clientId + "'" : ""),
        "ORDER BY dataEmissaoProtheus__c desc, numeroPedidoProtheus__c desc"
      ]).join(" ")
    }.bind(this);
  };
})

cartaFabrilFactories.factory('ProtheusOrderItem', ['ProxyDecorator', function (ProxyDecorator) {
  return ProxyDecorator(function ProtheusOrderItem(attributes) {
    this.code = attributes.codigoProduto__c
    this.description = attributes.descricaoProduto__c
    this.deliverDate = attributes.dataEntrega__c
    this.totalAmountWithTaxes = attributes.valorTotalImpostos__c
    this.totalAmountWithoutTaxes = attributes.valorTotal__c
    this.deliveredQuantity = attributes.quantidadeFaturada__c
    this.quantity = attributes.quantidadePedida__c
    this.differenceQuantity = Number(attributes.quantidadePedida__c) - Number(attributes.quantidadeFaturada__c)
    this.balance = attributes.valorSaldo__c
    this.IOType = attributes.tes__c
    this.liquidPrice = attributes.precoLiquido__c
    this.newBillingUnit = _.get(attributes, 'novaUnidadeFaturamento__r.Name')
    this.regionalTableId = _.get(attributes, 'itemPedido__r.idItemTabelaRegional__c')
  });
}])

cartaFabrilFactories.factory('ProtheusOrder', ['ProtheusOrderItem', 'ProxyDecorator', function (ProtheusOrderItem, ProxyDecorator) {
  return ProxyDecorator(function ProtheusOrder(attributes) {
    this.id              = attributes.Id
    this.accountId       = _.get(attributes, 'pedidoSalesforce__r.AccountId')
    this.accountName     = _.get(attributes, 'conta__r.Name')
    this.fantasyName     = _.get(attributes, 'conta__r.nomeFantasia__c')
    this.originalOrder   = _.get(attributes, 'pedidoSalesforce__r.OrderNumber')
    this.originalOrderId = _.get(attributes, 'pedidoSalesforce__r.Id')
    this.fromProtheus    = !!_.get(attributes, 'pedidoSalesforce__r.id_protheus__c')
    this.status          = attributes.status__c
    this.protheusCode    = attributes.numeroPedidoProtheus__c
    this.date            = attributes.CreatedDate || '__/__/____'
    this.protheusDate    = attributes.dataEmissaoProtheus__c || '__/__/____'
    this.totalAmount     = attributes.valorTotalSemImpostos__c
    this.balance         = attributes.valorSaldo__c
    this.deliveredQuantity = attributes.quantidadeFaturada__c
    this.deliverDate = attributes.dataEntrega__c

    this.possuiCombo     = _.get(attributes, 'pedidoSalesforce__r.possuiCombo__c')
    this.allCombos       = _.get(attributes, 'pedidoSalesforce__r.combos__c')
    this.PodeAnteciparEntrega = _.get(attributes, 'pedidoSalesforce__r.PodeAnteciparEntrega__c')

    this.quantity = attributes.quantidadePedida__c
    this.differenceQuantity = Number(attributes.quantidadePedida__c) - Number(attributes.quantidadeFaturada__c)
    this.billingUnit = _.get(attributes, 'unidadeFaturamentoId__r.descricaoFilial__c')
    this.clientCode = attributes.codigoCliente__c
    this.store = attributes.loja__c
    this.clientStore = attributes.lojaCliente__c
    this.legalName = attributes.razaoSocial__c
    this.carrier = attributes.codigoTransportadora__c
    this.clientType = attributes.tipoCliente__c
    this.invoiceMessage = attributes.mensagemNotaFiscal__c
    this.cnpj = _.get(attributes, 'pedidoSalesforce__r.CNPJ__c')
    this.state = attributes.estado__c
    this.networkCode = attributes.codigoRede__c
    this.network = _.get(attributes, 'rede__r.Name')
    this.regionalTable = _.get(attributes, 'tabelaRegional__r.Name')
    this.clientChannel = attributes.canal__c
    this.paymentCondition = _.get(attributes, 'condicaoPagamentoId__r.Name')
    this.percentFinancialDiscount = attributes.percDescontoFinanceiro__c
    this.freightType = attributes.tipoFrete__c
    this.salerCode = attributes.codigoVendedor__c
    this.salerName = _.get(attributes, 'vendedor__r.Name')
    this.percentKickback = attributes.percComissao__c
    this.managementCode = attributes.codigoGerencia__c
    this.managementName = _.get(attributes, 'pedidoSalesforce__r.nomeGerencia__c')
    this.supervisor = _.get(attributes, 'supervisor__r.Name')
    this.createdDate = attributes.CreatedDate
    this.orderNote = attributes.observacaoPedido__c
    this.clientOrderNumber = attributes.numeroPedidoCliente__c
    this.percentContract = attributes.percContrato__c
    this.percentDiscountTradeBill = attributes.percDescontoDuplicata__c
    this.needScheduling = _.get(attributes, 'pedidoSalesforce__r.necessitaAgendamento__c')
    this.canPartialDelivery = _.get(attributes, 'pedidoSalesforce__r.aceitaEntregaParcial__c')
    this.minimumOrderValue = attributes.valorPedidoMinimo__c
    this.totalAmountWithTaxes = attributes.valorTotalImpostos__c
    this.totalBonus = attributes.valorTotalBonus__c
    this.totalBonusWithTaxes = attributes.valorTotalBonusImpostos__c
    this.percentBonus = attributes.percentualBonus__c
    this.blockedBy = attributes.tipoBloqueio__c || false
    this.minimumTradeBillValue = _.get(attributes, 'pedidoSalesforce__r.valorDuplicataMinima__c')
    this.orderType = attributes.tipoPedido__c
    this.textMessage = attributes.mensagemPadrao__c

    this.products = _.chain(attributes)
      .get("itensCarteira__r.records", [])
      .map(function (item) {
        return ProtheusOrderItem(item)
      })
      .value()
    ;

  });
}])

