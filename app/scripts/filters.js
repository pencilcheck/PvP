'user strict';

angular.module('PvP')

.filter('calendar', function () {
  return function (timestamp) {
    return timestamp ? moment(timestamp).format('MMMM Do YYYY, h:mm:ss a') : ''
  }
})
