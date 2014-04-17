'user strict';

angular.module('PvP')
  .factory('Moves', function (firebaseUrl, $firebase, convertFirebase) {
    var moves = convertFirebase($firebase(new Firebase(firebaseUrl + 'moves')));

    function textualizeAttack(playerA, playerB, moveA, moveB, damageA, damageB) {
      return playerA + ' has taken ' + damageA + ' from ' + moveB + '; ' + playerB + ' has taken ' + damageB + ' from ' + moveA + '.';
    };

    function shieldProb(reverse) {
      var chance = Math.floor(Math.random()*2);
      if (chance == 0) {
        return reverse ? [2, 0] : [0, 2]; // Fails
      } else {
        var chance = Math.floor(Math.random()*5);
        if (chance < 2) {
          return [0, 0];
        } else {
          return reverse ? [0, 2] : [2, 0];
        }
      }
    }

    function damageMatrix(moveA, moveB) {
      console.log('damageMatrix', moveA, moveB);
      if ( moveA == 'Fire' ) {
        if ( moveB == 'Fire' ) {
          return [ 2, 2 ];
        } else if ( moveB == 'Water' ) {
          return [ 2, 1 ];
        } else if ( moveB == 'Lightning' ) {
          return [ 1, 2 ];
        } else if ( moveB == 'Shield' ) {
          return shieldProb();
        }
      } else if ( moveA == 'Water' ) {
        if ( moveB == 'Fire' ) {
          return [ 1, 2 ];
        } else if ( moveB == 'Water' ) {
          return [ 1, 1 ];
        } else if ( moveB == 'Lightning' ) {
          return [ 2, 1 ];
        } else if ( moveB == 'Shield' ) {
          return shieldProb();
        }
      } else if ( moveA == 'Lightning' ) {
        if ( moveB == 'Fire' )
          return [ 2, 1 ];
        else if ( moveB == 'Water' )
          return [ 1, 2 ];
        else if ( moveB == 'Lightning' ) {
          var chance = Math.floor(Math.random()*2);
          if ( chance == 0 ) {
            side = Math.floor(Math.random()*2);
            if ( side == 0 )
              return [ 3, 0 ];
            else if ( side == 1 )
              return [ 0, 3 ];
          } else if ( chance == 1 )
            return [ 2, 2 ];
        } else if ( moveB == 'Shield' ) {
          return shieldProb();
        }
      } else if ( moveA == 'Shield' ) {
        if ( moveB == 'Fire' ) {
          return shieldProb(true);
        } else if ( moveB == 'Water' ) {
          return shieldProb(true);
        } else if ( moveB == 'Lightning' ) {
          return shieldProb(true);
        } else if ( moveB == 'Shield' ) {
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
