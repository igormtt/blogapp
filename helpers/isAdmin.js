module.exports = {
    isAdmin: function(req, res, next){

        if(req.isAuthenticated() && req.user.isAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Você precisa de privilégios administrativos para isso.")
        res.redirect("/")

    }
}