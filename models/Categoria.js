const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Categoria = new Schema({
    nome : {
        type: String,
        required:true,
        default: "Usuário não inseriu nome."  
    }, 
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model("categorias", Categoria)