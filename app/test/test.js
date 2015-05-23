(function (angular) {
    "use strict";

    var app = angular.module('myApp.test', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('TestCtrl', function ($scope, viewLogic, model) {
        var testfn = function (valid) {
            $scope.view.class1 = valid;
            console.log("testfn")
        };
        var testfn2= function (val){
            console.log(val, val==2);
            return val==2
        };
        var rule = [
            ["result", "test.path1", "test.path2", "test.path3", "test.path4"],
            ["view.class1=success1|;view.condition=1|", ">1", ">3", "==2", "==1"],
            ["view.class2=success2|;view.condition=2|", "", "", "", "==3"],
            ["view.class3=success3|;view.condition=3|", "", "", testfn2, ""],
            ["view.class4=success4|;view.condition=4|", "==2", "", "", ""],
            [testfn, "==10", "", "", ""]
        ];
        var rule2 = [
            ["result", "path.path1", "path.path2", "path.path3", "path.path4"]
        ];
        var rule3 = [
            ["result", "path.path5", "path.path6", "path.path7", "path.path8"],
            ["view.class1=success1|", ">1", ">3", "==2", "==1"],
            ["view.class2=success2|", "", "", "", "==3"],
            ["view.class3=success3|", "", "==model.path.path7", "==model.path.path6", ""],
            ["view.class4=success4|", "==2", "", "", ""]
        ];
        model.test = {};
        model.path = {};
        $scope.test = model.test;
        $scope.path = model.path;
        $scope.view = model.view;
        viewLogic.addPartialRule(rule, $scope, true);
        viewLogic.addPartialRule(rule2, $scope);
        viewLogic.addPartialRule(rule3, $scope);
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

