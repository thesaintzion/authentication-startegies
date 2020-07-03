
const isAdmin = (req, res, next) =>{
    if(req.isAuthenticated() && req.user.admin){
      next()
    }else{
        res.status(400).json({message: "You are not allowed into this route."});
    }
}



const isAuth = (req, res, next) =>{
    if(req.isAuthenticated()){
      next()
    }else{
        res.status(400).json({message: "You are not allowed into this route."});
    }
}

module.exports =  {isAdmin, isAuth};