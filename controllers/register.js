const handleRegister = async (req, res, client, users, jwt) => {
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
}

module.exports = {
    handleRegister: handleRegister
}