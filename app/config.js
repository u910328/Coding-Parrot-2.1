'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp.config', [])

    // version of this seed app is compatible with angularFire 1.0.0
    // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
    .constant('version', '2.3.0')

    // where to redirect users if they need to authenticate (see security.js)
    .constant('loginRedirectState', 'login')


    // your Firebase data URL goes here, no trailing slash
    .constant('FBURL', 'https://frecome.firebaseio.com')
    .constant('config', {
        debug: true,
        shipping: 0,
        taxRate: 0
    })
    .config(function ($mdIconProvider) {
        $mdIconProvider
            .defaultIconSet('img/icons/sets/core-icons.svg', 24);
    })

    // double check that the app has been configured before running it and blowing up space and time
    .run(['FBURL', '$timeout', '$http', function (FBURL, $timeout, $http) {
        if (FBURL.match('//INSTANCE.firebaseio.com')) {
            angular.element(document.body).html('<h1>Please configure app/config.js before running!</h1>');
            $timeout(function () {
                angular.element(document.body).removeClass('hide');
            }, 250);
        }

    }]);


var appDI = [
    'ngMaterial',
    'ngCart',
    'ngFirebase',
    'ngAnimate',
    'ngNotify',
    'ui.mask',
    'ui.router',
    'angularPayments',
    'socialLinks',
    'ui.scrollpoint',

    'myApp.config'
    //'myApp.security'
];

function randomString(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
