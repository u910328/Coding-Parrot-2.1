//Step 1: name the new module.
var newModule = 'myApp.test';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route = '/test',
        ctrlName = 'TestCtrl',
        templateUrl = 'pages/test/test.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, []);

//Step 4: construct a controller.
    app.controller(ctrlName, ['$scope', 'fbutil', 'localFb', 'snippet', 'elasticSearch', function ($scope, fbutil, localFb, authData, snippet, elasticSearch) {
        $scope.loaded=function(value){
            console.log(value);
        };
        $scope.test= function () {
            localFb.getMultipleRefVal({
                path1:'test/path1',
                path2:'test/path2/&path1',
                path3:'test/path3/&path1/&path2'
            }).then(function(res){
                $scope.result=res
            })
        };
        $scope.path='products';
        $scope.id='bd_001';
    }]);

//Step 5: config providers.
    app.config(function($stateProvider){
            $stateProvider.state('test', {
                templateUrl: templateUrl,
                controller: ctrlName
            });
        });

})(angular);
appDI.push(newModule);