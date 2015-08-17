//Step 1: name the new module.
var newModule='myApp.chat';

(function (angular) {
    "use strict";

//Step 2: set route, ctrlName and templateUrl.
    var route='/chat',
        ctrlName='ChatCtrl',
        templateUrl='pages/chat/chat.html';

//Step 3: write down dependency injection.
    var app = angular.module(newModule, ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'core.model']);

//Step 4: construct a controller.
    app.controller(ctrlName, ['$scope', 'messageList', function($scope, messageList) {
        $scope.messages = messageList;
        $scope.addMessage = function(newMessage) {
            if( newMessage ) {
                $scope.messages.$add({text: newMessage});
            }
        };
    }]);

    app.factory('messageList', ['fbutil', '$firebaseArray', function(fbutil, $firebaseArray) {
        var ref = fbutil.ref('messages').limitToLast(10);
        return $firebaseArray(ref);
    }]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/chat', {
            templateUrl: 'chat/chat.html',
            controller: 'ChatCtrl'
        });
    }]);

//Step 5: config providers.
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when(route, { // user whenAuthenticated instead of when if you need this page can only be seen by logged in user. user who did not log in will be redirected to the default route. (loginRedirectPath in config.js)
            templateUrl: templateUrl,
            controller: ctrlName,
            resolve: {
              // forces the page to wait for this promise to resolve before controller is loaded
              // the controller can then inject `user` as a dependency. This could also be done
              // in the controller, but this makes things cleaner (controller doesn't need to worry
              // about auth status or timing of accessing data or displaying elements)
              user: ['Auth', function (Auth) {
                return Auth.$waitForAuth();
              }]
            }
        });
    }]);

})(angular);
appDI.push(newModule);