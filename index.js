const express = require('express')
require('dotenv').config()
const {MongoClient, ObjectId} = require('mongodb')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const compression = require('compression')

const ConnectionString = process.env.MONGODB_CONNECTION_STRING;
//const ConnectionLocal = process.env.MONGODB_CONNECTION_STRING_LOCAL;
const Port = process.env.PORT || 3001

const client = new MongoClient(ConnectionString);

const getMovies = require('./controllers/getMovies')
const getRecommendations = require('./controllers/getRecommendations')
const rateFilm = require('./controllers/rateFilm')
const signIn = require('./controllers/signIn')
const register = require('./controllers/register')
const isSignedIn = require('./controllers/isSignedIn')

const app = express();

app.use(express.json());
app.use(cors());
app.use(compression())

const movies = client.db("mmdb").collection("movies");
const users = client.db("mmdb").collection("users");

app.get('/', (req, res) => {res.json("it's working")})

//app.get('/getMovies', async (req, res) => {getMovies.handleGetMovies(req, res, client, movies)})
app.get('/getMovies', getMovies.handleGetMovies(client, movies))
app.post('/getRecommendations', getRecommendations.handleGetRecommendations(client, movies))
app.post('/rateFilm', rateFilm.handleRateFilm(client, movies, users, jwt, ObjectId))
app.post('/signIn', signIn.handleSignIn(client, users, jwt))
app.post('/register', register.handleRegister(client, users, jwt))
app.post('/isSignedIn', isSignedIn.handleIsSignedIn(client, users, jwt, ObjectId))

app.listen(Port, () => {console.log(`listening on port ${Port}`)})

