if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "url do seu banco"}
}else {
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}
