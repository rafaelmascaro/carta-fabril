module.exports = function(config) {
    process.env.CF_APP_ENV=config.env;
    process.env.CF_SF_OAUTH_URL=config.sfOauthUrl;
    process.env.CF_SF_PARTNER_OAUTH_URL=config.sfPartnerOauthUrl;
    process.env.CF_LOCAL=true;

    require('./app.js');
}

