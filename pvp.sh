git add .
git pull
grunt --force
git commit -am "$1"
git push origin master
git push heroku master
heroku open
