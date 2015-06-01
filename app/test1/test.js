//Step 1: name the new module.
var newModule='myApp.test1';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/test1',
        ctrlName='Test1Ctrl',
        templateUrl='test1/test.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, function ($scope, viewLogic, model) {

        var testfn = function (valid, arg) {
            if(valid){
                $scope.view1.class1 = valid;
                console.log(arg);
            }
        };
        var testfn2= function (val){
            console.log(val, val==3);
            return val==3
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
            ["rule2", "path.path1", "path.path2", "path.path3", "path.path4"]
        ];
        var rule3 = [
            ["rule3", "path.path5", "path.path6", "path.path7", "path.path8"],
            ["view.class5=success5|", ">1", ">3", "==2", "==1"],
            ["view.class6=success6|", "==model.path.path8", "==model.path.path5", "==model.path.path6", "==model.path.path7"]
        ];


        model.init($scope, ['test1', 'path', 'view','view1']);

        var vlObj= new viewLogic.VLObj($scope);
        vlObj.add([rule, rule1],true, 'all');
        vlObj.add([rule2,rule3]);
    });
//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName
        });
    }]);

})(angular);
appDI.push(newModule);

