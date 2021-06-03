const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://twilioserver-dot-virtualeventdemo.el.r.appspot.com',
            changeOrigin: true,
        })
    );
};
