<!doctype html>
<!--[if lt IE 7]>
<html class="no-js lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->
<!--[if IE 7]>
<html class="no-js lt-ie9 lt-ie8" lang=""> <![endif]-->
<!--[if IE 8]>
<html class="no-js lt-ie9" lang=""> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang=""> <!--<![endif]-->
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-117330143-1"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'UA-117330143-1');
        </script>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Foodiiz | A new way to socialise</title>
        <meta name="description" content="FOOD EXPERIENCES WITH LOCALS AROUND THE WORLD">
        <meta name="keywords" content="food, food sharing, foodiiz, social eating"/>
        <link rel="apple-touch-icon" sizes="180x180" href="<?php echo base_url(); ?>assets/images/favicons/favicon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="<?php echo base_url(); ?>assets/images/favicons/favicon.png">
        <link rel="icon" type="image/png" sizes="16x16" href="<?php echo base_url(); ?>assets/images/favicons/favicon.png">
        <link rel="manifest" href="<?php echo base_url(); ?>assets/images/favicons/manifest.json">
        <link rel="mask-icon" href="<?php echo base_url(); ?>assets/images/favicons/safari-pinned-tab.svg" color="#5bbad5">
        <meta name="theme-color" content="#ffffff">
        <!--For Facebook -->
        <meta property="og:url" content="http://www.foodiiz.com"/>
        <meta property="og:site_name" content="Foodiiz">
        <meta property="og:title" content="Foodiiz"/>
        <meta property="og:description" content="FOOD EXPERIENCES WITH LOCALS AROUND THE WORLD"/>
        <meta property="og:image" content="<?php echo base_url(); ?>assets/images/web_logo.png"/>
        <!-- for Twitter -->
        <meta name="twitter:card" content="summary"/>
        <meta name="twitter:title" content="Foodiiz"/>
        <meta name="twitter:description" content="FOOD EXPERIENCES WITH LOCALS AROUND THE WORLD"/>
        <meta name="twitter:image" content="<?php echo base_url(); ?>assets/images/web_logo.png"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <link rel="apple-touch-icon" href="<?php echo base_url(); ?>assets/images/favicons/favicon.png">
        <link rel="stylesheet" href="<?php echo base_url(); ?>dist/foodiiz.min.css">
        <base href="<?php echo base_url(); ?>"/>
        <script src="//cdnjs.cloudflare.com/ajax/libs/trix/0.9.2/trix.js"></script>
        <!-- domain -->
        <script type='text/javascript' src='https://platform-api.sharethis.com/js/sharethis.js#property=5ab53d6a0543f30013aa8e21&product=inline-share-buttons' async='async'></script>
        
        <!-- subdomain-->       
        <style type="text/css">
         @media only screen and (min-width: 320px) and (max-width: 479px) {
            .modal-open{
                position:fixed !important;
            } 
         }
        </style>
        <!--<script type='text/javascript' src='//platform-api.sharethis.com/js/sharethis.js#property=5ab53f0106061b00137e8972&product=inline-share-buttons' async="async"></script>-->
        <script>
            var baseURL = "<?php echo base_url(); ?>";
        </script>
    </head>
    <body ng-app="foodiiz">
        <!--  style="display: none;" -->
    <div class="loading-app">
        <span class="loading-spinner">
            <img ng-src="assets/images/loading2.gif">
        </span>
    </div>
    <div id="fb-root"></div>
    <toaster-container toaster-options="{'time-out': 3000, 'close-button':true, 'animation-class': 'toast-top-center'}"></toaster-container>
    <header class="navbar navbar-static-top bs-docs-nav white-base" id="top" role="banner" ng-controller="SearchController as search">
        <div id="header" class="container-fluid" ng-class="{'yellow': (!search.isHome && search.isAuthenticated), 'non-yellow':(!search.isHome && !search.isAuthenticated)}">
            <div class="navbar-header">
                <button class="navbar-toggle collapsed" type="button" data-toggle="collapse"
                        data-target=".bs-navbar-collapse" ng-click="search.isCollapsed = !search.isCollapsed">
                    <span class="sr-only">Menu</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <div>
                    <a href="<?php echo base_url(); ?>" class="navbar-brand">
                        <img title="Foodiiz" width="140" class="hidden-xs" height="64" ng-src="<?php echo base_url(); ?>assets/images/{{search.isHome ? 'top_logo' : 'top_logo(1)'}}.png">
                        <img title="Foodiiz" width="140" class="hidden-md hidden-lg" height="64" ng-src="<?php echo base_url(); ?>assets/images/top_logo(1).png">
                    </a>
                </div>
            </div>
            <nav class="navbar-collapse bs-navbar-collapse head_backclr" role="navigation" ng-class="{'collapse': search.isCollapsed}">
                <ul class="nav navbar-nav" style="margin: 0 -15px !important;">
                    <li>
                        <div class="search search_head">
                            <form id="search_form1" method="post"
                                  class="searchform_head" >
                                <i class="fa fa-search heaericon"></i>
                                <input type="text" id="searchTextField" name="searchbox" class="searchbox" ng-class="{'homeplaceholder': (search.isHome)}"
                                       placeholder="Where do you want to go?" autocomplete="off" ng-model="search.location"
                                       googleplace hostobject="search.searchobject" required>
                            </form>
                        </div>
                    </li>
                </ul>
                
                <ul ng-if="!search.isAuthenticated" class="nav navbar-nav navbar-right dropdown_list">
                    <li class="home-help" ng-click="search.login($index)">
                        <a href="javascript:void(0);">Log In</a>
                    </li>
                    <li class="home-help" ng-click="search.signUp($index)">
                        <a href="javascript:void(0);">Sign Up</a>
                    </li>
                    <li class="home-help become-a-host" ng-click="search.signUp($index)">
                        <a class="btn yellow" href="javascript:void(0);">{{ 'header_become_host' | translate}}</a>
                        <!--<a class="btn yellow" href="javascript:void(0);">BECOME A HOST</a>-->
                    </li>
                     <li class="home-help" ng-controller="GiftCardController as giftcard">
                        <!--<a class="btn yellow" href="javascript:void(0);">{{ 'header_become_host' | translate}}</a>-->
                        <a class="btn yellow" href="#" ng-click="giftcard.giftcard()">Gift Card</a>
                    </li>
                </ul>

                <ul ng-if="search.isAuthenticated" class="nav navbar-nav navbar-right dropdown_list">
                    <li class="become-a-host">
                        <a class="btn yellow" ui-sref="whyhost">{{ 'header_become_host' | translate}}</a>
                    </li>
                    <li class="dropdown browse-dropdown drop-list_2" id="user_dropdown">
                        <a class="dropdown-toggle rightsign sign1" href="#" data-toggle="dropdown" ng-class="{'namecolor': (!search.isHome)}" style="padding-top: 19px; padding-bottom: 19px;">
                            <img ng-src="{{ search.user.image_path}}" width="32" height="32">&nbsp;&nbsp;{{ search.user.first_name}}<span class="caret"></span>
                        </a>
                        <ul class="dropdown-menu sub-menu browse-submenu">
                            <li>
                                <a ui-sref="user_dashboard">Dashboard</a>
                            </li>
                            <li>
                                <a ui-sref="your_listings">My Food Experience</a>
                            </li>
                            <li>
                                <a ui-sref="notification">Inbox</a>
                            </li>
                            <li>
                                <a ui-sref="edit_user">Profile</a>
                            </li>
                            <li>
                                <a ui-sref="settings">Account Settings</a>
                            </li>
                            <li>
                                <a href="#" id="logout" ng-click="search.logout();">Logout</a>
                            </li>
                        </ul>
                    </li>
                    <!--responsive device open-->
                    <ul class="nav navbar-nav dropdown_list head_lists">
                        <li class="dropdown browse-dropdown" id="user_dropdown">
                            <a class="dropdown-toggle rightsign sign1" href="#" data-toggle="dropdown" style="padding-top: 11px; padding-bottom: 15px;">
                                <img ng-src="{{ search.user.image_path}}" width="32" height="32">&nbsp;&nbsp;{{ search.user.first_name}} <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu sub-menu browse-submenu">
                                <li>
                                    <a ui-sref="user_dashboard">Dashboard</a>
                                </li>
                                <li>
                                    <a ui-sref="your_listings">My Food Experience</a>
                                </li>
                                <li>
                                    <a ui-sref="notification">Inbox</a>
                                </li>
                                <li>
                                    <a ui-sref="edit_user">Profile</a>
                                </li>
                                <li>
                                    <a ui-sref="settings">Account Settings</a>
                                </li>
                                <li>
                                    <a href="#" id="logout" ng-click="search.logout();">Logout</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <li id="view_help" style="float:left;"> </li>
                </ul>
            </nav>
        </div>
    </header>
    <div id="main_content">
        <div ui-view></div>
    </div>
    <div id="footer" class="white-base" ng-controller="FooterController as footer">
        <div class="container footer-secondary">
            <div class="col-xs-12 col-sm-12 col-md-4">
                <div class="clsFloatLeft col-xs-12">
                    <div id="language">
                        <div class="football_img">
                            <i class="fa fa-globe img_lang"></i>
                        </div>
                        <div class="arrow_sym"></div>
                        <select id="language_drop" style="background-color: #FFFFFF;" ng-model="footer.selectedLanguage">
                            <option class="language option" value="en" id="language_selector_en" name="en">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;English</option>
                            <!--<option class="language option" value="fr" id="language_selector_fr" name="fr">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;French</option>
                            <option class="language option" value="it" id="language_selector_it" name="it">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Italian</option>
                            <option class="language option" value="gr" id="language_selector_gr" name="gr">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;German</option>
                            <option class="language option" value="po" id="language_selector_po" name="po">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Portuguese</option>
                            <option class="language option" value="es" id="language_selector_sp" name="sp">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Spanish</option>-->
                        </select>
                    </div>
                </div>
                <div class="clsFloatLeft col-xs-12">
                    <div id="currency" class="notranslate">
                        <select id="currency_drop" ng-model="footer.currency">
                            <option value="USD" name="USD" id="currency_selector_USD" class="currency option">$ USD</option>
                            <option value="GBP" name="GBP" id="currency_selector_GBP" class="currency option">£ GBP</option>
                            <option value="EUR" name="EUR" id="currency_selector_EUR" class="currency option">€ EUR</option>
                            <option value="AUD" name="AUD" id="currency_selector_AUD" class="currency option">$ AUD</option>
                            <option value="SGD" name="SGD" id="currency_selector_SGD" class="currency option">$ SGD</option>
                            <option value="SEK" name="SEK" id="currency_selector_SEK" class="currency option">kr SEK</option>
                            <option value="DKK" name="DKK" id="currency_selector_DKK" class="currency option">DKK</option>
                            <option value="MXN" name="MXN" id="currency_selector_MXN" class="currency option">$ MXN</option>
                            <option value="BRL" name="BRL" id="currency_selector_BRL" class="currency option">R$ BRL</option>
                            <option value="MYR" name="MYR" id="currency_selector_MYR" class="currency option">RM MYR</option>
                            <option value="PHP" name="PHP" id="currency_selector_PHP" class="currency option">P PHP</option>
                            <option value="CHF" name="CHF" id="currency_selector_CHF" class="currency option">€ CHF</option>
                            <option value="INR" name="INR" id="currency_selector_INR" class="currency option">₹ INR</option>
                            <option value="ARS" name="ARS" id="currency_selector_ARS" class="currency option">$ ARS</option>
                            <option value="CAD" name="CAD" id="currency_selector_CAD" class="currency option">$ CAD</option>
                            <option value="CNY" name="CNY" id="currency_selector_CNY" class="currency option">¥ CNY</option>
                            <option value="CZK" name="CZK" id="currency_selector_CZK" class="currency option">Kč CZK</option>
                            <option value="HKD" name="HKD" id="currency_selector_HKD" class="currency option">$ HKD</option>
                            <option value="HUF" name="HUF" id="currency_selector_HUF" class="currency option">Ft HUF</option>
                            <option value="IDR" name="IDR" id="currency_selector_IDR" class="currency option">Rp IDR</option>
                            <option value="ILS" name="ILS" id="currency_selector_ILS" class="currency option">₪ ILS</option>
                            <option value="JPY" name="JPY" id="currency_selector_JPY" class="currency option">¥ JPY</option>
                            <option value="KRW" name="KRW" id="currency_selector_KRW" class="currency option">₩ KRW</option>
                            <option value="NOK" name="NOK" id="currency_selector_NOK" class="currency option">kr NOK</option>
                            <option value="NZD" name="NZD" id="currency_selector_NZD" class="currency option">$ NZD</option>
                            <option value="PLN" name="PLN" id="currency_selector_PLN" class="currency option">zł PLN</option>
                            <option value="RUB" name="RUB" id="currency_selector_RUB" class="currency option">p RUB</option>
                            <option value="THB" name="THB" id="currency_selector_THB" class="currency option">฿ THB</option>
                            <option value="TRY" name="TRY" id="currency_selector_TRY" class="currency option">₺ TRY</option>
                            <option value="TWD" name="TWD" id="currency_selector_TWD" class="currency option">$ TWD</option>
                            <option value="VND" name="VND" id="currency_selector_VND" class="currency option">₫ VND</option>
                            <option value="ZAR" name="ZAR" id="currency_selector_ZAR" class="currency option">R ZAR</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="col-xs-6 col-sm-6 col-md-4" style="padding-left: 30px;">
                <h5>Discover </h5>
                <ul class="unstyled js-footer-links">
                    <li>
                        <a ui-sref="howitworks">How it works</a>
                    </li>
                    <li>
                        <a ui-sref="whyhost">Why Host?</a>
                    </li>
                    <li>
                        <a ui-sref="terms" >Terms &amp; Privacy</a>
                    </li>
                </ul>
            </div>
            <div class="col-xs-6 col-sm-6 col-md-4" style="padding-left: 30px;">
                <h5>Company</h5>
                <ul class="unstyled js-footer-links">
                    <li>
                        <a ui-sref="contact" >Contact us</a>
                    </li>
                    <li>
                        <a ui-sref="faq" >FAQ</a>
                    </li>
                    <li>
                        <a href="aboutus" >About Us</a>
                    </li>
                </ul>
            </div>
            <div class="col-md-offset-0 col-sm-offset-0 col-xs-12">
                <div class="joinus footer2">
                    <h5 style="text-align: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 21px; border-bottom: medium none ! important;">
                        Join us on</h5>
                    <ul class="unstyled js-external-links">
                        <li>
                            <a target="_blank" href="https://twitter.com/foodiizofficial"><i class="fa fa-twitter"></i></a>
                        </li>
                        <li>
                            <a target="_blank" href="https://www.facebook.com/foodiizofficial/"><i class="fa fa-facebook"></i></a>
                        </li>
                        <li>
                            <a target="_blank" href="https://www.instagram.com/foodiizofficiall/"><i
                                    class="fa fa-instagram"></i></a>
                        </li>
                        <!--<li>
                            <a target="_blank" href="http://www.youtube.com/results?search_query=foodiiz"><i
                                    class="fa fa-youtube-play"></i></a>
                        </li>-->
                    </ul>
                    <!--<div id="copyright footer_copy">Developed by <a style="color:white;" href="http://www.dynamis-soft.com/" target="_blank">Dynamis-Soft</a></div>-->
                    <div id="copyright footer_copy" style="font-size: 14px;">Copyright &copy; <?php echo date('Y'); ?> Foodiiz</div>
                </div>
            </div>
        </div>
        <a href="javascript:void(0);" id="scroll" title="Scroll to Top" style="display: none;">Top<span></span></a>
        <div>
            <ul class="pop_pos_foot">
                <li class="pop_footer" id="Notification_Popup_1" style="display: none;">
                    <a href="javascript:void(0);" id="Notification_close_1"><img
                            src="assets/images/sin_cal_close.gif">
                    </a>
                    <h1 class="pop_footer_head"></h1>
                    <p></p>
                </li>

            </ul>
        </div>
    </div>
    <script src="<?php echo base_url(); ?>dist/foodiiz.min.js"></script>
    <script type="text/javascript" src="//maps.googleapis.com/maps/api/js?libraries=places&language=en&key=AIzaSyAlBKh12s_s1g4VKZa5NDaXjIZt_ecCvIA"></script>

    <script src="<?php echo base_url(); ?>/assets/js/libs/gmapslatlonpicker.js" type="text/javascript"></script>
    <script>
        $(document).ready(function () {
            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $('#scroll').fadeIn();
                } else {
                    $('#scroll').fadeOut();
                }
            });
            $('#scroll').click(function () {
                $("html, body").animate({scrollTop: 0}, 600);
                return false;
            });
            window.fbAsyncInit = function() {
              FB.init({
                appId      : '390224281394264', // Set YOUR APP ID
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                xfbml      : true,  // parse XFBML
                version    : 'v2.0'
              });
            };
        });
        
        (function(d){
           var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
           if (d.getElementById(id)) {return;}
           js = d.createElement('script'); js.id = id; js.async = true;
           js.src = "//connect.facebook.net/en_US/all.js";
           ref.parentNode.insertBefore(js, ref);
         }(document));
         
    </script>
    <script>
        /*(function (b, o, i, l, e, r) {
         b.GoogleAnalyticsObject = l;
         b[l] || (b[l] =
         function () {
         (b[l].q = b[l].q || []).push(arguments)
         });
         b[l].l = +new Date;
         e = o.createElement(i);
         r = o.getElementsByTagName(i)[0];
         e.src = '//www.google-analytics.com/analytics.js';
         r.parentNode.insertBefore(e, r)
         }(window, document, 'script', 'ga'));
         ga('create', 'UA-XXXXX-X', 'auto');
         ga('send', 'pageview');*/
    </script>
    
    <script type="text/javascript">
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/5a8c9d3ad7591465c707da33/default';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
    </script>
</body>
</html>
