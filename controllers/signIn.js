const handleSignIn = async(req, res, client, users, jwt) => {
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
}

module.exports = {
    handleSignIn: handleSignIn
}