describe("ContactService", function () {
  var ContactService, SalesforceService, Contact, $q

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _Contact_, _SalesforceService_, _ContactService_) {
    $q = _$q_
    Contact = _Contact_
    SalesforceService = _SalesforceService_
    ContactService = _ContactService_
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

    it("calls SalesforceService#loadData with the right params", function () {
      ContactService.loadList(clientId)
      expect(SalesforceService.loadData).toHaveBeenCalledWith("SELECT Id, Name, Phone, MobilePhone, Telefone2__c, Telefone3__c, Cargo__c FROM Contact WHERE AccountId = 'cid' ORDER BY Name desc LIMIT 101")
    })

    it("calls $q#resolve with an array of Contacts", function () {
      var resolveSpy = spyOn($q, 'resolve')

      ContactService.loadList(clientId)

      expect(resolveSpy).toHaveBeenCalledWith({ results : [
        new Contact(attributes[0]),
        new Contact(attributes[1]),
        new Contact(attributes[2])
      ], isLastPage: true})
    })
  })
})
