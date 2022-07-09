if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://admin:<password>@cluster0.0btmpit.mongodb.net/?retryWrites=true&w=majority"}
}else {
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}