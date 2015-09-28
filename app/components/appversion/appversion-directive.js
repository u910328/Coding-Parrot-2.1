'use strict';

window.newModule = 'myApp.appVersion';
angular.module(window.newModule,[])

    .directive('appVersion', ['version', function (version) {
        return function (scope, elm) {
            elm.text(version);
        };
    }]);

if(window.appDI) window.appDI.push(window.newModule);