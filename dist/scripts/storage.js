(function() {
  var EMPTY_SETTINGS, INITIAL_SETTINGS, getSanitizedBindings, getSanitizedSettings, getSettings, setSettings,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  INITIAL_SETTINGS = {
    symbols: 'ASDFJKL',
    bindings: {
      enterHah: [['E']],
      enterHahBg: [['Shift', 'E']],
      quitHah: [['Esc']],
      toggleAbility: []
    }
  };

  EMPTY_SETTINGS = (function(items) {
    var callee, k, v;
    callee = arguments.callee;
    if (_.isString(items)) {
      return '';
    } else if (_.isNumber(items)) {
      return 0;
    } else if (_.isArray(items)) {
      return [];
    } else if (_.isObject(items)) {
      return _.object((function() {
        var _results;
        _results = [];
        for (k in items) {
          v = items[k];
          _results.push([k, callee(v)]);
        }
        return _results;
      })());
    } else {
      return null;
    }
  })(INITIAL_SETTINGS);

  /*
  @param {Function} cb
      @param {Object} settings
  */


  getSettings = function(cb) {
    return chrome.storage.local.get(null, function(items) {
      var binding, k, name, setBinding, settings, used, v;
      settings = {
        bindings: {}
      };
      for (k in INITIAL_SETTINGS) {
        v = INITIAL_SETTINGS[k];
        if (!items.hasOwnProperty(k)) {
          settings[k] = v;
        } else if (k === 'bindings') {
          used = null;
          setBinding = function(bindings, name, binding) {
            var shortcuts;
            if (used == null) {
              used = _.uniq(_.flatten(_.values(items.bindings), true).map(function(shortcuts) {
                return shortcuts.join(' ');
              }));
            }
            bindings[name] = (function() {
              var _i, _len, _ref, _results;
              _results = [];
              for (_i = 0, _len = binding.length; _i < _len; _i++) {
                shortcuts = binding[_i];
                if (_ref = shortcuts.join(' '), __indexOf.call(used, _ref) < 0) {
                  _results.push(shortcuts);
                }
              }
              return _results;
            })();
            return used = used.concat(bindings[name]);
          };
          for (name in v) {
            binding = v[name];
            if (items.bindings.hasOwnProperty(name)) {
              settings.bindings[name] = items.bindings[name];
            } else {
              setBinding(settings.bindings, name, binding);
            }
          }
        } else {
          settings[k] = items[k];
        }
      }
      return cb(settings);
    });
  };

  /*
  Sanitize settings.
  @param {Object} settings An object to be sanitized that has keys corresponding to settings.
  @param {String} key Given this param, check a setting that has the key. Optional.
  @return {Object} sanitized settings.
  */


  getSanitizedSettings = function(settings, key) {
    var k, s, val, _v;
    if (key == null) {
      key = null;
    }
    if (key == null) {
      s = {};
      for (k in settings) {
        _v = settings[k];
        s[k] = getSanitizedSettings(settings, k);
      }
      return s;
    }
    if (!settings.hasOwnProperty(key)) {
      return void 0;
    }
    val = settings[key];
    switch (key) {
      case 'symbols':
        return _.uniq(val.toUpperCase().replace(/\W/g, '').split('')).join('');
      case 'bindings':
        return getSanitizedBindings(val);
      default:
        return val;
    }
  };

  getSanitizedBindings = function(bindings, key) {
    var b, binding, i, k, _i, _len, _ref, _v;
    if (key == null) {
      key = null;
    }
    if (key == null) {
      b = {};
      for (k in bindings) {
        _v = bindings[k];
        b[k] = getSanitizedBindings(bindings, k);
      }
      return b;
    }
    if (!bindings.hasOwnProperty(key)) {
      return void 0;
    }
    binding = _.uniq(bindings[key], false, function(shortcuts) {
      return shortcuts.join(' ');
    });
    _ref = _.range(binding.length);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      if (binding[i].length === 0) {
        binding.splice(i, 1);
      }
    }
    return binding;
  };

  setSettings = function(settings, cb) {
    var _settings;
    if (cb == null) {
      cb = null;
    }
    _settings = getSanitizedSettings(settings);
    return chrome.storage.local.set(_settings, function() {
      return typeof cb === "function" ? cb(_settings) : void 0;
    });
  };

  this.storage = {
    getSettings: getSettings,
    setSettings: setSettings,
    getSanitizedSettings: getSanitizedSettings,
    getSanitizedBindings: getSanitizedBindings
  };

}).call(this);
