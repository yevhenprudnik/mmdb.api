const handleGetMovies = async(req, res, client, movies) => {
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
}

module.exports = {
    handleGetMovies: handleGetMovies
}