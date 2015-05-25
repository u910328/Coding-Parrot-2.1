(function (angular) {
    "use strict";

    var app = angular.module('myApp.test1', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('Test1Ctrl', function ($scope, viewLogic, model) {
        var testfn = function (valid, arg) {
            if(valid){
                $scope.view1.class1 = valid;
                console.log(arg);
            }
        };
        var testfn2= function (val){
            console.log(val, val==2);
            return val==2
        };
        var rule = [
            ["result", "test1.path1", "test1.path2", "test1.path3"],
            ["test1.class1=success1|;test1.condition=1|", ">1", ">3", "==2"],
            ["test1.class2=success2|;test1.condition=2|", "", "==2", ""],
            ["test1.class3=success3|;test1.condition=3|", "", "", testfn2]
        ];

        var rule1 = [
            ["result", "test1.path1"],
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


        model.test1 = model.test1||{};
        model.path = model.path||{};
        model.view1 = {};

        $scope.test1 = model.test1;
        $scope.path = model.path;
        $scope.view = model.view;
        $scope.view1 = model.view1;


        var vlObj= new viewLogic.VLObj($scope);
        vlObj.add([rule, rule1],true);
        vlObj.add([rule2,rule3]);
    });

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/test1', {
            templateUrl: 'test1/test.html',
            controller: 'Test1Ctrl'
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

