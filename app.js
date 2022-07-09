const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const path = require("path")
const admin = require("./routes/admin")
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
const db = require("./config/db")

// Configurações
    // Sessão
        app.use(session({
            secret: "nodeApp",  
            resave: true,
            saveUninitialized: true,
            cookie: 2*60*1000  //Seta 2 minutos de cookie
        }))
        
        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    // Middleware

        app.use((req, res, next)=> {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash(("error_msg"))
            res.locals.error = req.flash("error")
            //Pegando dados do usuário logado.
            res.locals.user = req.user || null;
            next()
        })

    // BodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')    
        
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(()=>{
            console.log("Conectado ao banco")
        }).catch((err)=> {
            console.log("Houve algum erro: " + err)
        })

    // Publics
        app.use(express.static(path.join(__dirname, "public")))    

// Rotas
    app.get('/', (req, res)=> {
        Postagem.find().populate("categorias").sort({data: "desc"}).lean().then((postagens)=> {
            res.render("index", {postagens: postagens})
        }).catch((err)=> {
            req.flash("error_msg", "Houve um erro ao carregar as postagens.")
            res.redirect("/404")
        })
        
    })

    app.get("/postagem/:slug", (req, res)=> {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=> {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else {
                req.flash("error_msg", "Esta postagem não existe.")
                res.redirect("/")
            }
        }).catch((err)=> {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res)=> {
        res.send("Erro 404! Página não encontrada.")
    })

    app.get("/categorias", (req, res)=> {
        Categoria.find().lean().then((categorias)=> {

            res.render("categorias/index", {categorias: categorias})

        }).catch((err)=> {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res)=> {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=> {

            if(categoria){
                
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=> {

                    res.render("categorias/postagem", {postagens: postagens, categoria: categoria})

                }).catch((err)=> {
                    req.flash("error_msg", "Houve um erro ao renderizar os posts")
                    res.render("/")
                })

            }else {
                req.flash("error_msg", "Categoria não encontrada, ou não existe.")
                res.redirect("/")
            }

        }).catch((err)=> {
            req.flash("error_msg", "Houve um erro interno ao carregar a categoria")
        })
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)

// Outros
const PORT =  process.env.PORT || 8081
app.listen(PORT, ()=> {
    console.log("Servidor rodando")
})