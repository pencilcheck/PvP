define(['angular'], function (angular) {
  'user strict'

  return angular.module('PvP.services.game', [])
    .factory('GameStates', function () {
      return {
        opened: 0,
        invitesSent: 1,
        started: 2,
        movesPicked: 3,
        finished: 4
      }
    })

    .factory('Game', function ($q, GameStates, Moves) {

      var Game = function (game) {
        this._game = game
        this._limit = 2
      }

      Game.prototype.raw = function () {
        return this._game
      }

      Game.prototype.opponentOf = function (userId) {
        // We assume there are only two participants
        for (var id in this._game.participants) {
          if (this._game.participants.hasOwnProperty(id)) {
            if (id != userId)
              return this._game.participants[id]
          }
        }
      }

      Game.prototype.player = function (id) {
        return this._game.participants[id]
      }

      Game.prototype.randomlySelectThreeMoves = function () {
        var selectedMoves = {}
        var moveKeys = Object.keys(Moves.moves)
        var select = Math.floor(Math.random()*moveKeys.length)
        while (!(moveKeys[select] in selectedMoves) && Object.keys(selectedMoves).length < 3) {
          selectedMoves[moveKeys[select]] = Moves.moves[moveKeys[select]]
        }
        return selectedMoves
      }

      Game.prototype.selectAttack = function (uid, moveKey, smackTalk) {
        this.raw().currentRound = this.raw().currentRound || {}
        this.raw().currentRound[uid] = {
          moveKey: moveKey,
          smackTalk: smackTalk
        }
        return this.$save()
      }

      Game.prototype.selectAttackAI = function () {
        var user = this.player('AI')
        var moveKeys = Object.keys(user.selectedMoves)
        var smackTalks = [
          "I don't want people to love me. It makes for obligations.",
          "The best way to save face is to keep the lower part shut.",
          "I firmly believe there is more to life than money, beer, and sex. I just don't know what it is.",
          "If you look like your passport picture, you probably need the trip! ",
          "How do you say constipated in German? ... Farfrumpoopen. ",
          "I'll give you a definite maybe.",
          "The greatest griefs are those we cause ourselves.",
          "Once you've tried to change the world you find it's a whole bunch easier to change your mind. ",
          "Spies cannot be usefully employed without a certain intuitive sagacity.",
          "If fighting is sure to result in victory, then you must fight, even though the ruler forbid it; if fighting will not result in victory, then you must not fight even at the ruler's bidding."
        ]

        return this.selectAttack(user.uid, moveKeys[Math.floor(Math.random()*moveKeys.length)], smackTalks[Math.floor(Math.random()*smackTalks.length)])
      }

      Game.prototype.initiateAI = function () {
        var user = {
          uid: 'AI',
          displayName: 'AI'
        }

        this._game.participants = this._game.participants || {}

        this._game.participants[user.uid] = {
          selectedMoves: this.randomlySelectThreeMoves(),
          health: 10,
          name: user.displayName,
          uid: user.uid,
        }

        this._game.mode = 'AI'

        this._game.state = GameStates.started

        return this._game.$save()
      }

      Game.prototype.$redeem = function (user) {
        var self = this

        this._game.participants = this._game.participants || {}

        if (this._game.participants && this._game.participants[user.uid]) {
          // Already redeemed and is on the list
          return self
        }

        if (this._game.mode == 'AI') {
          // AI mode, AI player already initiated
        } else {
          if (!this._game.invitations && this._game.state < GameStates.started) {
            // Open game, accept everyone
          } else if ((this._game.invitations && this._game.invitations.indexOf(user.uid) == -1) || this._game.state >= GameStates.started) {
            return $q.reject('Not invited or Game started')
          }
        }

        this._game.participants[user.uid] = {
          selectedMoves: {},
          health: 10,
          name: user.displayName,
          uid: user.uid,
        }

        if (_.keys(this._game.participants).length == this._limit) {
          this._game.state = GameStates.started
        }
        
        return this._game.$save().then(function () {
          return self
        })
      }

      Game.prototype.$save = function () {
        return this._game.$save()
      }

      Game.prototype.$invite = function (users) {
        this._game.invitations = this._game.invitations || []

        if (users.length + this._game.invitations.length > this._limit) {
          return $q.reject("Can't invite over the limit (" + this._limit + ")")
        }

        if (users.length == 0) {
          return $q.reject("Has to invite users")
        }

        var self = this
        users.forEach(function (user) {
          console.log('inviting', user)
          if (self._game.invitations.indexOf(user.uid) == -1) {
            self._game.invitations.push(user.uid)
          }
        })

        this._game.state = GameStates.invitesSent

        return this._game.$save().then(function () {
          return self
        })
      }

      return Game
    });
});
