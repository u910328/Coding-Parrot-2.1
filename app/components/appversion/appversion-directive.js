'use strict';

obsidian.module('myApp.appVersion', [])
    .directive('appVersion', ['version', function (version) {
        return function (scope, elm) {
            elm.text(version);
        };
    }]);

