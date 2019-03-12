window.$ = require('jquery');
window.jQuery = $;
window._ = require('lodash');
window.moment = require('moment');
window.CryptoJS = require('crypto-js');

var angular = require('angular');
var ng_animate = require('angular-animate');
var ng_bootstrap = require('angular-ui-bootstrap');
var ng_messages = require('angular-messages');
var ng_resource = require('angular-resource');
var ng_sanitize = require('angular-sanitize'); // angular-sanitize used by angular-translate
var ng_translate = require('angular-translate');
var ng_translate_locale = require('angular-dynamic-locale');
var ng_translate_files = require('angular-translate-loader-static-files');
var ng_router = require('angular-ui-router');
var ng_toaster = require('angularjs-toaster');
var ng_stripe = require('angular-stripe');
var mdp = require('multiple-date-picker');
var ng_trix = require('angular-trix');
require('jquery-touchswipe/jquery.touchSwipe.min');
require('angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min');
require('angular-file-upload/dist/angular-file-upload');
require('../../js/libs/bootstrap-datetimepicker');
require('angular-ui-bootstrap/dist/ui-bootstrap-tpls.js');
require('angular-trix/dist/angular-trix.js');
require('../../js/libs/slider');
require('angular-translate-handler-log');
require('jquery-touchswipe/jquery.touchSwipe.min'); 

angular.module('foodiiz', [ng_animate, ng_bootstrap, ng_router, ng_resource, ng_messages, ng_sanitize, 'pascalprecht.translate', ng_translate_locale, ng_translate_files, ng_toaster, 'ng-bootstrap3-datepicker', 'angularFileUpload', 'angularjs-dropdown-multiselect', mdp, ng_stripe, 'ui.bootstrap-slider', 'angularTrix'])
        .config(require('./app.routes.js'))
        .controller('ModalInstanceCtrl', require('./modal/modalCtrl'))
        .controller('ratingCtrl', require('./modal/ratingCtrl'))
        .controller('NotificationController', require('./notification/notificationCtrl'))
        .controller('HomeController', require('./home/homeCtrl'))
        .controller('SearchController', require('./globals/navCtrl'))
        .controller('FooterController', require('./globals/footerCtrl'))
        .controller('SearchHostsController', require('./search/searchHost'))
        .controller('ViewEventController', require('./events/viewEventCtrl'))
        .controller('ViewItineraryController', require('./events/eventItineraryCtrl'))
        .controller('DashboardController', require('./dashboard/dashboardCtrl'))
        .controller('HostsController', require('./hosts/hostsCtrl'))
        .controller('GiftCardController', require('./giftcard/giftcardCtrl'))
        .controller('EventDatesController', require('./hosts/eventsDatesCtrl'))
        .controller('UserController', require('./users/userCtrl'))
        .controller('ConfirmationController', require('./users/emailConfirmationCtrl'))
        .controller('PasswordController', require('./users/passwordResetCtrl'))
        .controller('ContactController', require('./contact/contactCtrl'))
        .controller('FAQController', require('./faq/faqCtrl'))
        .directive('googleplace', require('../directives/googleplace.directive'))
        .directive('file', require('../directives/fileInput'))
        .directive('ngThumb', require('../directives/ngThumb'))
        .directive('creditCardType', require('../directives/creditCard.directive'))
        .directive('onlyNumbers', require('../directives/onlyNumbers.directive'))
        .directive('numbersOnly', require('../directives/numbersOnly.directive'))
        .directive('pwCheck', require('../directives/pwCheck.directive'))
        .directive('emailExists', require('../directives/emailExist.directive'))
        .directive('scroll', require('../directives/scroll.directive'))
        .directive('slideShow', require('../directives/slideShow.directive'))
        .directive('checkStrength', require('../directives/checkStrength.directive'))
        .service('UsersService', require('../services/users'))
        .service('HostsService', require('../services/hosts'))
        .service('NotificationService', require('../services/notification'))
        .service('AuthenticationService', require('../services/authentication'))
        .service('ContactService', require('../services/contact'))
        .factory('TranslationService', require('../services/translation'))
        .filter('currency_translate', require('../filters/currencySymbol.filter'))
        .run(function ($rootScope, $state, AuthenticationService, toaster) {
            $rootScope.currentUser = null;
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                if (navigator.onLine) {
                    AuthenticationService.isAuthenticated().then(function (response) {
                        if (toState.authenticate && !response.data.session) {
                            $state.transitionTo("home");
                            $rootScope.$broadcast('non-authenticate');
                            event.preventDefault();
                        } else if (toState.authenticate && !!response.data.user && (response.data.user.active === 0)) {
                            $rootScope.currentUser = null;
                            toaster.pop('warning', "Error", "Your account is suspended, please contact us for more info.", 4000);
                            $state.transitionTo("home");
                            event.preventDefault();
                        } else {
                            angular.element("html, body").animate({scrollTop: 0}, 600);
                            $rootScope.currentUser = !!response.data.user.id ? response.data.user : null;
                            $rootScope.globalSettings = response.data.user;
                        }
                    });
                    setTimeout(function () {
                        angular.element('.loading-app').hide();
                    }, 500);
                } else {
                    toaster.pop('warning', "Warning", "No internet connection.", 4000);
                }
            });
        })
        .config(function (stripeProvider, $translateProvider) {
            stripeProvider.setPublishableKey('pk_live_ihbR6DUKm1BU29a6mWkx8tqm');
            $translateProvider.useStaticFilesLoader({
                prefix:  baseURL + 'assets/js/translations/',
                suffix: '.json'
            });
            $translateProvider.preferredLanguage('en');
            $translateProvider.useSanitizeValueStrategy('sanitize');
        });