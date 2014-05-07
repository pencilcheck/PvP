define(['moment'], function (moment) {
  'user strict';

  return function () {
    return function (timestamp) {
      return timestamp ? moment(timestamp).format('MMMM Do YYYY, h:mm:ss a') : ''
    }
  };
});
