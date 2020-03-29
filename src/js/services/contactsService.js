cartaFabrilServices.service('ContactService', ['SalesforceModelUtils', 'Contact',
  function ContactService (SalesforceModelUtils, Contact) {

  this.pageSize = 100
  this.objectName = 'Contact'
  this.model = Contact

  this.buildListQuery = function buildListQuery(filterParams) {
    return [
      "SELECT",
        "Id, Name, Phone, MobilePhone, Telefone2__c, Telefone3__c, Cargo__c",
      "FROM " + this.objectName,
      "WHERE AccountId = '" + filterParams.clientId + "'",
      "ORDER BY Name desc"
    ].join(" ").trim();
  }

  this.loadList = SalesforceModelUtils.loadList.bind(this);

}])

cartaFabrilFactories.factory('Contact', ['ProxyDecorator', function (ProxyDecorator) {
  return ProxyDecorator(function Contact(attributes) {
    this.id = attributes.Id
    this.name = attributes.Name
    this.phone = attributes.MobilePhone || attributes.Phone || attributes.Telefone2__c || attributes.Telefone3__c
    this.role = attributes.Cargo__c
  })
}])
