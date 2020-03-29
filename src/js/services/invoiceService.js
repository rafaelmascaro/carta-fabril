cartaFabrilServices.service('InvoiceService', ['SalesforceModelUtils', 'Invoice',
  function InvoiceService(SalesforceModelUtils, Invoice) {

  this.pageSize = 10
  this.objectName = 'notaFiscal__c'
  this.model = Invoice

  this.buildListQuery = function buildListQuery(filterParams) {
    return [
      "SELECT",
        "Id, Name, notaFiscal__c, serieNota__c, dataEmissaoNF__c, valorTotalComImposto__c,",
        "valorTotalSemImposto__c, dataEntrega__c, filial__c, descricaoCondicaoPagamento__c,",
        "numeroPedidoOriginal__c, numeroPedidoProtheus__c, carteira__r.tipoPedido__c, carteira__r.tipoFrete__c,",
        "codigoVendedor__c, nomeVendedor__c,",
        "(SELECT",
          "valorTitulo__c, dataVencimento__c, parcela__c, numeroTitulo__c",
          "FROM Titulos__r",
        "),",
        "(SELECT",
          "codProduto__c, quantidade__c, nomeProduto__c, valorUnitario__c,",
          "valorTotalSemImposto__c, valorTotalcomImposto__c",
          "FROM ItensdeNotaFiscal__r",
        ")",
      "FROM " + this.objectName,
      "WHERE clienteId__c='" + filterParams.clientId + "'",
      (filterParams.invoiceNumber ? "AND Name LIKE '%" + filterParams.invoiceNumber + "%'" : ""),
      (filterParams.startDate ? "AND dataEmissaoNF__c >= " + filterParams.startDate.toISOString().substring(0,10): ""),
      (filterParams.endDate ? "AND dataEmissaoNF__c < " + filterParams.endDate.toISOString().substring(0,10) : "AND dataEmissaoNF__c <= " + new Date().toISOString().substring(0,10)),
      "AND status__c <> 'Cancelada'",
      "ORDER BY dataEmissaoNF__c desc, Name desc"
    ].join(" ").trim();
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this);
  this.loadPage = SalesforceModelUtils.loadPage.bind(this);

}])

cartaFabrilFactories.factory('InvoiceSlip', ['ProxyDecorator', function (ProxyDecorator) {
  return ProxyDecorator(function InvoiceItem(attributes) {
    this.dueDate = attributes.dataVencimento__c
    this.value = attributes.valorTitulo__c
    this.number = attributes.numeroTitulo__c
    this.parcel = attributes.parcela__c
  })
}])

cartaFabrilFactories.factory('InvoiceItem', ['ProxyDecorator', function (ProxyDecorator) {
  return ProxyDecorator(function InvoiceItem(attributes) {
    this.code                     = attributes.codProduto__c
    this.quantity                 = attributes.quantidade__c
    this.name                     = attributes.nomeProduto__c
    this.price                    = attributes.valorUnitario__c
    this.totalAmmountWithoutTaxes = attributes.valorTotalSemImposto__c
    this.totalAmmount             = attributes.valorTotalcomImposto__c
  })
}])

cartaFabrilFactories.factory('Invoice', ["InvoiceItem", "InvoiceSlip", "ProxyDecorator", function (InvoiceItem, InvoiceSlip, ProxyDecorator) {
  return ProxyDecorator(function Invoice(attributes) {
    this.id = attributes.Id
    this.name = attributes.Name
    this.branch = attributes.filial__c
    this.issueDate = attributes.dataEmissaoNF__c
    this.totalAmmount = attributes.valorTotalComImposto__c
    this.totalAmmountWithoutTaxes = attributes.valorTotalSemImposto__c
    this.serialNumber = attributes.serieNota__c
    this.deliveryDate = attributes.dataEntrega__c
    this.paymentCondition = attributes.descricaoCondicaoPagamento__c
    this.orderNumber = attributes.numeroPedidoOriginal__c
    this.protheusOrderNumber = attributes.numeroPedidoProtheus__c
    this.salerCode = attributes.codigoVendedor__c
    this.salerName = attributes.nomeVendedor__c
    this.orderType = _.get(attributes, 'carteira__r.tipoPedido__c')
    this.freightType = _.get(attributes, 'carteira__r.tipoFrete__c')

    this.products = _.chain(attributes)
      .get("itensDeNotaFiscal__r.records", [])
      .map(function (item) {
        return new InvoiceItem(item)
      })
      .value()
    ;

    this.slips = _.chain(attributes)
      .get("Titulos__r.records", [])
      .map(function (item) {
        return new InvoiceSlip(item)
      })
      .value()
    ;
  })
}])
