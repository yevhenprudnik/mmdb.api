const handleIsSignedIn = async(req, res, client, users, jwt, ObjectId) => {
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
    });
}

module.exports = {
    handleIsSignedIn: handleIsSignedIn
}