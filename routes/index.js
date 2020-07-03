const router = require('express').Router();
const passport = require('passport');
const {  encritPassword, validatePassword } = require('../lib/passwordUtils');
const {issueJWT} = require('../lib/jwtUtils');
const connection = require('../config/database');
const User = connection.models.User;
const  {isAdmin, isAuth} = require('../auth/middilewares');


/**
 * -------------- POST ROUTES ----------------
 */

 // TODO
 router.post('/login', passport.authenticate('local', {failureRedirect: '/login-failure', successRedirect: '/login-success'}), (req, res, next) => {
     console.log('Saint',  req, res);
 });

  // TODO
  router.post('/login-jwt', (req, res) => {

    User.findOne({ username: req.body.username }).then((user) => {
        if (!user) {
            res.status(404).json({msg: 'No user found.'}); 
           }else{
               
           let isValidPassword = validatePassword(req.body.password, user.hash, user.salt);

           if (isValidPassword ) {
            const jwt = issueJWT(user);
            console.log('The JWT LOGIN:', jwt);
            res.status(200).json({msg: 'User Created', user: user, token: jwt.token,  expiresIn: jwt.expires }); 
           }else{
            res.status(400).json({msg: 'Wrong password.'}); 
           }
        }
     
           


      }).catch((err) => {
        res.status(500).json({msg: 'Error checking if user exits', err }); 
      });

  
});


 // TODO
 router.post('/register', (req, res, next) => {
    async function postData(){
        const {password, username,  email} = req.body;
       

        //Encript password 
        let pass = await encritPassword(password);
        let salt = pass.salt;
        let hash = pass.hash;

        User.findOne({username: username}).then(userExits =>{
            if(userExits){
                res.status(409).json({msg: 'Oopps!! User Exits'}); 
            }else{
            // Create User...
            let newUser = {
                username,  email , salt, hash
            };
          User.create(newUser).then( userCreated =>{
                const jwt = issueJWT(userCreated);
                console.log('The JWT REGISTER:', jwt);
                res.status(200).json({msg: 'User Created', user: userCreated, token: jwt.token,  expiresIn: jwt.expires }); 
            }).catch(err => {
                res.status(500).json({msg: 'Oopps!! Error Creating User', err});  
            })
        
        }

        }).catch(err => {
            res.status(500).json({msg: 'Oopps!! Error  finding User', err}); 
        });
        
       
     }

     postData();
      
 });


 /**
 * -------------- GET ROUTES ----------------
 */

router.get('/', (req, res, next) => {
    const site = `<iframe src="https://google.com"></iframe>`
    // res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');

    User.find({}).then(users =>{
        if(users.length > 0){
            res.status(200).json({users});
        }else{
            res.status(404).send('No users found');
        }
    }).catch(err => {
        res.status(500).json({msg: 'Oopps!! Error getting User', err}); 
    });
    // res.send(site);
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {

    const form = '<h1>Register Page</h1><form method="post" action="register">\
    <br>Enter Email:<br><input type="text" name="email">\
                    <br>Enter Username:<br><input type="text" name="username">\
                    <br>Enter Password:<br><input type="password" name="password">\
                    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);
    
});

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set
 */
router.get('/protected-route', isAuth, (req, res, next) => {
        res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
   
});

router.get('/protected-jwt', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.send('<h1>You are authenticated via JWT</h1><p><a href="/logout">Logout and reload</a></p>');

});


// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/protected-route');
});


router.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

router.get('/admin',  isAdmin, (req, res, next) => {
    res.send('WELCOME BACK ADMINITRATOR');
});

module.exports = router;