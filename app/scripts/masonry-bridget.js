define(['require', 'jquery', 'masonry'], function (require, $, Masonry) {
  'use strict';

  return require(['jquery-bridget/jquery.bridget'], function () {
    return $.bridget('masonry', Masonry);
  });
});
