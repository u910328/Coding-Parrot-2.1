//Step 1: name the new module or use a random id.
window.newModule = 'core.loader';

angular.module(window.newModule, [])
//Step 2: replace 'serviceSeed' by the factory name you like.
    .factory('serviceSeed', ['FBURL', 'config', 'fbutil', '$firebaseObject', '$q', 'snippet', function (FBURL, config, fbutil, $firebaseObject, $q, snippet) {
        //start here
    }])
    .directive();

if(window.appDI) window.appDI.push(window.newModule);