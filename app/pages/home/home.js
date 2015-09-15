//Step 1: name the new module.
var newModule='myApp.home';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var state='home',
        url='/home',
        ctrlName='HomeCtrl',
        templateUrl='pages/home/home.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, function () {
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
appDI.push(newModule);