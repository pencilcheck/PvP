/*globals require*/
require.config({
    shim: {
        angular: {
            exports: 'angular'
        },
        'angular-sanitize': [
            'angular'
        ],
        'angular-route': [
            'angular'
        ],
        'angular-resource': [
            'angular'
        ],
        'angular-masonry': [
            'angular'
        ],
        'angular-facebook': [
            'angular'
        ],
        'angular-cookies': [
            'angular'
        ],
        'angular-bootstrap': [
            'angular'
        ],
        jquery: {
            exports: 'jQuery'
        },
        firebase: {
            exports: 'Firebase'
        },
        'firebase-simple-login': {
            deps: [
                'firebase'
            ],
            exports: 'FirebaseSimpleLogin'
        },
        underscore: {
            exports: '_'
        },
        'jquery-zclip': [
            'jquery'
        ],
        masonry: {
            exports: 'Masonry'
        }
    },
    paths: {
        famous: '../lib/famous',
        requirejs: '../lib/requirejs/require',
        almond: '../lib/almond/almond',
        'famous-polyfills': '../lib/famous-polyfills/index',
        angular: '../lib/angular/angular',
        underscore: '../lib/underscore/underscore',
        json3: '../lib/json3/lib/json3.min',
        'jquery-zclip': '../lib/jquery-zclip/jquery.zclip',
        jquery: '../lib/jquery/dist/jquery',
        firebase: '../lib/firebase/firebase',
        'es6-shim': '../lib/es6-shim/es6-shim',
        'es5-shim': '../lib/es5-shim/es5-shim',
        anima: '../lib/anima/anima',
        'angular-scenario': '../lib/angular-scenario/angular-scenario',
        'angular-sanitize': '../lib/angular-sanitize/angular-sanitize',
        'angular-route': '../lib/angular-route/angular-route',
        'angular-resource': '../lib/angular-resource/angular-resource',
        'angular-mocks': '../lib/angular-mocks/angular-mocks',
        'angular-masonry': '../lib/angular-masonry/angular-masonry',
        'angular-facebook': '../lib/angular-facebook/lib/angular-facebook',
        'angular-cookies': '../lib/angular-cookies/angular-cookies',
        'angular-bootstrap': '../lib/angular-bootstrap/ui-bootstrap-tpls',
        'firebase-simple-login': '../lib/firebase-simple-login/firebase-simple-login',
        moment: '../lib/moment/moment',
        'masonry-bridget': 'masonry-bridget',
        imagesloaded: 'http://imagesloaded.desandro.com/imagesloaded.pkgd',
        masonry: 'http://masonry.desandro.com/masonry.pkgd'
    },
    priority: [
        'angular'
    ]
});
require(['main']);
