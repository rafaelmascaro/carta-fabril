var request = require('request'),
    fs      = require('fs'),
    express = require('express'),
    jsforceAjaxProxy = require('jsforce-ajax-proxy'),
    app = express()

if (process.env.CF_APP_ENV !== 'development') {
  app.use(function forceSsl(req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''))
    }

    return next()
  })
}

app.use(express.static('www'))

app.all('/proxy/?*', jsforceAjaxProxy())

app.use('/id', function(req, res) {
    var url = process.env.CF_SF_OAUTH_URL + 'id' + req.url

    req.pipe(request(url)).pipe(res)
});

function proxyOauthRequest(oauthUrl) {
    return function (req, res) {
        var url = oauthUrl + 'services' + req.url,
            reqst = req.method === 'POST' ? request.post({uri: url, json: req.body}) : request(url)

        req.pipe(reqst).pipe(res)
    }
}

app.use('/vendor/services', proxyOauthRequest(process.env.CF_SF_OAUTH_URL))
app.use('/agent/services',  proxyOauthRequest(process.env.CF_SF_PARTNER_OAUTH_URL))

app.get('/from_salesforce', function (req, res, next) {
    res.send([
        '<html><head></head>',
        '<body onload="emitRaw()">',
            '<script>',
            'function emitRaw() {',
                'window.opener.postMessage(window.location.hash.slice(1), location.origin)',
            '}',
            '</script>',
        '</body></html>'
    ].join(''))
})

if(process.env.CF_LOCAL) {

    app.set('port', process.env.PORT || 443)

    var https = require('https');

    var options = {
        key: fs.readFileSync('certificates/key.pem'),
        cert: fs.readFileSync('certificates/cert.pem'),
        passphrase: 'changeit'
    };

    https.createServer(options, app).listen(443, function () {
        console.log('Express listening on port ' + app.get('port'));
    });

}
else {
    app.set('port', process.env.PORT || 80)

    app.listen(app.get('port'), function () {
        console.log('Express listening on port ' + app.get('port'))
    })
}
