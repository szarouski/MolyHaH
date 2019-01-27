(function() {
  var BINDING_DESCRIPTIONS, CONFIG_DESCRIPTIONS, MODIFIERS, app,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CONFIG_DESCRIPTIONS = [
    {
      name: 'symbols',
      description: 'Hint characters'
    }
  ];

  BINDING_DESCRIPTIONS = [
    {
      name: 'enterHah',
      description: 'Enter HaH mode'
    }, {
      name: 'enterHahBg',
      description: 'Enter HaH mode (new tabs)'
    }, {
      name: 'quitHah',
      description: 'Quit HaH mode'
    }, {
      name: 'toggleAbility',
      description: 'Disable entering HaH mode'
    }
  ];

  MODIFIERS = ['Shift', 'Ctrl', 'Alt', 'Command', 'Meta'];

  app = angular.module('options', []).config(function($routeProvider) {
    $routeProvider.when('/', {
      redirectTo: '/settings'
    });
    return $routeProvider.when('/settings', {
      templateUrl: 'settingsView.html'
    });
  });

  app.directive('settings', function() {
    return {
      restrict: 'E',
      transclude: false,
      scope: {},
      templateUrl: 'settings.html',
      replace: false,
      controller: function($scope) {
        var leaveTabHandler, loadSettings, onLeaveTab, onRemoveTab;
        loadSettings = function(settings) {
          var convertIntoArray;
          convertIntoArray = function(options, descriptions) {
            var description, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = descriptions.length; _i < _len; _i++) {
              description = descriptions[_i];
              _results.push({
                description: description.description,
                name: description.name,
                val: _.clone(options[description.name])
              });
            }
            return _results;
          };
          return $scope.$apply(function() {
            $scope.settings = settings;
            $scope.configs = convertIntoArray(_.omit(settings, 'bindings'), CONFIG_DESCRIPTIONS);
            return $scope.bindings = convertIntoArray(settings['bindings'], BINDING_DESCRIPTIONS);
          });
        };
        chrome.runtime.sendMessage({
          type: 'getSettings'
        }, loadSettings);
        onLeaveTab = function(cb) {
          return chrome.tabs.getCurrent(function(tab) {
            var prev_tab_id;
            prev_tab_id = null;
            return chrome.tabs.onActivated.addListener(function(activeInfo) {
              if ((prev_tab_id == null) || prev_tab_id === tab.id) {
                cb();
              }
              return prev_tab_id = activeInfo.tabId;
            });
          });
        };
        onRemoveTab = function(cb) {
          return window.addEventListener('beforeunload', function() {
            cb();
          });
        };
        leaveTabHandler = function() {
          var convertIntoObject, settings;
          $scope.$broadcast('leaveTab');
          if (!$scope.hasOwnProperty('settings')) {
            return;
          }
          convertIntoObject = function(options) {
            var obj, option, _i, _len;
            obj = {};
            for (_i = 0, _len = options.length; _i < _len; _i++) {
              option = options[_i];
              obj[option.name] = option.val;
            }
            return obj;
          };
          settings = _.extend(convertIntoObject($scope.configs), {
            bindings: convertIntoObject($scope.bindings)
          });
          if (!_.isEqual($scope.settings, settings)) {
            return chrome.runtime.sendMessage({
              type: 'setSettings',
              settings: settings
            }, loadSettings);
          }
        };
        onLeaveTab(leaveTabHandler);
        return onRemoveTab(leaveTabHandler);
      }
    };
  });

  app.directive('configs', function() {
    return {
      restrict: 'E',
      transclude: false,
      scope: true,
      templateUrl: 'configs.html',
      replace: false
    };
  });

  app.directive('bindings', function() {
    return {
      restrict: 'E',
      transclude: false,
      scope: true,
      templateUrl: 'bindings.html',
      replace: false,
      controller: function($scope) {
        var listen;
        $scope.editing = null;
        listen = function() {
          return $scope.listener = hapt.listen(function(keys) {
            $scope.$apply(function() {
              var binding, index, _ref, _ref1;
              _ref = $scope.editing, binding = _ref.binding, index = _ref.index;
              binding.val[index] = keys;
              if (_ref1 = keys.slice(-1)[0], __indexOf.call(MODIFIERS, _ref1) < 0) {
                return $scope.finishEditing();
              }
            });
            return false;
          }, window, true, ['body', 'html', 'button', 'a']);
        };
        $scope.$on('leaveTab', function(event) {
          return $scope.$apply(function() {
            return $scope.finishEditing();
          });
        });
        $scope.finishEditing = function() {
          var binding, index, _ref, _ref1;
          if ((_ref = $scope.listener) != null) {
            _ref.stop();
          }
          if ($scope.editing == null) {
            return;
          }
          _ref1 = $scope.editing, binding = _ref1.binding, index = _ref1.index;
          $scope.editing = null;
          if (binding.val[index].every(function(s) {
            return __indexOf.call(MODIFIERS, s) >= 0;
          })) {
            return binding.val.splice(index, 1);
          } else if (_.range(binding.val.length).some(function(i) {
            return i !== index && _.isEqual(binding.val[i], binding.val[index]);
          })) {
            return binding.val.splice(index, 1);
          }
        };
        $scope.clickShortcut = function(event, binding_index, index) {
          var binding, editing;
          binding = $scope.bindings[binding_index];
          editing = $scope.editing;
          $scope.finishEditing();
          if (!_.isEqual({
            binding: binding,
            index: index
          }, editing)) {
            $scope.editing = {
              binding: binding,
              index: index
            };
            listen();
          }
          return false;
        };
        $scope.clickRemove = function(event, binding_index, index) {
          var binding;
          binding = $scope.bindings[binding_index];
          binding.val[index] = [];
          $scope.finishEditing();
          return false;
        };
        return $scope.clickAddition = function(event, binding_index) {
          var binding;
          binding = $scope.bindings[binding_index];
          $scope.finishEditing();
          $scope.editing = {
            binding: binding,
            index: binding.val.length
          };
          binding.val.push([]);
          listen();
          return false;
        };
      }
    };
  });

}).call(this);
