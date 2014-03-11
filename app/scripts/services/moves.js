'user strict';

angular.module('PvP')
  .factory('Moves', function (firebaseUrl, $firebase, convertFirebase) {
    var moves = convertFirebase($firebase(new Firebase(firebaseUrl + 'moves')));

    function textualizeAttack(playerA, playerB, moveA, moveB, damageA, damageB) {
      return playerA + ' has taken ' + damageA + ' from ' + moveB + '; ' + playerB + ' has taken ' + damageB + ' from ' + moveA + '.';
    };

    function damageMatrix(moveA, moveB) {
      console.log(moveA, moveB);
      if ( moveA == 'volcano' ) {
        if ( moveB == 'volcano' ) {
          return [ 2, 2 ];
        } else if ( moveB == 'water' ) {
          return [ 2, 1 ];
        } else if ( moveB == 'lightning' ) {
          return [ 1, 2 ];
        } else if ( moveB == 'shield' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'water' ) {
        if ( moveB == 'volcano' ) {
          return [ 1, 2 ];
        } else if ( moveB == 'water' ) {
          return [ 1, 1 ];
        } else if ( moveB == 'lightning' ) {
          return [ 2, 1 ];
        } else if ( moveB == 'shield' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
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
            return [ 2, 0 ];
          } else if ( chance == 1 ) {
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
            return [ 0, 2 ];
          }
        }
      } else if ( moveA == 'shield' ) {
        if ( moveB == 'volcano' ) {
          var chance = Math.floor(Math.random()*3);
          if ( chance == 0 ) {
            return [ 0, 2 ];
          } else if ( chance == 1 ) {
            return [ 0, 0 ];
          } else if ( chance == 2 ) {
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

      damageMatrix: damageMatrix,
      textualizeAttack: textualizeAttack
    };
  });
