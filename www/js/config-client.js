/**
 * Created by leefsmp on 5/7/15.
 */

var configClient = {

  host: '/node/gallery',
  env: 'AutodeskProduction',
  viewAndDataUrl: 'https://developer.api.autodesk.com',
  ApiURL: "http://" + window.location.host +'/node/gallery/api',
  collaboration:{
    port: 5002
  }
};

var configClientStg = {

  env: 'AutodeskStaging',
  host: '/node/gallery-stg',
  viewAndDataUrl: 'https://developer-stg.api.autodesk.com',
  ApiURL: "http://" + window.location.host +'/node/gallery-stg/api',
  collaboration:{
    port: 5002
  }
};

module.exports = configClient;