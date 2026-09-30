(function () {
  var host = window.location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';
  window.__env = window.__env || {};
  window.__env.API_BASE = isLocal ? '' : 'https://construction-management-api-90nr.onrender.com';
})();
