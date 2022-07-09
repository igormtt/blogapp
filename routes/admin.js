const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")  
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
const {isAdmin} = require("../helpers/isAdmin")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

router.get('/', isAdmin, (req, res)=> {

    let usuarioLogado = {
        nome: req.user.nome,
        isAdmin: req.user.isAdmin  
    }    
    
    Usuario.findOne({isAdmin: req.user.isAdmin}).lean().then((user)=> {
        res.render("admin/index", {user: usuarioLogado})        
    })
})

router.get('/posts', isAdmin, (req, res) => {
    res.send("Página de posts")
})

router.get('/categorias', isAdmin, (req, res)=>{

    Categoria.find().lean().then((categorias)=> {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err)=> {
        req.flash("error_msg", "Houve um erro ao listar as categorias.")
        res.redirect("/admin")
    })

})

router.get('/categorias/add', isAdmin, (req, res)=> {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', isAdmin, (req, res)=> {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido."})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido."})
    }

    if(req.body.nome.length < 2 ){
        erros.push({texto: "Nome da categoria muito pequeno."})
    }

    if(erros.length > 0 ){
        res.render("admin/addcategorias", {erros: erros})  
    }else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=> {
            req.flash("success_msg", "Categoria criada com sucesso!") 
            res.redirect('/admin/categorias')

        }).catch((err)=> {

            req.flash("error_msg", "Houve um erro ao cadastrar a categoria, tente novamente.")
            res.redirect("/admin")
        })

    }
})

router.get("/categorias/edit/:id", isAdmin, (req, res)=> {

    Categoria.findOne({_id: req.params.id}).lean().then((categoria)=> {
    res.render("admin/editcategorias", {categoria: categoria})

    }).catch((err)=> {
        req.flash("error_msg", "Essa categoria não existe.")
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/edit', isAdmin, (req, res)=> {

    var erros = []

    if(req.body.nome < 3){
        erros.push({texto: "Insira um nome válido."})
    }

    if(req.body.slug < 3){
        erros.push({texto: "Insira um slug válido."})
    }

    if(req.body.nome == null || typeof req.body.slug == undefined ||req.body.slug == null){
        erros.push({texto: "Insira os dados nos campos."})
    }

    if(erros.length > 0 ){
        res.render("admin/addcategorias", {erros: erros}) 
    }else{

        Categoria.findOne({_id: req.body.id}).then((categoria)=> {

            categoria.nome = req.body.nome  
            categoria.slug = req.body.slug
    
            categoria.save().then(() => { 
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
    
            }).catch((err)=> {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria." + err)
                res.redirect("/admin/categorias")
            })
    
    
        }).catch((err)=> {
            req.flash("error_msg", "Houve um erro ao editar a categoria.")
            console.log(err)
            res.redirect("/admin/categorias")
        })

    }

})

router.post('/categorias/deletar', isAdmin, (req, res)=> {
    Categoria.remove({_id: req.body.id}).then(()=> {

        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")

    }).catch((err)=> {

        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
        
    })
})


router.get("/postagens", isAdmin, (req, res)=> {
    
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=> {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=> {
        req.flash("Houve um erro ao listar as postagens!")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", isAdmin, (req, res)=> {

    Categoria.find().lean().then((categorias)=> {
        res.render("admin/addpostagem", {categorias: categorias})

    }).catch((err)=> {

        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin/postagens")

    })
    
})

router.post("/postagens/nova", isAdmin, (req, res)=> {

    var erros = []

    if(req.body.categoria == 0 ){
        erros.push({texto: "Categoria inválida, registre uma categoria."})
    }

    if(req.body.titulo.length <3){
        erros.push({texto: "Insira um texto de pelo menos 3 caracteres."})
    }

    if(req.body.slug == 0){
        erros.push({texto: "Insira um slug."})
    }

    if(req.body.descricao.length <1){
        erros.push({texto: "Insira uma descrição."})
    }

    if(req.body.conteudo.length <1){
        erros.push({texto: "Insira um conteudo para a sua postagem."})
    }
  
    if(erros.length > 0 ){
        res.render("admin/addpostagem", {erros: erros})
    }else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=> {

            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")

        }).catch((err)=> {

            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")

        })

    }
})

router.get("/postagens/edit/:id", isAdmin, (req, res)=> { 


    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=> {

        Categoria.find().lean().then((categorias)=> {

            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})

        }).catch((err)=> {

            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")

        })

    }).catch((err)=> {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagem/edit", isAdmin, (req, res)=> {

    Postagem.findOne({_id: req.body.id}).then((postagem)=> {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria 

        postagem.save().then(()=> {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=> {
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=> {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", isAdmin, (req, res)=> {  

    Postagem.remove({_id: req.params.id}).then(()=> {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err)=> {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })

})

module.exports = router