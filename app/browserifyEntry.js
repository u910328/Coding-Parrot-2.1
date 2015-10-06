//  $.../app/ browserify --entry browserifyEntry.js --outfile dist/app.js
'use strict';
require("./bower_components/angular-payments/lib/angular-payments.min.js");
require("./bower_components/angular-ui-validate/dist/validate.js");
require("./components/appversion/appversion-directive.js");
require("./components/auth/auth.js");
require("./components/firebase.utils/firebase.utils.js");
require("./components/ngcloak/ngcloak-decorator.js");
require("./components/filters/filters.js");
require("./components/security/security.js");
require("./components/ngcart/ngCart.js");
require("./components/notify/notify.js");
require("./components/ngFirebase/ngFirebase.js");
require("./components/inputMask/ui-mask.js");
require("./components/socialLinks/socialLinks.js");
require("./components/scrollpoint/scrollpoint.js");

require("./core/snippet.js");
require("./core/model.js");
require("./core/$firebase.js");
require("./core/init.js");
require("./core/linkFn.js");
require("./core/elasticSearch.js");

require("./custom/customService.js");

require("./pages/login/login.js");
require("./pages/account/account.js");
require("./pages/productDetail/productDetail.js");
require("./pages/home/home.js");
require("./pages/shoppingCart/shoppingCart.js");
require("./pages/myOrders/myOrders.js");
require("./pages/backEnd/backEnd.js");
require("./pages/test/test.js");
require("./pages/test2/test2.js");
require("./pages/invoice/invoice.js");
require("./pages/error/error.js");

require("./app.js");
