'use strict';
window.newModule = 'myApp.config';

// Declare app level module which depends on filters, and services
angular.module(window.newModule, [])

    // version of this seed app is compatible with angularFire 1.0.0
    // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
    .constant('version', '2.3.0')

    // where to redirect users if they need to authenticate (see security.js)
    .constant('loginRedirectState', 'login')


    // your Firebase data URL goes here, no trailing slash
    .constant('FBURL', 'https://lauchbox.firebaseio.com')
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

//window.onload = function () {
//    var script = document.createElement("script");
//    script.type = "text/javascript";
//    script.src = "http://www.telize.com/jsonip?callback=DisplayIP";
//    document.getElementsByTagName("head")[0].appendChild(script);
//};
//function DisplayIP(response) {
//    console.log("Your IP Address is " + response.ip);
//}

window.modulePaths = {
    //external modules
    angularPayments: {
        src: "bower_components/angular-payments/lib/angular-payments.min.js"
    },
    uiRouter: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.15/angular-ui-router.min.js"
    },
    uiValidate: {
        src: "bower_components/angular-ui-validate/dist/validate.js"
    },
    //bundle:{
    //    src: "dist/app.js"
    //}
    //core components
    appversion: {
        src: "components/appversion/appversion-directive.js"
    },
    errorHandler:{
        src: "components/errorHandler/error.js"
    },
    auth: {
        src: "components/auth/auth.js"
    },
    firebaseUtils: {
        src: "components/firebase.utils/firebase.utils.js"
    },
    ngcloak: {
        src: "components/ngcloak/ngcloak-decorator.js"
    },
    filters: {
        src: "components/filters/filters.js"
    },
    security: {
        src: "components/security/security.js"
    },
    ngCart: {
        src: "components/ngcart/ngCart.js"
    },
    notify: {
        src: "components/notify/notify.js",
        css: "components/notify/notify.css"
    },
    ngFirebase: {
        src: "components/ngFirebase/ngFirebase.js"
    },
    uiMask: {
        src: "components/inputMask/ui-mask.js"
    },
    socialLinks: {
        src: "components/socialLinks/socialLinks.js"
    },
    scrollpoint: {
        src: "components/scrollpoint/scrollpoint.js"
    },
    model: {
        src: "core/model.js"
    },
    snippet: {
        src: "core/snippet.js"
    },

    $firebase: {
        src: "core/$firebase.js"
    },
    linkFn: {
        src: "core/linkFn.js"
    },
    elasticSearch: {
        src: "core/elasticSearch.js"
    },
    init: {
        src: "core/init.js"
    },

    //custom
    customService:{
        src: "custom/service.js"
    },
    customFilter:{
        src: "custom/filter.js"
    },
    customDirective:{
        src: "custom/filter.js"
    },
    //pages
    login: {
        src: "pages/login/login.js"
    },
    account: {
        src: "pages/account/account.js"
    },
    productList: {
        src: "pages/productList/productList.js"
    },
    productDetail: {
        src: "pages/productDetail/productDetail.js"
    },
    home: {
        src: "pages/home/home.js"
    },
    shoppingCart: {
        src: "pages/shoppingCart/shoppingCart.js"
    },
    myOrders: {
        src: "pages/myOrders/myOrders.js"
    },
    backEnd: {
        src: "pages/backEnd/backEnd.js"
    },
    backEndOrders: {
        src: "pages/backEnd/orders/orders.js"
    },
    backEndProductManager: {
        src: "pages/backEnd/productManager/productManager.js"
    },
    test: {
        src: "pages/test/test.js"
    },
    test2: {
        src: "pages/test2/test2.js"
    },
    invoice: {
        src: "pages/invoice/invoice.js"
    },
    app: {
        src: "app.js"
    }

};

function addResource(resource){
    var script = document.createElement("script");
    script.src = resource.src;
    document.getElementsByTagName("body")[0].appendChild(script);

    if (resource.css) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = resource.css;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
}

for (var key in window.modulePaths) {
    if(window.modulePaths.hasOwnProperty(key)) addResource(window.modulePaths[key]);
}


window.appDI = [
    'ngMaterial',
    'ngMessages',
    'ngCart',
    'ngFirebase',
    'ngAnimate',
    'ngNotify',
    'ui.mask',
    'ui.router',
    'angularPayments',
    'socialLinks',
    'ui.scrollpoint'
];

window.randomString = function (length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
};

if (window.appDI) window.appDI.push(window.newModule);