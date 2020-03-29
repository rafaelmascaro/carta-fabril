cartaFabrilServices.service('SosProceduresService', ['SosProcedure', 'SalesforceModelUtils',
  function SosProceduresService(SosProcedure, SalesforceModelUtils) {

  this.pageSize = 10
  this.model = SosProcedure
  this.objectName = 'SOS__c'

  this.buildListQuery = function buildListQuery() {
    return [
      "SELECT",
        "Id, Name, Descricao_de_procedimento__c, link__c",
      "FROM " + this.objectName,
      "WHERE HasProcedureBecauseSF__c = true",
      "ORDER BY ordenacao__c asc"
    ].join(" ").trim()
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this)
  this.loadPage = SalesforceModelUtils.loadPage.bind(this)
}])

cartaFabrilFactories.factory('SosProcedure', [function SosProcedure() {
  return function (procedure) {
    return {
      id: procedure.Id,
      name: procedure.Name,
      link: procedure.link__c,
      description: procedure.Descricao_de_procedimento__c.split("\n")
    }
  }
}])