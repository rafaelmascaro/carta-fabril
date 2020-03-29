cartaFabrilServices.service('SosUnitiesService', ['SosUnity', 'SalesforceModelUtils',
  function SosUnitiesService(SosUnity, SalesforceModelUtils) {

  this.pageSize = 10
  this.model = SosUnity
  this.objectName = 'SOS__c'

  this.buildListQuery = function buildListQuery() {
    return [
      "SELECT",
        "Id, Name, cnpj__c, inscricaoEstadual__c, cep__c,",
        "endereco__c, telefone__c",
      "FROM " + this.objectName,
      "WHERE HasProcedureBecauseSF__c = false",
        "AND cep__c <> null",
      "ORDER BY ordenacao__c asc"
    ].join(" ").trim()
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this)
  this.loadPage = SalesforceModelUtils.loadPage.bind(this)
}])

cartaFabrilFactories.factory('SosUnity', [function SosUnity() {
  return function (unity) {
    return {
      id: unity.Id,
      name: unity.Name,
      cnpj: unity.cnpj__c,
      stateInscription: unity.inscricaoEstadual__c,
      address: unity.endereco__c,
      cep: unity.cep__c,
      phone: unity.telefone__c
    }
  }
}])
