//Step 1: name the new module or use a random id.
window.newModule = window.randomString(8);

angular.module(window.newModule, ['firebase', 'myApp.config'])
//Step 2: replace 'serviceSeed' by the factory name you like.
    .factory('serviceSeed', ['FBURL', 'config', 'fbutil', '$firebaseObject', '$q', 'snippet', function (FBURL, config, fbutil, $firebaseObject, $q, snippet) {
        //start here
    }]);

if(window.appDI) window.appDI.push(window.newModule);