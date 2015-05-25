(function (angular) {
    "use strict";

    var app = angular.module('myApp.test', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('TestCtrl', function ($scope, viewLogic, model) {
        var testfn = function (valid, arg) {
            if(valid){
                $scope.test.class1 = valid;
                console.log(arg);
            }
        };
        var testfn2= function (val){
            return val==3
        };
        var rule = [
            ["result", "test.path1", "test.path2", "test.path3"],
            ["test.class1=success1|", "==1", "", ""],
            ["test.class2=success2|", "==1", "==2", ""],
            ["test.class3=success3|", "==1", "==2", testfn2]
        ];

        var rule1 = [
            ["result", "test.path1"],
            [[testfn, 'arg input'],"==11"]
        ];

        var rule2 = [
            ["result", "path.path1", "path.path2", "path.path3", "path.path4"]
        ];
        var rule3 = [
            ["result", "path.path5", "path.path6", "path.path7", "path.path8"],
            ["view.class5=success5|", ">1", ">3", "==2", "==1"],
            ["view.class6=success6|", "==model.path.path8", "==model.path.path5", "==model.path.path6", "==model.path.path7"]
        ];

        model.test = model.test||{};
        model.path = model.path||{};
        $scope.test = model.test;
        $scope.path = model.path;
        $scope.view = model.view;


        var vlObj= new viewLogic.VLObj($scope);
        vlObj.add([rule, rule1],true, 'all');
        vlObj.add([rule2,rule3],false, 'all');
    });

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/test', {
            templateUrl: 'test/test.html',
            controller: 'TestCtrl'
            //resolve: {
            //  // forces the page to wait for this promise to resolve before controller is loaded
            //  // the controller can then inject `user` as a dependency. This could also be done
            //  // in the controller, but this makes things cleaner (controller doesn't need to worry
            //  // about auth status or timing of accessing data or displaying elements)
            //  user: ['Auth', function (Auth) {
            //    return Auth.$waitForAuth();
            //  }]
            //}
        });
    }]);

})(angular);

