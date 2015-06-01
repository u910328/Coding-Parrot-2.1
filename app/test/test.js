var newModule='myApp.test';

(function (angular) {
    "use strict";

    var route='/test',
        ctrlName='TestCtrl',
        templateUrl='test/test.html';

    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('TestCtrl', function ($scope, viewLogic, model) {
        var testfn = function (validity, arg) {
            if(validity){
                $scope.test.class1 = validity;
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
            ["rule2", "path.path1", "path.path2", "path.path3", "path.path4"]
        ];

        var rule3 = [
            ["rule3", "path.path5", "path.path6", "path.path7", "path.path8"],
            ["view.class5=success5|", ">1", ">3", "==2", "==1"],
            ["view.class6=success6|", "==model.path.path8", "==model.path.path5", "==model.path.path6", "==model.path.path7"]
        ];

        var def= function(){
            model.test.class1='';
            model.test.class2='';
            model.test.class3=''
        };

        model.init($scope, ['test', 'path', 'view']);


        var vlObj= new viewLogic.VLObj($scope);
        vlObj.add([rule, rule1],true, 'all', def);
        vlObj.add([rule2,rule3],false, 'all');
    });

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName
        });
    }]);

})(angular);
appDI.push(newModule);

