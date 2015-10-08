//Step 1: name the new module or use a random id.
window.newModule = "custom.services";

angular.module(window.newModule, ['firebase', 'myApp.config'])
//Step 2: replace 'serviceSeed' by the factory name you like.
    .factory('customFn', ['FBURL', 'config', 'fbutil', '$firebaseObject', '$q', 'snippet', function (FBURL, config, fbutil, $firebaseObject, $q, snippet) {
        var customFn={
        };
        return customFn
    }]);

if(window.appDI) window.appDI.push(window.newModule);
