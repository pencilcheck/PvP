"use strict";angular.module("planetRusApp",["ngCookies","ngResource","ngSanitize","ngRoute","firebase"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/login",{templateUrl:"views/login.html",controller:"LoginCtrl"}).when("/lobby",{templateUrl:"views/lobby.html",controller:"LobbyCtrl"}).when("/game",{templateUrl:"views/game.html",controller:"GameCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("planetRusApp").controller("MainCtrl",["$scope","$firebase",function(a,b){a.games=b(new Firebase("https://pvp.firebaseio.com/games")),a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.add=function(){a.games.$add({title:"test"}),a.games.$add({title:"test2"}),a.games.$add({title:"test3"})}}]),angular.module("planetRusApp").controller("LoginCtrl",["$scope","$rootScope","$location",function(a,b,c){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.loggedIn=!1,a.openLogin=function(){var c=new Firebase("https://pvp.firebaseio.com");a.auth=new FirebaseSimpleLogin(c,function(c,d){c?console.log(c):d&&(console.log("User ID: "+d.id+", Provider: "+d.provider),b.user=d,b.$apply(),a.greetUser())}),a.auth.login("facebook",{rememberMe:!0,scope:"email,user_likes"})},a.greetUser=function(){a.user=b.user,a.loggedIn=!0,a.greeting="Hi "+a.user.displayName,a.userName=a.user.link,a.profilePic="http://graph.facebook.com/"+a.user.link.split("https://www.facebook.com/")[1].trim()+"/picture",a.$apply()},a.loadGame=function(){console.log(c.path("lobby"))}}]),angular.module("planetRusApp").controller("LobbyCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("planetRusApp").controller("GameCtrl",["$scope",function(a){a.playerA={lastMove:"",moveHistory:[],health:10,name:"Left"},a.playerB={lastMove:"",moveHistory:[],health:10,name:"Right"},a.fight=function(){if(a.playerA.lastMove&&a.playerB.lastMove){a.playerA.moveHistory.push(a.playerA.lastMove),a.playerB.moveHistory.push(a.playerB.lastMove);var b=a.damage(a.playerA.lastMove,a.playerB.lastMove);a.playerA.health-=b[0],a.playerB.health-=b[1],a.result="Player "+a.playerA.name+" used "+a.playerA.lastMove+", Player "+a.playerB.name+" used "+a.playerB.lastMove+"!"}else alert("Each player has to select a move")},a.damage=function(b,c){if("volcano"==b){if("volcano"==c)return a.explanation="Both player are damaged by fire",[2,2];if("water"==c)return a.explanation="The attack both cancelled each other",[0,0];if("light"==c)return a.explanation="",[1,2];if("magnetic"==c){var d=Math.floor(3*Math.random());if(0==d)return a.explanation="Magnetic field reflected the attack",[2,0];if(1==d)return a.explanation="Magnetic field cancelled the attack",[0,0];if(2==d)return a.explanation="Magnetic field failed",[0,2]}}else if("water"==b){if("volcano"==c)return a.explanation="Water vaporates the heat",[1,2];if("water"==c)return a.explanation="",[1,1];if("light"==c)return a.explanation="",[2,1];if("magnetic"==c){var d=Math.floor(3*Math.random());if(0==d)return a.explanation="Magnetic field reflected the attack",[2,0];if(1==d)return a.explanation="Magnetic field cancelled the attack",[0,0];if(2==d)return a.explanation="Magnetic field failed",[0,2]}}else if("light"==b){if("volcano"==c)return[2,1];if("water"==c)return[1,2];if("light"==c){var d=Math.floor(2*Math.random());if(0==d){if(side=Math.floor(2*Math.random()),0==side)return[3,0];if(1==side)return[0,3]}else if(1==d)return[2,2]}else if("magnetic"==c){var d=Math.floor(3*Math.random());if(0==d)return a.explanation="Magnetic field reflected the attack",[2,0];if(1==d)return a.explanation="Magnetic field cancelled the attack",[0,0];if(2==d)return a.explanation="Magnetic field failed",[0,2]}}else if("magnetic"==b)if("volcano"==c){var d=Math.floor(3*Math.random());if(0==d)return a.explanation="Magnetic field reflected the attack",[0,2];if(1==d)return a.explanation="Magnetic field cancelled the attack",[0,0];if(2==d)return a.explanation="Magnetic field failed",[2,0]}else if("water"==c){var d=Math.floor(3*Math.random());if(0==d)return[0,2];if(1==d)return[0,0];if(2==d)return[2,0]}else if("light"==c){var d=Math.floor(3*Math.random());if(0==d)return[0,2];if(1==d)return[0,0];if(2==d)return[2,0]}else if("magnetic"==c)return a.explanation="Has no effect on each other...",[0,0];return[0,0]}}]);