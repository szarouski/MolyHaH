(function() {
  chrome.runtime.onInstalled.addListener(function(details) {});

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var fn, obj, prop, response, _i, _len, _ref;
    switch (request.type) {
      case 'call':
        obj = window;
        _ref = request.fnname.split('.');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          prop = _ref[_i];
          obj = obj[prop];
        }
        fn = obj;
        response = fn.apply(this, request.args);
        sendResponse(response);
        break;
      case 'getTab':
        sendResponse(sender.tab);
        break;
      case 'getSettings':
        storage.getSettings(function(settings) {
          return sendResponse(settings);
        });
        break;
      case 'setSettings':
        storage.setSettings(request.settings, function(settings) {
          return sendResponse(settings);
        });
    }
    return true;
  });

}).call(this);
