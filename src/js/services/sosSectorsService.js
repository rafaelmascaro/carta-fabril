cartaFabrilServices.service('SosSectorsService', ['SosContact', 'SalesforceModelUtils',
  function SosSectorsService(SosContact, SalesforceModelUtils) {

  this.pageSize = 1000
  this.model = SosContact
  this.objectName = 'SOS__c'

  this.buildListQuery = function buildListQuery() {
    return [
      "SELECT",
        "Id, Name, cargo__c, celular__c, celular2__c, email__c, ordenacao__c,",
        "encargos__c, radio__c, ramal__c, telefone__c, Setor__c",
      "FROM " + this.objectName,
      "WHERE HasProcedureBecauseSF__c = false",
        "AND cep__c = null"
    ].join(" ").trim()
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this)
  this.loadPage = SalesforceModelUtils.loadPage.bind(this)
}])

cartaFabrilFactories.factory('SosContact', [function SosContact() {
  return function (contact) {
    return {
      id: contact.Id,
      name: contact.Name,
      role: contact.cargo__c,
      mobile: contact.celular__c,
      mobile2: contact.celular2__c,
      email: contact.email__c,
      responsibilities: contact.encargos__c,
      radio: contact.radio__c,
      ramal: contact.ramal__c,
      phone: contact.telefone__c,
      order: contact.ordenacao__c,
      sector: contact.Setor__c
    }
  }
}])
