require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");



var app = express();

var spotifyWebApi = require("spotify-web-api-node");
const SpotifyWebApi = require('spotify-web-api-node');
scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private'];

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.CALLBACK_URL
});

app.get("/",function(req, res){
    res.sendFile(__dirname + "/index.html")
});

app.get("/login", function(req, res){
    res.redirect('https://accounts.spotify.com/authorize' + '?response_type=code' + 
    '&client_id='+ process.env.SPOTIFY_CLIENT_ID + (scopes ? '&scope=' +encodeURIComponent(scopes) : '') + 
    '&redirect_uri=' + encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI));
});

app.get("/callback", async(req, res) => {
    const {code} = req.query;
    console.log(code);
    try {
        var data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        res.redirect('http://localhost:3000/');
    } catch(err) {
        res.redirect('/#/error/invalid_token');
    }
});


app.get("/playlists", async (req, res) => {
    try {
        var result = await spotifyApi.getUserPlaylists();
        console.log(result.body);
        res.status(200).send(result.body);
    } catch (err) {
        res.status(400).send(err);
    }
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is up and running on port 3000.");
})