const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const {  validatePassword } = require('../lib/passwordUtils');
const User = connection.models.User;


//All passprtconfig goes here
// TODO: passport.use();
// Local Trategy
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) =>{
        return done(null, user);
    }).catch((err) => {
        return done(err);
    })
  });


const fields = {
    pass: 'password',
    username: 'username',

}

const callBack = (username, password, done) => {
        // Check if user exits in the DB...
      User.findOne({ username: username }).then((user) => {

        // possport sends 404 error to client....
        if (!user) {
            return done(null, false); 
           }

        //   Check password correctness
           let isValidPassword = validatePassword(password, user.hash, user.salt);

       if (isValidPassword ) {
          
           return done(null, user); 
       }else{
        return done(null, false); 
       }

      }).catch((err) => {
        return done(err); 
      });
      

}

const localStrategy = new LocalStrategy(fields, callBack)

passport.use(localStrategy);



