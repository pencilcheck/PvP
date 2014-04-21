/*globals define*/
define(['jquery', 'angular', 'app'], function($, angular, app) {
    'use strict';

    $(function() {
        angular.element().ready(function() {
            angular.bootstrap(document, [app['name']]);
        });
    });
});
