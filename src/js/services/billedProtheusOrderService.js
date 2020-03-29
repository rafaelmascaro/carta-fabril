cartaFabrilServices.service("BilledProtheusOrderService", ["$q", "ProtheusOrder", "SalesforceModelUtils", "createProtheusOrderBuildListQuery", function BilledProtheusOrderService ($q, ProtheusOrder, SalesforceModelUtils, createProtheusOrderBuildListQuery) {
  this.pageSize = 10
  this.objectName = "Carteira__c"
  this.model = ProtheusOrder
  this.userColumn = 'conta__c'

  this.buildListQuery = createProtheusOrderBuildListQuery.call(this, 'valorSaldo__c = 0')

  this.loadList = SalesforceModelUtils.loadList.bind(this);
  this.loadPage = SalesforceModelUtils.loadPage.bind(this);
}])
