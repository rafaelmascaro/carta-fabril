describe("ProductService", function () {
  var $q,
      Product,
      ProductsService,
      SalesforceService,
      AuthService

  beforeEach(module('cartaFabril'))

  beforeEach(inject(function (_$q_, _Product_, _ProductsService_, _SalesforceService_, _AuthService_) {
    $q = _$q_
    Product = _Product_
    ProductsService = _ProductsService_
    SalesforceService = _SalesforceService_
    AuthService = _AuthService_
  }))

  describe('#objectName', function () {
    it("is the salesforce's object name", function () {
      expect(ProductsService.objectName).toEqual('Product2')
    })
  })

  describe("#loadList", function () {
    var attributes

    beforeEach(function () {
      attributes = [
        { 'Id': 'id1', 'Categoria__c': 'cat1' },
        { 'Id': 'id2', 'Categoria__c': 'cat1' },
        { 'Id': 'id3', 'Categoria__c': 'cat2' }
      ]

      var thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
        callback(attributes)
      })

      spyOn(SalesforceService, 'loadData').and.returnValue({ then: thenSpy })
    })

    it("calls SalesforceService#loadData with the right params", function () {
      spyOn(AuthService, 'getUserData').and.returnValue({ profile : 'Adm. Vendas' })

      ProductsService.loadList()
      expect(SalesforceService.loadData).toHaveBeenCalledWith('SELECT Id, campo1__c, campo2__c, campo3__c, Categoria__c, Imagem_URL__c, Name, ProductCode, alturaPacote__c, comprimentoPacote__c, Peso_Bruto_Pacote__c, larguraPacote__c, largura__c, altura__c, comprimento__c, aliqIPI__c, pesoBrutoFardo__c, Cubagem__c, outrosDescritivos__c, Gramatura__c, detalhamento__c, unidadeMedida__c, exNcm__c, ean13__c, dun14__c, Paletizacao__c, validade__c, ordenacaoCategoria__c FROM Product2 WHERE IsActive = true  ORDER BY ordenacao__c asc LIMIT 101')
    })

    describe("when user has profile 'Representante'", function () {
      beforeEach(function () {
        spyOn(AuthService, 'getUserData').and.returnValue({ profile : 'Representante' })
      })

      it("calls SalesforceService#loadData with the right params", function () {
        ProductsService.loadList()
        expect(SalesforceService.loadData).toHaveBeenCalledWith('SELECT Id, campo1__c, campo2__c, campo3__c, Categoria__c, Imagem_URL__c, Name, ProductCode, alturaPacote__c, comprimentoPacote__c, Peso_Bruto_Pacote__c, larguraPacote__c, largura__c, altura__c, comprimento__c, aliqIPI__c, pesoBrutoFardo__c, Cubagem__c, outrosDescritivos__c, Gramatura__c, detalhamento__c, unidadeMedida__c, exNcm__c, ean13__c, dun14__c, Paletizacao__c, validade__c, ordenacaoCategoria__c FROM Product2 WHERE IsActive = true AND Amostra__c = false ORDER BY ordenacao__c asc LIMIT 101')
      })

      it("calls $q#resolve with an object of Products indexed by their category", function () {
        var result,
            resolveSpy = spyOn($q, 'resolve')

        ProductsService.loadList()

        result = {
          results : [
            Product(attributes[0]),
            Product(attributes[1]),
            Product(attributes[2])
          ],
          isLastPage: true
        }

        expect(resolveSpy).toHaveBeenCalledWith(result)
      })
    })
  })

})
