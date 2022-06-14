require('dotenv').config()
const {MongoClient, ObjectId} = require('mongodb')
const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken')
const ConnectionString = process.env.MONGODB_CONNECTION_STRING;
const ConnectionLocal = process.env.MONGODB_CONNECTION_STRING_LOCAL;
const Port = process.env.PORT || 3001

const client = new MongoClient(ConnectionString);

const app = express();
app.use(express.json());
app.use(cors());

const database = {
    movies: [
        {
            title: "The Shining",
            stRating: 8.7,
            adRating: 8.8,
            year: 1980,
            topCast: ["Jack Nicholson", "Shelley Duvall", "Danny Lloyd", "Scatman Crothers"]
        },
        {
            title: "Pirates of the Caribbean",
            part: 3,
            subTitle: "At World's End",
            genre: ["Action", "Adventure", "Fantasy"],
            stRating: 8.9,
            adRating: 8.7,
            year: 2007,
            topCast: ["Johnny Depp", "Orlando Bloom", "Keira Knightley", "Geoffrey Rush", "Bill Nighy"],
            director: "Gore Verbinski"
        }
    ]
}
const movies = client.db("mmdb").collection("movies");
const users = client.db("mmdb").collection("users");
app.get('/', async(req, res) => {
    try{
        await client.connect()
        let MMDB = { Rating: -1 };  
        movies.find().sort(MMDB).limit(100).toArray()
        .then(data => res.json(data))
    }
    catch(err){
        console.log(err)
    }
})

app.get('/getMovies', async (req, res) => {
    let IMDB = { IMDBraiting: -1 };  
    let MMDB = { Rating: -1 };  
    try{
        await client.connect()
        movies.find().sort(MMDB).limit(100).toArray()
        .then(data => res.json(data))
    }
    catch(err){
        console.log(err)
    }
})
app.post('/getRecommendations', async (req, res) => {
    let IMDB = { IMDBraiting: -1 };  
    let MMDB = { Rating: -1 };  
    let category = {$all: req.body.category}
    if (req.body.category[0] == 'I dont have preference') {
        category = {$exists : true}
    }
    let genre = {$all: req.body.genres}
    if (req.body.genres[0] == 'I dont have preference') {
        genre = {$exists : true}
    }
    try{
        await client.connect()
        //Перевіряю, чи існують фільми, які повністю відповідають вподобанням юзера
        let data = await movies.find({
            mood: req.body.mood,
            year: {$gte : req.body.year},
            Runtime: {$lt : req.body.runtime},
            company : req.body.company, 
            genre : genre,
            category : category
        }).sort(MMDB).toArray()
        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
        if (data.length > 0) {
            res.json(data)
        }
        else{
            // Інакше є 4 віріанти
            // 1 категорії і жанри вказані
            // 2 категорії вказані, жанри - ні
            // 3 жанри вказані, категорії - ні
            // 4 і жанри, і категорії не вказані
            
            //1 віріант
            if (req.body.category[0] != 'I dont have preference' && req.body.genres[0] != 'I dont have preference') {
                //Тепер перевіряю за обмеженими критеріями 
                // 1 перевіряю за першою категорією
                let dataWithOneCategory = await movies.find({
                    mood: req.body.mood,
                    year: {$gte : req.body.year},
                    Runtime: {$lt : req.body.runtime},
                    company : req.body.company, 
                    genre : genre,
                    category : req.body.category[1]
                }).sort(MMDB).toArray()
                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                if (dataWithOneCategory.length > 0) {
                    res.json(dataWithOneCategory)
                }
                else{
                    // 2 перевіряю за першим жанром
                    let dataWithOneGenre = await movies.find({
                        mood: req.body.mood,
                        year: {$gte : req.body.year},
                        Runtime: {$lt : req.body.runtime},
                        company : req.body.company, 
                        genre : req.body.genres[1],
                        category : category
                    }).sort(MMDB).toArray()
                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                    if (dataWithOneGenre.length > 0) {
                        res.json(dataWithOneGenre)
                    }
                    else{
                        // 3 перевіряю за першим жанром i першою категорією
                        let data_With_One_Genre_And_One_Category = await movies.find({
                            mood: req.body.mood,
                            year: {$gte : req.body.year},
                            Runtime: {$lt : req.body.runtime},
                            company : req.body.company, 
                            genre : req.body.genres[1],
                            category : req.body.category[1],
                        }).sort(MMDB).toArray()
                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                        if (data_With_One_Genre_And_One_Category.length > 0) {
                            res.json(data_With_One_Genre_And_One_Category)
                        }
                        else{
                            // 4 відсіюю жанри
                            let data_With_No_Genre = await movies.find({
                                mood: req.body.mood,
                                year: {$gte : req.body.year},
                                Runtime: {$lt : req.body.runtime},
                                company : req.body.company, 
                                category : category
                            }).sort(MMDB).toArray()
                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                            if (data_With_No_Genre.length > 0) {
                                res.json(data_With_No_Genre)
                            }
                            else{
                                // 5 відсіюю жанри і шукаю зп першою категорією
                                let data_With_No_Genre_And_One_Category = await movies.find({
                                    mood: req.body.mood,
                                    year: {$gte : req.body.year},
                                    Runtime: {$lt : req.body.runtime},
                                    company : req.body.company, 
                                    category : req.body.category[1],
                                }).sort(MMDB).toArray()
                                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                if (data_With_No_Genre_And_One_Category.length > 0) {
                                    res.json(data_With_No_Genre_And_One_Category)
                                }
                                else{
                                    // 6 відсіюю категорії
                                    let data_With_No_Category = await movies.find({
                                        mood: req.body.mood,
                                        year: {$gte : req.body.year},
                                        Runtime: {$lt : req.body.runtime},
                                        company : req.body.company, 
                                        genre : genre
                                    }).sort(MMDB).toArray()
                                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                    if (data_With_No_Category.length > 0) {
                                        res.json(data_With_No_Category)
                                    }
                                    else{
                                        // 7 відсіюю категорії і шукаю за першим жанром
                                        let data_With_No_Genre_And_One_Category = await movies.find({
                                            mood: req.body.mood,
                                            year: {$gte : req.body.year},
                                            Runtime: {$lt : req.body.runtime},
                                            company : req.body.company, 
                                            genre : req.body.genres[1],
                                        }).sort(MMDB).toArray()
                                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                        if (data_With_No_Genre_And_One_Category.length > 0) {
                                            res.json(data_With_No_Genre_And_One_Category)
                                        }
                                        else{
                                            //відсіюю і жанри, і категорії
                                            let data_With_No_Genre_NO_Category = await movies.find({
                                                mood: req.body.mood,
                                                year: {$gte : req.body.year},
                                                Runtime: {$lt : req.body.runtime},
                                                company : req.body.company, 
                                            }).sort(MMDB).toArray()
                                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                            if (data_With_No_Genre_NO_Category.length > 0) {
                                                res.json(data_With_No_Genre_NO_Category)
                                            }
                                            else{
                                                //відсіюю рік
                                                let data_With_No_Year = await movies.find({
                                                    mood: req.body.mood,
                                                    Runtime: {$lt : req.body.runtime},
                                                    company : req.body.company, 
                                                    genre : genre,
                                                    category : category
                                                }).sort(MMDB).toArray()
                                                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                if (data_With_No_Year.length > 0) {
                                                    res.json(data_With_No_Year)
                                                }
                                                else{
                                                    // Провожу всі вищезгадані операцї, лиш без року
                                                    let dataWithOneCategory_No_Year = await movies.find({
                                                        mood: req.body.mood,
                                                        Runtime: {$lt : req.body.runtime},
                                                        company : req.body.company, 
                                                        genre : genre,
                                                        category : req.body.category[1]
                                                    }).sort(MMDB).toArray()
                                                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                    if (dataWithOneCategory_No_Year.length > 0) {
                                                        res.json(dataWithOneCategory_No_Year)
                                                    }
                                                    else{
                                                        // 2 перевіряю за першим жанром
                                                        let dataWithOneGenre_No_Year = await movies.find({
                                                            mood: req.body.mood,
                                                            Runtime: {$lt : req.body.runtime},
                                                            company : req.body.company, 
                                                            genre : req.body.genres[1],
                                                            category : category
                                                        }).sort(MMDB).toArray()
                                                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                        if (dataWithOneGenre_No_Year.length > 0) {
                                                            res.json(dataWithOneGenre_No_Year)
                                                        }
                                                        else{
                                                            // 3 перевіряю за першим жанром i першою категорією
                                                            let data_With_One_Genre_And_One_Category_No_Year = await movies.find({
                                                                mood: req.body.mood,
                                                                Runtime: {$lt : req.body.runtime},
                                                                company : req.body.company, 
                                                                genre : req.body.genres[1],
                                                                category : req.body.category[1],
                                                            }).sort(MMDB).toArray()
                                                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                            if (data_With_One_Genre_And_One_Category_No_Year.length > 0) {
                                                                res.json(data_With_One_Genre_And_One_Category_No_Year)
                                                            }
                                                            else{
                                                                // 4 відсіюю жанри
                                                                let data_With_No_Genre_No_Year = await movies.find({
                                                                    mood: req.body.mood,
                                                                    Runtime: {$lt : req.body.runtime},
                                                                    company : req.body.company, 
                                                                    category : category
                                                                }).sort(MMDB).toArray()
                                                                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                                if (data_With_No_Genre_No_Year.length > 0) {
                                                                    res.json(data_With_No_Genre_No_Year)
                                                                }
                                                                else{
                                                                    // 5 відсіюю жанри і шукаю зп першою категорією
                                                                    let data_With_No_Genre_And_One_Category_No_Year = await movies.find({
                                                                        mood: req.body.mood,
                                                                        Runtime: {$lt : req.body.runtime},
                                                                        company : req.body.company, 
                                                                        category : req.body.category[1],
                                                                    }).sort(MMDB).toArray()
                                                                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                                    if (data_With_No_Genre_And_One_Category_No_Year.length > 0) {
                                                                        res.json(data_With_No_Genre_And_One_Category_No_Year)
                                                                    }
                                                                    else{
                                                                        // 6 відсіюю категорії
                                                                        let data_With_No_Category_No_Year = await movies.find({
                                                                            mood: req.body.mood,
                                                                            Runtime: {$lt : req.body.runtime},
                                                                            company : req.body.company, 
                                                                            genre : genre
                                                                        }).sort(MMDB).toArray()
                                                                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                                        if (data_With_No_Category_No_Year.length > 0) {
                                                                            res.json(data_With_No_Category_No_Year)
                                                                        }
                                                                        else{
                                                                            // 7 відсіюю категорії і шукаю за першим жанром
                                                                            let data_With_No_Genre_And_One_Category_No_Year = await movies.find({
                                                                                mood: req.body.mood,
                                                                                Runtime: {$lt : req.body.runtime},
                                                                                company : req.body.company, 
                                                                                genre : req.body.genres[1],
                                                                            }).sort(MMDB).toArray()
                                                                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                                            if (data_With_No_Genre_And_One_Category_No_Year.length > 0) {
                                                                                res.json(data_With_No_Genre_And_One_Category_No_Year)
                                                                            }
                                                                            else{
                                                                                //відсіюю і жанри, і категорії
                                                                                let data_With_No_Genre_NO_Category_No_Year = await movies.find({
                                                                                    mood: req.body.mood,
                                                                                    Runtime: {$lt : req.body.runtime},
                                                                                    company : req.body.company, 
                                                                                }).sort(MMDB).toArray()
                                                                                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                                                if (data_With_No_Genre_NO_Category_No_Year.length > 0) {
                                                                                    res.json(data_With_No_Genre_NO_Category_No_Year)
                                                                                }
                                                                                else{
                                                                                    //Відсіюю настрій
                                                                                    let data_With_No_Genre_NO_Category_No_Year_No_Mood = await movies.find({
                                                                                        Runtime: {$lt : req.body.runtime},
                                                                                        company : req.body.company, 
                                                                                    }).sort(MMDB).toArray()
                                                                                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                                                    if (data_With_No_Genre_NO_Category_No_Year_No_Mood.length > 0) {
                                                                                        res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood)
                                                                                    }
                                                                                    else{
                                                                                        //Відсіюю час
                                                                                        let data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time = await movies.find({
                                                                                            company : req.body.company, 
                                                                                        }).sort(MMDB).toArray()
                                                                                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                                                                        if (data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time.length > 0) {
                                                                                            res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time)
                                                                                        }
                                                                                        else{
                                                                                            //Відправляю топ 100
                                                                                            let top100 = await movies.find().sort(MMDB).toArray()
                                                                                            res.json(top100)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // 2 варіант категорії вказані, жанри - ні
            else if(req.body.category[0] != 'I dont have preference' && req.body.genres[0] == 'I dont have preference'){
                //Провожу всі операції з першого блоку, за умови, що жанри не вказані(їх не перевіряю)
                let dataWithCategory = await movies.find({
                    mood: req.body.mood,
                    year: {$gte : req.body.year},
                    Runtime: {$lt : req.body.runtime},
                    company : req.body.company, 
                    category : category,
                }).sort(MMDB).toArray()
                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                if (dataWithCategory.length > 0) {
                    res.json(dataWithCategory)
                }
                else{
                    // 2 перевіряю за першою категорією
                    let dataWithOneCategory = await movies.find({
                        mood: req.body.mood,
                        year: {$gte : req.body.year},
                        Runtime: {$lt : req.body.runtime},
                        company : req.body.company, 
                        category : req.body.category[1]
                    }).sort(MMDB).toArray()
                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                    if (dataWithOneCategory.length > 0) {
                        res.json(dataWithOneCategory)
                    }
                    else{
                        // 3 перевіряю без категорії
                        let data_With_No_Genre_NO_Category = await movies.find({
                            mood: req.body.mood,
                            year: {$gte : req.body.year},
                            Runtime: {$lt : req.body.runtime},
                            company : req.body.company, 
                        }).sort(MMDB).toArray()
                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                        if (data_With_No_Genre_NO_Category.length > 0) {
                            res.json(data_With_No_Genre_NO_Category)
                        }
                        else{
                            //відсіюю рік
                            let data_With_No_Year = await movies.find({
                                mood: req.body.mood,
                                Runtime: {$lt : req.body.runtime},
                                company : req.body.company, 
                                category : category
                            }).sort(MMDB).toArray()
                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                            if (data_With_No_Year.length > 0) {
                                res.json(data_With_No_Year)
                            }
                            else{
                                // Провожу всі вищезгадані операцї, лиш без року
                                let dataWithOneCategory_No_Year = await movies.find({
                                    mood: req.body.mood,
                                    Runtime: {$lt : req.body.runtime},
                                    company : req.body.company, 
                                    category : req.body.category[1]
                                }).sort(MMDB).toArray()
                                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                if (dataWithOneCategory_No_Year.length > 0) {
                                    res.json(dataWithOneCategory_No_Year)
                                }
                                else{
                                    // 6 відсіюю категорії
                                    let data_With_No_Genre_NO_Category_No_Year = await movies.find({
                                        mood: req.body.mood,
                                        Runtime: {$lt : req.body.runtime},
                                        company : req.body.company, 
                                    }).sort(MMDB).toArray()
                                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                    if (data_With_No_Genre_NO_Category_No_Year.length > 0) {
                                        res.json(data_With_No_Genre_NO_Category_No_Year)
                                    }
                                    else{
                                        //Відсіюю настрій
                                        let data_With_No_Genre_NO_Category_No_Year_No_Mood = await movies.find({
                                            Runtime: {$lt : req.body.runtime},
                                            company : req.body.company, 
                                        }).sort(MMDB).toArray()
                                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                        if (data_With_No_Genre_NO_Category_No_Year_No_Mood.length > 0) {
                                            res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood)
                                        }
                                        else{
                                            //Відсіюю час
                                            let data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time = await movies.find({
                                                company : req.body.company, 
                                            }).sort(MMDB).toArray()
                                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                            if (data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time.length > 0) {
                                                res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time)
                                            }
                                            else{
                                                //Відправляю топ 100
                                                let top100 = await movies.find().sort(MMDB).toArray()
                                                res.json(top100)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //3 віріант жанри вказані, категорії - ні
            else if (req.body.category[0] == 'I dont have preference' && req.body.genres[0] != 'I dont have preference'){
                //Провожу всі операції з першого блоку, за умови, що категорії не вказані(їх не перевіряю)
                let dataWithCategory = await movies.find({
                    mood: req.body.mood,
                    year: {$gte : req.body.year},
                    Runtime: {$lt : req.body.runtime},
                    company : req.body.company, 
                    genre : genre,
                }).sort(MMDB).toArray()
                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                if (dataWithCategory.length > 0) {
                    res.json(dataWithCategory)
                }
                else{
                    // 2 перевіряю за першим жанром
                    let dataWithOneCategory = await movies.find({
                        mood: req.body.mood,
                        year: {$gte : req.body.year},
                        Runtime: {$lt : req.body.runtime},
                        company : req.body.company,
                        genre : req.body.genres[1]
                    }).sort(MMDB).toArray()
                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                    if (dataWithOneCategory.length > 0) {
                        res.json(dataWithOneCategory)
                    }
                    else{
                        // 3 перевіряю без жанру
                        let data_With_No_Genre_NO_Category = await movies.find({
                            mood: req.body.mood,
                            year: {$gte : req.body.year},
                            Runtime: {$lt : req.body.runtime},
                            company : req.body.company, 
                        }).sort(MMDB).toArray()
                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                        if (data_With_No_Genre_NO_Category.length > 0) {
                            res.json(data_With_No_Genre_NO_Category)
                        }
                        else{
                            //відсіюю рік
                            let data_With_No_Year = await movies.find({
                                mood: req.body.mood,
                                Runtime: {$lt : req.body.runtime},
                                company : req.body.company, 
                                genre : genre,
                            }).sort(MMDB).toArray()
                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                            if (data_With_No_Year.length > 0) {
                                res.json(data_With_No_Year)
                            }
                            else{
                                // Провожу всі вищезгадані операцї, лиш без року
                                let dataWithOneCategory_No_Year = await movies.find({
                                    mood: req.body.mood,
                                    Runtime: {$lt : req.body.runtime},
                                    company : req.body.company, 
                                    genre : req.body.genres[1]
                                }).sort(MMDB).toArray()
                                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                if (dataWithOneCategory_No_Year.length > 0) {
                                    res.json(dataWithOneCategory_No_Year)
                                }
                                else{
                                    // 6 відсіюю жанри
                                    let data_With_No_Genre_NO_Category_No_Year = await movies.find({
                                        mood: req.body.mood,
                                        Runtime: {$lt : req.body.runtime},
                                        company : req.body.company, 
                                    }).sort(MMDB).toArray()
                                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                    if (data_With_No_Genre_NO_Category_No_Year.length > 0) {
                                        res.json(data_With_No_Genre_NO_Category_No_Year)
                                    }
                                    else{
                                        //Відсіюю настрій
                                        let data_With_No_Genre_NO_Category_No_Year_No_Mood = await movies.find({
                                            Runtime: {$lt : req.body.runtime},
                                            company : req.body.company, 
                                        }).sort(MMDB).toArray()
                                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                        if (data_With_No_Genre_NO_Category_No_Year_No_Mood.length > 0) {
                                            res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood)
                                        }
                                        else{
                                            //Відсіюю час
                                            let data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time = await movies.find({
                                                company : req.body.company, 
                                            }).sort(MMDB).toArray()
                                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                                            if (data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time.length > 0) {
                                                res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time)
                                            }
                                            else{
                                                //Відправляю топ 100
                                                let top100 = await movies.find().sort(MMDB).toArray()
                                                res.json(top100)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //4 варіант, нема ні жанрів, ні категорій
            else{
                //Провожу всі операції з першого блоку, за умови, що категорії і жанри не вказані(їх не перевіряю)
                let data_With_No_Genre_NO_Category = await movies.find({
                    mood: req.body.mood,
                    year: {$gte : req.body.year},
                    Runtime: {$lt : req.body.runtime},
                    company : req.body.company, 
                }).sort(MMDB).toArray()
                //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                if (data_With_No_Genre_NO_Category.length > 0){
                    res.json(data_With_No_Genre_NO_Category)
                }
                else{
                    //відсіюю рік
                    let data_With_No_Year = await movies.find({
                        mood: req.body.mood,
                        Runtime: {$lt : req.body.runtime},
                        company : req.body.company, 
                    }).sort(MMDB).toArray()
                    //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                    if (data_With_No_Year.length > 0) {
                        res.json(data_With_No_Year)
                    }
                    else{
                        //Відсіюю настрій
                        let data_With_No_Genre_NO_Category_No_Year_No_Mood = await movies.find({
                            Runtime: {$lt : req.body.runtime},
                            company : req.body.company, 
                        }).sort(MMDB).toArray()
                        //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                        if (data_With_No_Genre_NO_Category_No_Year_No_Mood.length > 0) {
                            res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood)
                        }
                        else{
                            //Відсіюю час
                            let data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time = await movies.find({
                                company : req.body.company, 
                            }).sort(MMDB).toArray()
                            //Якщо такі фільми інснують, відповідаю ними, інакше - шукаю далі
                            if (data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time.length > 0) {
                                res.json(data_With_No_Genre_NO_Category_No_Year_No_Mood_No_Time)
                            }
                            else{
                                //Відправляю топ 100
                                let top100 = await movies.find().sort(MMDB).toArray()
                                res.json(top100)
                            }
                        }
                    }
                }
            }
        }
    }
    catch(err){
        console.log(err)
    }
})

app.post('/rateFilm', async(req, res) => {
    let movie = req.body.movie;
    let rate = req.body.rate;
    let token = req.body.token;
    jwt.verify(token, process.env.SECRET, async function(err, decoded) {
        if(decoded){
            let id = decoded.id;
            try{
                await client.connect()
                let user = await users.findOne({_id : ObjectId(id)});
                if (user) {
                    let oldRate = 0;
                    let disableCount = 0;
                    if(user.hasOwnProperty(movie)){
                        oldRate = user[movie]
                        disableCount = 1;
                    }
                    movies.findOne({title: movie})
                    .then(filmD => {
                        let currentRate = filmD.Rating
                        let currentImdbRating = filmD.imdbRating
                        let currentCount = filmD.quantityOfRatings
                        let NewCount = currentCount + 1 - disableCount;
                        let NewRating = (currentRate*currentCount+rate - oldRate)/NewCount + 0.0001
                        movies.updateOne({title: movie}, 
                            {
                                $set: {
                                    Rating: NewRating,
                                    quantityOfRatings: NewCount
                                }
                            }
                        )
                        let query = {}
                        query[movie] = rate
                        users.updateOne({_id : ObjectId(id)},
                            {
                                $set : query
                            }
                        )
                        .then(res.json('ok'))
                    })
                }
                else{
                    res.json("Sign In")
                }
            }
            catch(err){
                console.log(err)
            }
        }
        else{
            res.json("Sign In")
        }
        // else{
        //     console.log('nonValid')
        // }
    });
})
//---------------------------------------register / sign in--------------------------------//
app.post('/signIn', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username != "" && password != "") {
        try{
            await client.connect()
            users.findOne({username: username, password: password})
            .then(response => {
                if (response != null) {
                    let id = response._id.toString()
                    let token = jwt.sign({ id: id }, process.env.SECRET);
                    res.json(token)
                }
                else {
                    res.json("error")
                }
            })
        }
        catch(err){
            console.log(err)
        }
    }
    else{
        res.json("error")
    }
})

app.post('/register', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if(username != "" && password != ""){
        try{
            await client.connect()
            users.findOne({username: username})
            .then(response => {
                if (response != null) {
                    res.json("You are already registered, please sign in");
                }
                else{
                    users.insertOne({username: username, password: password, watchList:[], adStatus: false})
                    .then(data => {
                        let token = jwt.sign({ id: data.insertedId.toString() }, process.env.SECRET);
                        res.json(token);
                    })
                }
            })
        }
        catch(err){
            console.log(err)
        }
    }
    else{
        res.status(404).json("error");
    }
})

app.post('/isSignedIn', async(req, res) => {
    const { authorization } = req.headers;
    //let id = jwt.verify(authorization, 'secret');
    jwt.verify(authorization, process.env.SECRET, async function(err, decoded) {
        if(decoded){
            let id = decoded.id;
            try{
                await client.connect()
                users.findOne({_id: ObjectId(id)})
                .then((user) => {
                    if(user){
                        res.json('valid')
                    }
                })
            }
            catch(err){
                console.log(err)
            }
        }
        // else{
        //     console.log('nonValid')
        // }
    });
})

app.listen(Port, () => {
    console.log(`listening on port ${Port}`)
})

