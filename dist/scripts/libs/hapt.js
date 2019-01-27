/*
----------------------------------------
Hapt
A key bindings listener for JavaScript.
----------------------------------------

The MIT License (MIT)

Copyright (c) 2013 slaypni

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


(function() {
  var MODIFIERS, SHORTCUTS, listen, _KeyState,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MODIFIERS = [16, 17, 18, 91, 92];

  SHORTCUTS = {
    16: 'Shift',
    17: 'Ctrl',
    18: 'Alt',
    91: 'Command',
    92: 'Meta',
    8: 'BackSpace',
    9: 'Tab',
    13: 'Enter',
    19: 'Pause',
    20: 'CapsLock',
    27: 'Esc',
    32: 'Space',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    42: 'PrintScreen',
    45: 'Insert',
    46: 'Delete',
    96: 'Num0',
    97: 'Num1',
    98: 'Num2',
    99: 'Num3',
    100: 'Num4',
    101: 'Num5',
    102: 'Num6',
    103: 'Num7',
    104: 'Num8',
    105: 'Num9',
    106: 'Mul',
    107: 'Add',
    109: 'Sub',
    110: 'Dec',
    111: 'Div',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    124: 'F13',
    125: 'F14',
    126: 'F15',
    144: 'NumLock',
    145: 'ScrollLock',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: "'"
  };

  _KeyState = (function() {
    function _KeyState() {
      this.keys = __bind(this.keys, this);
      this.event_handler = __bind(this.event_handler, this);
      this.clear = __bind(this.clear, this);
      this.pressed_keys = {};
    }

    _KeyState.prototype.clear = function() {
      return this.pressed_keys = {};
    };

    _KeyState.prototype.event_handler = function(event) {
      var down, keycode, up, _ref,
        _this = this;
      keycode = parseInt((_ref = event.which) != null ? _ref : event.keyCode);
      down = function() {
        if (_this.pressed_keys.hasOwnProperty(keycode)) {
          return false;
        }
        _this.pressed_keys[keycode] = event;
        return true;
      };
      up = function() {
        if (_this.pressed_keys.hasOwnProperty(keycode)) {
          delete _this.pressed_keys[keycode];
        }
        return true;
      };
      switch (event.type.toLowerCase()) {
        case 'keydown':
          return down();
        case 'keyup':
          return up();
      }
    };

    _KeyState.prototype.keys = function() {
      var describe, i, modifier_keys, regular_keys, _e,
        _this = this;
      describe = function(code) {
        var _ref;
        return (_ref = SHORTCUTS[code]) != null ? _ref : String.fromCharCode(code);
      };
      modifier_keys = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = MODIFIERS.length; _i < _len; _i++) {
          i = MODIFIERS[_i];
          if (this.pressed_keys.hasOwnProperty(i)) {
            _results.push(describe(i));
          }
        }
        return _results;
      }).call(this);
      regular_keys = ((function() {
        var _ref, _ref1, _results;
        _ref = this.pressed_keys;
        _results = [];
        for (i in _ref) {
          _e = _ref[i];
          if (_ref1 = parseInt(i), __indexOf.call(MODIFIERS, _ref1) < 0) {
            _results.push(parseInt(i));
          }
        }
        return _results;
      }).call(this)).sort().map(function(i) {
        return describe(i);
      });
      return modifier_keys.concat(regular_keys);
    };

    return _KeyState;

  })();

  /*
  Listen Key events.
  
  @param {Function} cb Handler called when key events occured.
      @param {String[]} keys Shortcut names of pressed keys.
      @param {Event} event
      @return {Boolean} if the value was false, the caller prevents default action and event propagation.
  @param {EventTarget} doc The target calls addEventListener().
  @param {Boolean} useCapture Passed into addEventListener().
  @param {(Element|String)[]} targets Key events to the target listed in this param can call callback handler.
      If the value was an empty array, events to any target will call callback handler.
  */


  listen = function(cb, doc, useCapture, targets) {
    var cancel, keydown_listener, keyup_listener, state, stop, t, target_elements, target_tagnames;
    if (doc == null) {
      doc = window;
    }
    if (useCapture == null) {
      useCapture = true;
    }
    if (targets == null) {
      targets = ['body', 'html'];
    }
    state = new _KeyState();
    cancel = function() {
      state.clear();
      return true;
    };
    if (targets != null ? targets.length : void 0) {
      target_tagnames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = targets.length; _i < _len; _i++) {
          t = targets[_i];
          if (typeof t === 'string') {
            _results.push(t.toLowerCase());
          }
        }
        return _results;
      })();
      target_elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = targets.length; _i < _len; _i++) {
          t = targets[_i];
          if (typeof t === 'object') {
            _results.push(t);
          }
        }
        return _results;
      })();
    }
    keydown_listener = function(event) {
      var isTargetElement, isTargetTagname;
      isTargetTagname = function() {
        var tagName;
        tagName = event.target.tagName.toLowerCase();
        return target_tagnames.some(function(t) {
          return t === tagName;
        });
      };
      isTargetElement = function() {
        return target_elements.some(function(t) {
          return t === event.target;
        });
      };
      if ((targets != null ? targets.length : void 0) && !(isTargetTagname() || isTargetElement())) {
        return true;
      }
      if (state.event_handler(event)) {
        if (cb(state.keys(), event) === false) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }
      return true;
    };
    keyup_listener = function(event) {
      return state.event_handler(event);
    };
    stop = function() {
      cancel();
      doc.removeEventListener('keydown', keydown_listener, useCapture);
      doc.removeEventListener('keyup', keyup_listener, useCapture);
      doc.removeEventListener('blur', cancel, useCapture);
      return doc.removeEventListener('focus', cancel, useCapture);
    };
    doc.addEventListener('keydown', keydown_listener, useCapture);
    doc.addEventListener('keyup', keyup_listener, useCapture);
    doc.addEventListener('blur', cancel, useCapture);
    doc.addEventListener('focus', cancel, useCapture);
    return {
      cancel: cancel,
      stop: stop
    };
  };

  this.hapt = {
    listen: listen
  };

}).call(this);
