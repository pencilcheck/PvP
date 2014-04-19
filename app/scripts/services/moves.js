'user strict';

angular.module('PvP')
  .factory('Moves', function (firebaseUrl) {
    var moves = {
      fire: {
        attackCss: 'fire-attack',
        moveCss: 'fire-move',
        name: 'Fire',
        src: 'images/buttons/volcanobutton.png'
      },
      lightning: {
        attackCss: 'lightning-attack',
        moveCss: 'lightning-move',
        name: 'Lightning',
        src: 'images/buttons/lightningbutton.png'
      },
      water: {
        attackCss: 'water-attack',
        moveCss: 'water-move',
        name: 'Water',
        src: 'images/buttons/waterbutton.png'
      },
      shield: {
        attackCss: 'shield-attack',
        moveCss: 'shield-move',
        name: 'Shield',
        src: 'images/buttons/magneticfieldbutton.png'
      }
    }

    function initials(name) {
      return name.split(' ').map(function (word) {
        return word[0] + '.'
      }).join(' ')
    }

    function textualizeAttack(playerA, playerB, moveA, moveB, damageA, damageB) {
      return initials(playerA) + ' has taken ' + damageA + ' from ' + moveB + ' :: ' + initials(playerB) + ' has taken ' + damageB + ' from ' + moveA + '.';
    };

    function shieldProb(reverse) {
      var chance = Math.floor(Math.random()*100);
      if (chance <= 60) {
        return reverse ? [2, 0] : [0, 2]; // Fails
      } else {
        var chance = Math.floor(Math.random()*40);
        if (chance <= 30) {
          return [0, 0];
        } else {
          return reverse ? [0, 2] : [2, 0];
        }
      }
    }

    // TODO: move to firebase
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
      moves: moves,
      damageMatrix: damageMatrix,
      textualizeAttack: textualizeAttack
    };
  });
