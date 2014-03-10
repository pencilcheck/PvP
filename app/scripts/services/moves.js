'user strict';

angular.module('PvP')
  .factory('Moves', function (firebaseUrl, $firebase, convertFirebase) {
    var moves = convertFirebase($firebase(new Firebase(firebaseUrl + 'moves')));

    var damageMatrix = function(moveA, moveB) {
      console.log(moveA, moveB);
      if ( moveA == 'volcano' ) {
        if ( moveB == 'volcano' ) {
          //$scope.explanation = 'Both player are damaged by fire';
          return [ 2, 2 ];
        } else if ( moveB == 'water' ) {
          //$scope.explanation = 'The attack both cancelled each other';
          return [ 0, 0 ];
        } else if ( moveB == 'lightning' ) {
          //$scope.explanation = '';
          return [ 1, 2 ];
        } else if ( moveB == 'shield' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            //$scope.explanation = 'shield field reflected the attack';
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            //$scope.explanation = 'shield field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            //$scope.explanation = 'shield field failed';
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'water' ) {
        if ( moveB == 'volcano' ) {
          //$scope.explanation = 'Water vaporates the heat';
          return [ 1, 2 ];
        } else if ( moveB == 'water' ) {
          //$scope.explanation = '';
          return [ 1, 1 ];
        } else if ( moveB == 'lightning' ) {
          //$scope.explanation = '';
          return [ 2, 1 ];
        } else if ( moveB == 'shield' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            //$scope.explanation = 'shield field reflected the attack';
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            //$scope.explanation = 'shield field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            //$scope.explanation = 'shield field failed';
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'lightning' ) {
        if ( moveB == 'volcano' )
          return [ 2, 1 ];
        else if ( moveB == 'water' )
          return [ 1, 2 ];
        else if ( moveB == 'lightning' ) {
          var chance = Math.floor(Math.random()*2);
          if ( chance == 0 ) {
            side = Math.floor(Math.random()*2);
            if ( side == 0 )
              return [ 3, 0 ];
            else if ( side == 1 )
              return [ 0, 3 ];
          } else if ( chance == 1 )
            return [ 2, 2 ];
        } else if ( moveB == 'shield' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            //$scope.explanation = 'shield field reflected the attack';
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            //$scope.explanation = 'shield field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            //$scope.explanation = 'shield field failed';
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'shield' ) {
        if ( moveB == 'volcano' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            //$scope.explanation = 'shield field reflected the attack';
            return [ 0, 2 ];
          } else if ( chance == 1 ) {
            //$scope.explanation = 'shield field cancelled the attack';
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            //$scope.explanation = 'shield field failed';
            return [ 2, 0 ];
          }
        } else if ( moveB == 'water' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 )
            return [ 0, 2 ];
          else if ( chance == 1 )
            return [ 0, 0 ];
          else if ( chance == 2 )
            return [ 2, 0 ];
        } else if ( moveB == 'lightning' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 )
            return [ 0, 2 ];
          else if ( chance == 1 )
            return [ 0, 0 ];
          else if ( chance == 2 )
            return [ 2, 0 ];
        } else if ( moveB == 'shield' ) {
          //$scope.explanation = 'Has no effect on each other...';
          return [ 0, 0 ];
        }
      }

      return [ 0, 0 ];
    };


    return {
      all: function () {
        return moves;
      },

      add: function (move) {
        return moves.$add(move);
      },

      get: function (id) {
        return moves[id];
      },

      damageMatrix: damageMatrix
    };
  });
