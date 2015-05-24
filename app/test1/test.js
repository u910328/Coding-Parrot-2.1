(function (angular) {
    "use strict";

    var app = angular.module('myApp.test1', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller('Test1Ctrl', function ($scope, viewLogic, model) {
        var testfn = function (valid, arg) {
            if(valid){
                $scope.view.class1 = valid;
                console.log(arg);
            }
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
            ["view.class4=success4|;view.condition=4|", "==2", "", "", ""]
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
            ["view.class6=success6|", "", "", "", "==3"],
            ["view.class7=success7|", "", "==7", "", ""],
            ["view.class8=success8|", "==model.path.path8", "==model.path.path5", "==model.path.path6", "==model.path.path7"]
        ];

        var setSubOpt= function(validity, subOption){
            if(!validity) return;
            console.log(model.test.selectedOption.name);
            $scope.test.subOptions=subOption;
            console.log(JSON.stringify(subOption))
        };

        var subOption1=[
            {name: 'sub1-1'},
            {name: 'sub1-2'}
        ];
        var subOption2=[
            {name: 'sub2-1'},
            {name: 'sub2-2'}
        ];

        var selectRule=[
            ["result", "test.selectedOption.name"],
            [[setSubOpt, subOption1], "=='main1'"],
            [[setSubOpt, subOption2], "=='main2'"]
        ];
        model.test = model.test||{};
        model.path = model.path||{};
        $scope.test = model.test;
        $scope.path = model.path;
        $scope.view = model.view;




        $scope.test.options=[
            {name: 'main1'},
            {name: 'main2'}
        ];

        $scope.test.selectedOption=$scope.test.options[0];


        var vlObj= new viewLogic.VLObj($scope);
        vlObj.add([rule, rule1,selectRule],true);
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

