cartaFabrilServices.service('DelinquencyService', ['Delinquency', 'SalesforceModelUtils',
  function DelinquencyService(Delinquency, SalesforceModelUtils) {

  this.pageSize = 10
  this.objectName = 'Titulos__c'
  this.model = Delinquency

  this.buildListQuery = function buildListQuery(filterParams) {
    return [
      "SELECT",
        "Id, Name, dataEmissao__c, dataVencimento__c,",
        "NotaFiscal__r.notaFiscal__c, NotaFiscal__r.serieNota__c,",
        "NotaFiscal__r.dataEmissaoNF__c,",
        "parcela__c, diasAtraso__c, valorTitulo__c, saldoTitulo__c,",
        "Tipo__c, descricaoCondicaoPagamento__c, codigoCliente__c,",
        "codVendedorRepresentante__c, vendedorRepresentante__r.Name,",
        "(SELECT",
          "Id, dataHoraChamada__c, historicoTeleCobranca__c",
          "FROM Telecobranca__r",
        ")",
      "FROM " + this.objectName,
      "WHERE clienteId__c='" + filterParams.clientId + "'",
        (filterParams.delinquencyNumber ? "AND Name LIKE '%" + filterParams.delinquencyNumber + "%'" : ""),
        (filterParams.startDate ? "AND dataVencimento__c >= " + filterParams.startDate.toISOString().substring(0,10) : ""),
        (filterParams.endDate ? "AND dataVencimento__c < " + filterParams.endDate.toISOString().substring(0,10) : "AND dataVencimento__c <= " + new Date().toISOString().substring(0,10)),
        "AND statusNotaFiscal__c <> 'Cancelada'",
        "AND diasAtraso__c > 0",
        "AND saldoTitulo__c > 0",
      "ORDER BY diasAtraso__c desc, dataEmissao__c desc, Name desc"
    ].join(" ").trim();
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this);
  this.loadPage = SalesforceModelUtils.loadPage.bind(this);

}])

cartaFabrilFactories.factory('Phonecharge', ['ProxyDecorator', function (ProxyDecorator) {
  return ProxyDecorator(function Phonecharge(attributes) {
    this.id = attributes.Id
    this.date = attributes.dataHoraChamada__c
    this.history = attributes.historicoTeleCobranca__c
  })
}])

cartaFabrilFactories.factory('Delinquency', ['ProxyDecorator', 'Phonecharge', function (ProxyDecorator, Phonecharge) {
  return ProxyDecorator(function Delinquency(attributes) {
    this.id                  = attributes.Id
    this.name                = attributes.Name
    this.orderDate           = attributes.dataEmissao__c
    this.dueDate             = attributes.dataVencimento__c
    this.invoice             = attributes.NotaFiscal__r.notaFiscal__c
    this.invoiceSerialNumber = attributes.NotaFiscal__r.serieNota__c
    this.invoiceIssueDate    = attributes.NotaFiscal__r.dataEmissaoNF__c
    this.parcel              = attributes.parcela__c
    this.type                = attributes.Tipo__c
    this.paymentCondition    = attributes.descricaoCondicaoPagamento__c
    this.clientId            = attributes.codigoCliente__c

    this.salerCode           = attributes.codVendedorRepresentante__c
    
    this.salerName           = _.get(attributes, 'vendedorRepresentante__r.Name')

    this.delayedDays         = attributes.diasAtraso__c + ' dias'
    this.delayDays           = attributes.diasAtraso__c

    this.totalAmount         = attributes.valorTitulo__c
    this.balance             = attributes.saldoTitulo__c

    this.phonecharges        = _.chain(attributes)
      .get("Telecobranca__r.records", [])
      .map(function (item) {
        return new Phonecharge(item)
      })
      .value()
    ;
  })
}])
