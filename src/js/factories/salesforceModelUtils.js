angular.module('cartaFabril')

.factory('SalesforceModelUtils', ['$q', 'SalesforceService', function SalesforceModelUtils ($q, SalesforceService) {
  function executeQuery (query, limit, offset) {
    if (limit == null) limit = 1;

    var completeQuery = [
      query,
      "LIMIT " + limit,
      (offset ? "OFFSET " + offset : "")
    ].filter(function (str) { return str.length }).join(" ").trim()

    return SalesforceService.loadData(completeQuery).then(function (results) {
      var isLastPage = results.length < limit

      if (results.length > this.pageSize) {
        results.pop()
      }

      return $q.resolve({
        isLastPage : isLastPage,
        results : results.map(function (attributes) {
          return this.model(attributes)
        }.bind(this))
      })
    }.bind(this))
  };

  function loadList (filterParams) {
    var limit = this.pageSize + 1

    return executeQuery.call(this, this.buildListQuery(filterParams || {}), limit)
  }

  function loadPage (filterParams, page) {
    if (page < 1) throw new Error('LoadPage Error: Minimum page is 1');

    var offset = (page - 1) * this.pageSize,
        limit  = this.pageSize + 1

    return executeQuery.call(this, this.buildListQuery(filterParams || {}), limit, offset);
  }

  return {
    executeQuery : executeQuery,
    loadList : loadList,
    loadPage : loadPage
  }
}])
