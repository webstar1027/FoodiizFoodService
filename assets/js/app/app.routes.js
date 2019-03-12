'use strict';
module.exports = routerConfig;

routerConfig.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];

function routerConfig($locationProvider, $stateProvider, $urlRouterProvider) {

    $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'assets/js/app/home/home.html',
                controller: 'HomeController',
                controllerAs: 'home',
                authenticate: false
            })
            .state('giftcard', {
                url: '/giftcard',
                templateUrl: 'assets/js/app/giftcard/giftcard.html',
                controller: 'GiftCardController',
                controllerAs: 'giftcard',
                authenticate: false
            })
            .state('search_hosts', {
                url: '/search/:city/:lat/:lng/:distance/:date',
                params: {
                    city: {value: null, squash: true},                    
                    lat: {value: null, squash: true},
                    lng: {value: null, squash: true},
                    distance: {value: null, squash: true}                   
                },
                templateUrl: 'assets/js/app/search/search.html',
                controller: 'SearchHostsController',
                controllerAs: 'search',
                authenticate: false
            })
            .state('view_event', {
                url: '/event/:event/:date',
                params: {
                    event: {value: null, squash: true},
                    date: {value: null, squash: true}
                },
                templateUrl: 'assets/js/app/events/view_event.html',
                controller: 'ViewEventController',
                controllerAs: 'event',
                authenticate: false
            })
            .state('view_itinerary', {
                url: '/itinerary/:token',
                params: {
                    token: {value: null, squash: true}
                },
                templateUrl: 'assets/js/app/events/event_itinerary.html',
                controller: 'ViewItineraryController',
                controllerAs: 'event',
                authenticate: true
            })
            .state('howitworks', {
                url: '/how-it-works',
                templateUrl: 'assets/js/app/how-it-works/how-it-works.html',
                authenticate: false
            })
            .state('socialconnections', {
                url: '/social-connections',
                templateUrl: 'assets/js/app/social-connections/social-connections.html',
                authenticate: false
            })
            .state('whyhost', {
                url: '/why-host',
                templateUrl: 'assets/js/app/why-host/why-host.html',
                authenticate: false
            })
            .state('hostcancellationpolicy', {
                url: '/host-cancellation-policy',
                templateUrl: 'assets/js/app/host-cancellation-policy/host-cancellation-policy.html',
                authenticate: false
            })
            .state('faq', {
                url: '/faq',
                templateUrl: 'assets/js/app/faq/faq.html',
                controller: 'FAQController',
                controllerAs: 'faq',
                authenticate: false
            })
            .state('responsiblehosting', {
                url: '/responsible-hosting',
                templateUrl: 'assets/js/app/responsible-hosting/responsible-hosting.html',
                authenticate: false
            })
            .state('terms', {
                url: '/terms',
                templateUrl: 'assets/js/app/terms/terms.html',
                authenticate: false
            })
            .state('policies', {
                url: '/policies',
                templateUrl: 'assets/js/app/policies/policies.html',
                authenticate: false
            })
            .state('aboutus', {
                url: '/about-us',
                templateUrl: 'assets/js/app/about-us/about-us.html',
                authenticate: false
            })
            .state('press', {
                url: '/press',
                templateUrl: 'assets/js/app/press/press.html',
                authenticate: false
            })
            .state('user_dashboard', {
                url: '/home/dashboard',
                templateUrl: 'assets/js/app/dashboard/dashboard.html',
                controller: 'DashboardController',
                controllerAs: 'dashboard',
                authenticate: true
            })
            .state('your_listings', {
                url: '/home/yourlistings',
                templateUrl: 'assets/js/app/hosts/your-listings.html',
                controller: 'HostsController',
                controllerAs: 'hosts',
                authenticate: true
            })
            .state('events_dates', {
                url: '/home/eventsdates',
                templateUrl: 'assets/js/app/hosts/eventsDates.html',
                controller: 'EventDatesController',
                controllerAs: 'events',
                authenticate: true
            })
            .state('hosts_new', {
                url: '/home/hostsnew/:data',
                templateUrl: 'assets/js/app/hosts/hosts-new.html',
                controller: 'HostsController',
                controllerAs: 'hosts',
                authenticate: true
            })
            .state('contact', {
                url: '/contact',
                templateUrl: 'assets/js/app/contact/contact.html',
                controller: 'ContactController',
                controllerAs: 'contact'
            })
            .state('edit_user', {
                url: '/users/edit',
                templateUrl: 'assets/js/app/users/edit-user.html',
                controller: 'UserController',
                controllerAs: 'users',
                authenticate: true
            })
            .state('settings', {
                url: '/users/settings',
                templateUrl: 'assets/js/app/users/user-settings.html',
                controller: 'UserController',
                controllerAs: 'users',
                authenticate: true
            })
            .state('view_user', {
                url: '/users/view/:id',
                params: {id: null},
                templateUrl: 'assets/js/app/users/view-user.html',
                controller: 'UserController',
                controllerAs: 'users',
                authenticate: false
            })
            .state('notification', {
                url: '/notification',
                templateUrl: 'assets/js/app/notification/notification.html',
                controller: 'NotificationController',
                controllerAs: 'notification',
                authenticate: true
            })
            .state('register_email', {
                url: '/confirm-your-email/:token',
                params: {token: {value: null, squash: true}},
                templateUrl: 'assets/js/app/users/confirm-your-email.html',
                controller: 'ConfirmationController',
                controllerAs: 'confirmation',
                authenticate: false
            })
            .state('recovery_password', {
                url: '/reset-password/:token',
                params: {token: {value: null, squash: true}},
                templateUrl: 'assets/js/app/users/reset-password.html',
                controller: 'PasswordController',
                controllerAs: 'password',
                authenticate: false
            })
            ;
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
}