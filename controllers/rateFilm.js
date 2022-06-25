const handleRateFilm = async(req, res, client, movies, users, jwt, ObjectId) => {
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
}

module.exports = {
    handleRateFilm : handleRateFilm
}