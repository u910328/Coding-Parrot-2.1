

//Step 1: name the new module.
window.newModule='pages.home';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state='home',
        url='/home',
        ctrlName='HomeCtrl',
        templateUrl='pages/home/home.html';

//Step 3: write down dependency injection.
    var app = angular.module(window.newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, /*@ngInject*/ function ($scope, $state) {
        //
        console.log($state.data);

        $scope.test= function () {
            $state.goWithData('test2',{},{a:'a',b:'b'})
        }
    });

//Step 5: config providers.
    app.config(['$stateProvider',function($stateProvider){
        $stateProvider.state(state, {
            url: url,
            templateUrl: templateUrl,
            controller: ctrlName
        });
    }]);

})(angular);

if(window.appDI) window.appDI.push(window.newModule);