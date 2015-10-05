window.newModule = 'core.factorySeed';

angular.module(window.newModule, ['firebase', 'myApp.config'])
    .factory('factoryName', /*@ngInject*/ function (/*injections*/) {
        //start here
    });

if (window.appDI) window.appDI.push(window.newModule);