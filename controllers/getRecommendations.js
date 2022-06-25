const handleGetRecommendations = async(req, res, client, movies) => {
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
}

module.exports = {
    handleGetRecommendations: handleGetRecommendations
}