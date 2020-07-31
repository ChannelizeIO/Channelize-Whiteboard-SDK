const proxy = require('http-proxy-middleware');
const RTM_ENDPOINT = process.env.REACT_APP_AGORA_ENDPOINT_URL;
const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
module.exports = function (app) {
  RTM_ENDPOINT && app.use(
    '/dev/v2/',
    proxy({
      target: RTM_ENDPOINT,
      changeOrigin: true,
    })
  )
}