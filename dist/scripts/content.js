(function() {
  var callbg, getTab, hah, hapt_listen, settings,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  callbg = function() {
    var args, cb, fnname;
    cb = arguments[0], fnname = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    return chrome.runtime.sendMessage({
      type: 'call',
      fnname: fnname,
      args: args
    }, function(response) {
      return typeof cb === "function" ? cb(response) : void 0;
    });
  };

  getTab = function(cb) {
    return chrome.runtime.sendMessage({
      type: 'getTab'
    }, function(tab) {
      return typeof cb === "function" ? cb(tab) : void 0;
    });
  };

  hapt_listen = function(cb) {
    return hapt.listen(function(keys, event) {
      var _ref;
      if (!(event.target.isContentEditable || ((_ref = event.target.nodeName.toLowerCase()) === 'textarea' || _ref === 'input' || _ref === 'select'))) {
        return cb(keys, event);
      }
      return true;
    }, window, true, []);
  };

  settings = null;

  chrome.runtime.sendMessage({
    type: 'getSettings'
  }, function(_settings) {
    var listen;
    settings = _settings;
    listen = function() {
      var isEnabled, listener;
      isEnabled = true;
      return listener = hapt_listen(function(keys) {
        var binding, _keys;
        _keys = keys.join(' ');
        if (__indexOf.call((function() {
          var _i, _len, _ref, _results;
          _ref = settings.bindings.toggleAbility;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            binding = _ref[_i];
            _results.push(binding.join(' '));
          }
          return _results;
        })(), _keys) >= 0) {
          isEnabled = !isEnabled;
        }
        if (!isEnabled) {
          return true;
        }
        if (__indexOf.call((function() {
          var _i, _len, _ref, _results;
          _ref = settings.bindings.enterHah;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            binding = _ref[_i];
            _results.push(binding.join(' '));
          }
          return _results;
        })(), _keys) >= 0) {
          listener.stop();
          listener = null;
          hah(null, function() {
            return listen();
          });
          return false;
        }
        if (__indexOf.call((function() {
          var _i, _len, _ref, _results;
          _ref = settings.bindings.enterHahBg;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            binding = _ref[_i];
            _results.push(binding.join(' '));
          }
          return _results;
        })(), _keys) >= 0) {
          listener.stop();
          listener = null;
          hah({
            active: false
          }, function() {
            return listen();
          });
          return false;
        }
        return true;
      });
    };
    return listen();
  });

  /*
  Enter HaH mode
  @param {Object} tab An Object passed to chrome.tabs.create() as createProperties. If null is passed, a link is "clicked" regularly.
  @param {Function} cb Called when HaH mode is canceled.
  */


  hah = function(tab_option, cb) {
    var BACK_PANEL_ID, HINT_CLASS_NAME, createBackPanel, createHints, createSymbolSequences, hint, hints, input, listener, panel, quit, setPosition, symbols, _keys;
    if (tab_option == null) {
      tab_option = null;
    }
    if (cb == null) {
      cb = null;
    }
    HINT_CLASS_NAME = 'moly_hah_hint';
    BACK_PANEL_ID = 'moly_hah_backpanel';
    symbols = settings.symbols;
    createSymbolSequences = function(element_num) {
      /*
      @param {Number} element_num Number of target elements.
      @param {Number} symbol_num Number of characters used at Hit-a-Hint.
      */

      var createUniqueSequences, i, seqs, shortcuts, _symbols;
      createUniqueSequences = function(element_num, symbol_num) {
        var dig, parse, queue, remaining_num, sequences;
        remaining_num = element_num;
        queue = [];
        dig = function(leaf) {
          var a, buds_num, i, _i;
          if (leaf == null) {
            leaf = [];
          }
          if (remaining_num === 0) {
            return leaf;
          }
          if (queue.length !== 0) {
            remaining_num += 1;
          }
          buds_num = _.min([remaining_num, symbol_num]);
          for (i = _i = 1; 1 <= buds_num ? _i <= buds_num : _i >= buds_num; i = 1 <= buds_num ? ++_i : --_i) {
            a = [];
            leaf.push(a);
            queue.push(a);
          }
          remaining_num -= buds_num;
          dig(queue.shift());
          return leaf;
        };
        sequences = [];
        parse = function(node, trace_indices) {
          var i, _i, _len, _ref, _results;
          if (node == null) {
            node = dig();
          }
          if (trace_indices == null) {
            trace_indices = [];
          }
          if (node.length === 0) {
            sequences.push(trace_indices);
            return;
          }
          _ref = _.range(node.length);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(parse(node[i], trace_indices.concat(i)));
          }
          return _results;
        };
        parse();
        return sequences;
      };
      _symbols = symbols.split('').reverse().join('');
      seqs = createUniqueSequences(element_num, symbols.length);
      shortcuts = (function() {
        var _i, _len, _ref, _results;
        _ref = _.range(element_num);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push((seqs[i].map(function(n) {
            return _symbols[n];
          })).join(''));
        }
        return _results;
      })();
      return shortcuts.reverse();
    };
    createBackPanel = function() {
      var panel;
      panel = document.createElement('div');
      panel.id = BACK_PANEL_ID;
      return panel;
    };
    createHints = function() {
      var createHint, e, filter, hint, hints, isInsideDisplay, isVisible, q, shortcut, targets, _i, _len, _ref, _ref1;
      createHint = function(target) {
        var hint;
        hint = document.createElement('div');
        hint.className = HINT_CLASS_NAME + (target.nodeName.toLowerCase() === 'a' ? ' moly_hah_link' : '');
        hint.moly_hah = {
          target: target,
          defaultClassName: hint.className
        };
        return hint;
      };
      isVisible = function(e) {
        return (e.offsetWidth > 0 || e.offsetHeight > 0) && window.getComputedStyle(e).visibility !== 'hidden';
      };
      isInsideDisplay = function(e) {
        var isInsideX, isInsideY, pos, _ref, _ref1;
        pos = e.getBoundingClientRect();
        isInsideX = (-1 * e.offsetWidth <= (_ref = pos.left) && _ref < (window.innerWidth || document.documentElement.clientWidth));
        isInsideY = (-1 * e.offsetHeight <= (_ref1 = pos.top) && _ref1 < (window.innerHeight || document.documentElement.clientHeight));
        return isInsideX && isInsideY;
      };
      targets = (function() {
        var _i, _len, _ref, _results;
        _ref = Array.prototype.slice.call(document.querySelectorAll('*'), 0);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          if (window.getComputedStyle(e).cursor === 'pointer') {
            _results.push(e);
          }
        }
        return _results;
      })();
      q = 'a, input:not([type="hidden"]), textarea, button, select, [contenteditable]:not([contenteditable="false"]), [onclick], [onmousedown], [onmouseup], [role="link"], [role="button"]';
      targets = (function() {
        var _i, _len, _ref, _results;
        _ref = _.union(Array.prototype.slice.call(document.querySelectorAll(q), 0), targets);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          if (isVisible(e) && isInsideDisplay(e)) {
            _results.push(e);
          }
        }
        return _results;
      })();
      filter = function() {
        var elem, _i, _len, _targets;
        _targets = [];
        for (_i = 0, _len = targets.length; _i < _len; _i++) {
          elem = targets[_i];
          e = elem;
          while ((e = e.parentElement) != null) {
            if (__indexOf.call(targets, e) >= 0) {
              break;
            }
          }
          if (e == null) {
            _targets.push(elem);
          }
        }
        return _targets;
      };
      hints = (function() {
        var _i, _len, _ref, _results;
        _ref = filter();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          _results.push(createHint(e));
        }
        return _results;
      })();
      _ref = _.zip(hints, createSymbolSequences(hints.length));
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref1 = _ref[_i], hint = _ref1[0], shortcut = _ref1[1];
        hint.textContent = shortcut;
      }
      return hints;
    };
    quit = function() {
      if (typeof panel !== "undefined" && panel !== null) {
        document.querySelector('body').removeChild(panel);
      }
      if (typeof listener !== "undefined" && listener !== null) {
        listener.stop();
      }
      return typeof cb === "function" ? cb() : void 0;
    };
    panel = createBackPanel();
    document.querySelector('body').appendChild(panel);
    hints = (function() {
      var _i, _len, _ref, _results;
      _ref = createHints().reverse();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hint = _ref[_i];
        setPosition = function() {
          var client, left, offset, top, _ref1;
          offset = function(e) {
            var pos;
            pos = e.getClientRects()[0];
            if (pos != null) {
              return {
                left: pos.left + window.scrollX,
                top: pos.top + window.scrollY
              };
            } else {
              return {
                left: 0,
                top: 0
              };
            }
          };
          _ref1 = offset(hint.moly_hah.target), left = _ref1.left, top = _ref1.top;
          client = {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
          };
          hint.style.left = '' + _.min([_.max([left, window.scrollX]), window.scrollX + client.width - hint.offsetWidth]) + 'px';
          return hint.style.top = '' + _.min([_.max([top, window.scrollY]), window.scrollY + client.height - hint.offsetHeight]) + 'px';
        };
        hint.style.zIndex = 2147483647 - panel.childElementCount;
        panel.appendChild(hint);
        setPosition();
        _results.push(hint);
      }
      return _results;
    })();
    if (hints.length === 0) {
      quit();
      return;
    }
    input = '';
    _keys = [];
    return listener = hapt_listen(function(keys, event) {
      var handle_input, key;
      handle_input = function() {
        var click, findMatchingHints, getRegularClassName, h, matching_hints, _i, _j, _len, _len1, _results, _results1;
        findMatchingHints = function() {
          var h;
          return (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = hints.length; _i < _len; _i++) {
              h = hints[_i];
              if (h.textContent.slice(0, input.length) === input) {
                _results.push(h);
              }
            }
            return _results;
          })();
        };
        click = function(elem) {
          var attr, dispatchClickEvent, _ref;
          dispatchClickEvent = function() {
            var ev, type, _i, _len, _ref, _results;
            if ((tab_option != null) && elem.href) {
              return getTab(function(tab) {
                return callbg(null, 'chrome.tabs.create', _.extend(tab_option, {
                  url: elem.href,
                  index: tab.index + 1,
                  openerTabId: tab.id
                }));
              });
            } else {
              _ref = ['mousedown', 'mouseup', 'click'];
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                type = _ref[_i];
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent(type, true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                _results.push(elem.dispatchEvent(ev));
              }
              return _results;
            }
          };
          switch (elem.nodeName.toLowerCase()) {
            case 'a':
              dispatchClickEvent();
              break;
            case 'input':
              attr = (_ref = elem.getAttribute('type')) != null ? _ref.toLowerCase() : void 0;
              if (attr === 'checkbox' || attr === 'radio' || attr === 'file' || attr === 'submit' || attr === 'reset' || attr === 'button' || attr === 'image') {
                dispatchClickEvent();
              } else {
                elem.focus();
              }
              break;
            case 'textarea':
            case 'select':
              elem.focus();
              break;
            default:
              if (elem.isContentEditable) {
                elem.focus();
              } else {
                dispatchClickEvent();
              }
          }
          return quit();
        };
        getRegularClassName = function(h) {
          var _ref;
          return HINT_CLASS_NAME + ((_ref = h.moly_hah.target.nodeName.toLowerCase()) === 'a' ? ' link' : '');
        };
        matching_hints = findMatchingHints();
        if (matching_hints.length === 1 && input === matching_hints[0].textContent) {
          return click(matching_hints[0].moly_hah.target);
        } else if (matching_hints.length === hints.length) {
          _results = [];
          for (_i = 0, _len = hints.length; _i < _len; _i++) {
            h = hints[_i];
            h.className = h.moly_hah.defaultClassName;
            _results.push(h.innerHTML = h.textContent);
          }
          return _results;
        } else if (matching_hints.length > 1) {
          _results1 = [];
          for (_j = 0, _len1 = hints.length; _j < _len1; _j++) {
            h = hints[_j];
            h.className = h.moly_hah.defaultClassName + ' ' + (__indexOf.call(matching_hints, h) >= 0 ? 'moly_hah_matching' : 'moly_hah_not-matching');
            _results1.push(h.innerHTML = "<span class=\"moly_hah_partial_matching\">" + h.textContent.slice(0, +(input.length - 1) + 1 || 9e9) + "</span>" + h.textContent.slice(input.length));
          }
          return _results1;
        } else if (matching_hints.length === 0) {
          return input = input.slice(0, -1);
        }
      };
      key = String.fromCharCode(event.keyCode);
      if (settings.bindings.quitHah.some(function(binding) {
        return _.isEqual(keys, binding);
      })) {
        quit();
        return false;
      } else if (keys[0] === 'BackSpace') {
        if (input.length === 0) {
          quit();
        } else {
          input = input.slice(0, -1);
          handle_input();
        }
        return false;
      } else if (__indexOf.call(symbols, key) >= 0) {
        input += key;
        handle_input();
        return false;
      }
      return true;
    });
  };

}).call(this);
