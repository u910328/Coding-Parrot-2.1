var newModule='myApp.test2';

(function (angular) {
    "use strict";

    var route='/test2',
        ctrlName='Test2Ctrl',
        templateUrl='test2/test.html';

    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

    app.controller(ctrlName, function ($scope, viewLogic, model) {

        model.test2 = {};
        $scope.test2 = model.test2;

        $scope.test2.options=[
            {name: 'main1'},
            {name: 'main2'}
        ];

        $scope.test2.selectedOption=$scope.test2.options[0];

        var subOption1=[
            {name: 'sub1-1'},
            {name: 'sub1-2'}
        ];
        var subOption2=[
            {name: 'sub2-1'},
            {name: 'sub2-2'}
        ];

        var setSubOpt= function(validity, option){
            if(!validity) return;
            $scope.test2.subOptions=option;
            $scope.test2.selectedSubOption=$scope.test2.subOptions[0];
        };

        var subSubOption1=[
            {name: 'subSubX-1-1'},
            {name: 'subSubX-1-2'}
        ];

        var subSubOption2=[
            {name: 'subSubX-2-1'},
            {name: 'subSubX-2-2'}
        ];

        var setSubSubOpt= function(validity, option){
            if(!validity) return;
            $scope.test2.subSubOptions=option;
            $scope.test2.selectedSubSubOption=$scope.test2.subSubOptions[0];
        };


        var selectRule=[
            ["result", "test2.selectedOption.name"],
            [[setSubOpt, subOption1], "=='main1'"],
            [[setSubOpt, subOption2], "=='main2'"]
        ];

        var selectRule1=[
            ["result", "test2.selectedSubOption.name"],
            [[setSubSubOpt, subSubOption1], "=='sub1-1'"],
            [[setSubSubOpt, subSubOption1], "=='sub2-1'"],
            [[setSubSubOpt, subSubOption2], "=='sub1-2'"],
            [[setSubSubOpt, subSubOption2], "=='sub2-2'"]
        ];


        var vlObj= new viewLogic.VLObj($scope);
        vlObj.add([selectRule,selectRule1],true);
    });

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, {
            templateUrl: templateUrl,
            controller: ctrlName
        });
    }]);

})(angular);

appDI.push(newModule);
