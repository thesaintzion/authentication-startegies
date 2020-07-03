const connection = require('./database');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = connection.models.User;





// JWT Strategy //
const opts = {
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
secretOrKey: process.env.SECRET,
algorithms: ['RS256']
}
module.exports = (passport) =>{
    const jwtCallback = (jwt_payload, done) => {
        User.findOne({_id: jwt_payload.sub})
        .then(user => {
          if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
      }).catch(err =>{
        return done(err, false);
      });
      }
      
      const jwtStrategy = new JwtStrategy(opts, jwtCallback);
       
      passport.use(jwtStrategy);
}




