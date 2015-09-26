'use strict';

var newModule = 'myApp.appVersion';

angular.module(newModule,[])

    .directive('appVersion', ['version', function (version) {
        return function (scope, elm) {
            elm.text(version);
        };
    }]);

if (appDI) appDI.push(newModule);