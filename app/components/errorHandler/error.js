window.newModule = 'myApp.errorHandler';

(function (angular) {
    "use strict";

    var state = 'error',
        url = '/error/:errorId',
        ctrlName = 'errorCtrl',
        templateUrl = 'components/errorHandler/error.html';

    var app = angular.module(window.newModule, []);

    app.controller(ctrlName, /*@ngInject*/ function ($scope, $stateParams) {
        //create your own controller here
        $scope.error=$stateParams
    });

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state(state, {
            url: url,
            templateUrl: templateUrl,
            controller: ctrlName,
            resolve: {
                user: ['Auth', function (Auth) {
                    return Auth.$waitForAuth();
                }]
            }
        });
    }]);

    app.factory('$errorHandler', /*@ngInject*/ function ($state) {
        var errorType={

        };

        function openErrorPage(opt) {
            $state.go('error', opt);
            if (!$scope.$$phase) $scope.$apply(); //確保成功轉換頁面
        }

        return function(opt){
            var _opt=opt||{};
            if(!_opt.type){
                return function(error){
                    console.log(JSON.stringify(error));
                }
            } else if(_opt.openErrorPage){
                openErrorPage(_opt)
            }
        };
    });

})(angular);

if(window.appDI) window.appDI.push(window.newModule);