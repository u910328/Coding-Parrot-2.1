
angular.module('obsidian', ['firebase','ui.router'])
    .factory('obsidian', /*@ngInject*/ function (/*injections*/) {
        //start here
    });


(function(){
    var obsidian={};
    obsidian.addResource=function(resource){
        var script = document.createElement("script");
        script.src = resource.src;
        document.getElementsByTagName("body")[0].appendChild(script);

        if (resource.css) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = resource.css;
            document.getElementsByTagName("head")[0].appendChild(link);
        }
    };

    obsidian.init=function(){
        for (var key in obsidian.sourcePaths) {
            if(obsidian.sourcePaths.hasOwnProperty(key)) obsidian.addResource(obsidian.sourcePaths[key]);
        }
    };




    obsidian.appDI = [
        'ngMaterial',
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

    obsidian.randomString = function (length) {
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
    return obsidian
})();
