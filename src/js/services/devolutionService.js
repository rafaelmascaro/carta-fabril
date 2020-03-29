cartaFabrilServices.service('DevolutionService', ['Devolution', 'SalesforceModelUtils',
  function DevolutionService(Devolution, SalesforceModelUtils) {

  this.pageSize = 10
  this.objectName = 'Devolucoes__c'
  this.model = Devolution

  this.buildListQuery = function buildListQuery(filterParams) {
    return [
      "SELECT",
        "Id, Name, NotadeOrigem__c, NotadeDevolucao__c, valorDevolucao__c,",
        "emissaoNotaOrigem__c, emissaoNotaDevolucao__c, Tipo_de_Devolucao__c,",
        "motivoDevolucao__c, descMotivoDevolucao__c,",
        "numeroPedidoOriginal__c, numeroPedidoProtheus__c, tipoVenda__c,",
        "valorTotalComImposto__c, serieNFOrigem__c, serieNotaDevolucao__c,",
        "valorCreditoCliente__c,",
        "clienteId__r.Name,",
        "NotaFiscal__r.carteira__r.tipoPedido__c,",
        "NotaFiscal__r.Name,",
        "codigoVendedor__c, nomeVendedor__c,",
        "(SELECT",
          "codigoProduto__c, descricaoProduto__c, quantidade__c,",
          "precoUnitario__c, valorTotalComImpostos__c, valorTotalSemImpostos__c",
          "FROM ItensDevolucao__r",
        ")",
      "FROM " + this.objectName,
      "WHERE clienteId__c='" + filterParams.clientId + "'",
      (filterParams.devolutionNumber ? "AND Name LIKE '%" + filterParams.devolutionNumber + "%'" : ""),
      (filterParams.startDate ? "AND emissaoNotaDevolucao__c >= " + filterParams.startDate.toISOString().substring(0,10) : ""),
      (filterParams.endDate ? "AND emissaoNotaDevolucao__c < " + filterParams.endDate.toISOString().substring(0,10) : "AND emissaoNotaDevolucao__c <= " + new Date().toISOString().substring(0,10)),
      "ORDER BY emissaoNotaDevolucao__c desc"
    ].join(" ").trim();
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this);
  this.loadPage = SalesforceModelUtils.loadPage.bind(this);

}])

cartaFabrilFactories.factory('DevolutionItem', ['ProxyDecorator', function (ProxyDecorator) {
  return ProxyDecorator(function DevolutionItem(attributes) {
    this.code                     = attributes.codigoProduto__c
    this.quantity                 = attributes.quantidade__c
    this.name                     = attributes.descricaoProduto__c
    this.price                    = attributes.precoUnitario__c
    this.totalAmmountWithoutTaxes = attributes.valorTotalSemImpostos__c
    this.totalAmmount             = attributes.valorTotalComImpostos__c
  })
}])

cartaFabrilFactories.factory('Devolution', ["DevolutionItem", 'ProxyDecorator', function (DevolutionItem, ProxyDecorator) {
  return ProxyDecorator(function Devolution(attributes) {
    this.id                  = attributes.Id
    this.name                = attributes.Name
    this.type                = attributes.Tipo_de_Devolucao__c
    this.originalInvoice     = _.get(attributes, 'NotaFiscal__r.Name')
    this.returnedInvoice     = attributes.NotadeDevolucao__c
    this.totalAmount         = attributes.valorTotalComImposto__c
    this.clientCredit        = attributes.valorCreditoCliente__c
    this.originalInvoiceDate = attributes.emissaoNotaOrigem__c
    this.returnedInvoiceDate = attributes.emissaoNotaDevolucao__c
    this.reason              = attributes.descMotivoDevolucao__c
    this.salerCode           = attributes.codigoVendedor__c
    this.salerName           = attributes.nomeVendedor__c
    this.clientName          = _.get(attributes, 'clienteId__r.Name')
    this.originalInvoiceSerialNumber = attributes.serieNFOrigem__c
    this.returnedInvoiceSerialNumber = attributes.serieNotaDevolucao__c
    this.orderNumber         = attributes.numeroPedidoOriginal__c
    this.protheusOrderNumber = attributes.numeroPedidoProtheus__c
    this.orderType           = _.get(attributes, 'NotaFiscal__r.carteira__r.tipoPedido__c')

    this.products = _.chain(attributes)
      .get("ItensDevolucao__r.records", [])
      .map(function (item) {
        return new DevolutionItem(item)
      })
      .value()
    ;

  })
}])
