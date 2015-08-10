'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp.config', [])

    // version of this seed app is compatible with angularFire 1.0.0
    // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
    .constant('version', '2.1.0')

    // where to redirect users if they need to authenticate (see security.js)
    .constant('loginRedirectPath', '/login')

    // your Firebase data URL goes here, no trailing slash
    .constant('FBURL', 'https://lauchbox.firebaseio.com')
    .constant('config', {
        debug:true
    })

    // double check that the app has been configured before running it and blowing up space and time
    .run(['FBURL', '$timeout', function (FBURL, $timeout) {
        if (FBURL.match('//INSTANCE.firebaseio.com')) {
            angular.element(document.body).html('<h1>Please configure app/config.js before running!</h1>');
            $timeout(function () {
                angular.element(document.body).removeClass('hide');
            }, 250);
        }
    }]);

var appDI=[
    'myApp.config',
    'myApp.security',
    'myApp.home',
    'myApp.account',
    'myApp.chat',
    'myApp.login',

    'core.snippet',
    'core.viewLogic',
    'core.model',
    'core.localFb',
    'core.binder',
    'core.driver',
    'core.action',
    'core.init'
];