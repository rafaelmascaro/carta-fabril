cartaFabrilServices.service('ProductsService', ['$q', 'Product', 'SalesforceModelUtils', "AuthService",
  function ProductsService($q, Product, SalesforceModelUtils, AuthService) {

  this.pageSize = 100
  this.objectName = 'Product2'
  this.model = Product

  this.buildListQuery = function buildListQuery() {
    var user = AuthService.getUserData()

    return [
      "SELECT",
        "Id, campo1__c, campo2__c, campo3__c, Categoria__c, Imagem_URL__c,",
        "Name, ProductCode, alturaPacote__c, comprimentoPacote__c, Peso_Bruto_Pacote__c,",
        "larguraPacote__c, largura__c, altura__c, comprimento__c, aliqIPI__c,",
        "pesoBrutoFardo__c, Cubagem__c, outrosDescritivos__c, Gramatura__c,",
        "detalhamento__c, unidadeMedida__c, exNcm__c, ean13__c, dun14__c,",
        "Paletizacao__c, validade__c, ordenacaoCategoria__c,Family, cest__c",
      "FROM " + this.objectName,
      "WHERE IsActive = true",
        _.includes(['Vendedor', 'Representante'], user.profile) ?
          "AND Amostra__c = false" : "",
      "ORDER BY ordenacao__c asc"
    ].join(" ").trim()

  };

  this.loadList = SalesforceModelUtils.loadList.bind(this);
  this.loadPage = SalesforceModelUtils.loadPage.bind(this);

}])

cartaFabrilFactories.factory('Product', ['ProxyDecorator', function (ProxyDecorator) {
  return ProxyDecorator(function Product(attributes) {
    this.id               = attributes.Id
    this.code             = attributes.ProductCode
    this.family           = attributes.Family
    this.category         = attributes.Categoria__c
    this.imageURL         = attributes.Imagem_URL__c
    this.description      = attributes.Name
    this.otherDescription = attributes.outrosDescritivos__c
    this.details          = attributes.detalhamento__c
    this.measureUnit      = attributes.unidadeMedida__c
    this.ncm              = attributes.exNcm__c
    this.cest             = attributes.cest__c
    this.ean13            = attributes.ean13__c
    this.dun14            = attributes.dun14__c
    this.grammage         = attributes.Gramatura__c
    this.ipiAliquot       = attributes.aliqIPI__c
    this.orderCategory    = attributes.ordenacaoCategoria__c
    this.packHeight       = attributes.alturaPacote__c
    this.packWidth        = attributes.larguraPacote__c
    this.packLength       = attributes.comprimentoPacote__c
    this.packWeight       = attributes.Peso_Bruto_Pacote__c + ' kg'
    this.width            = attributes.largura__c
    this.height           = attributes.altura__c
    this.length           = attributes.comprimento__c
    this.palletizing      = attributes.Paletizacao__c
    this.cubature         = attributes.Cubagem__c
    this.weight           = attributes.pesoBrutoFardo__c + ' kg'
    this.dueDate          = attributes.validade__c

    this.dimensions = this.length + ' x ' + this.width + ' x ' + this.height + ' cm'
    this.packDimensions = this.packLength + ' x ' + this.packWidth + ' x ' + this.packHeight + ' cm'

    this.field1 = attributes.campo1__c
    this.field2 = attributes.campo2__c
    this.field3 = attributes.campo3__c
  })
}])
