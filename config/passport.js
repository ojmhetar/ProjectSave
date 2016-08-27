var LocalStrategy   = require('passport-local').Strategy;
  
var bcrypt   = require('bcrypt-nodejs');

//var connection = require('./db.js');

module.exports = function(passport, connection) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("select * from users where id = "+id,function(err,rows){   
            done(err, rows[0]);
        });
    });
    

    passport.use('local-signup', new LocalStrategy({
        
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        connection.query("select * from users where email = '"+email+"'",function(err,rows){
            console.log(rows);
            console.log("above row object");
            if (err)
                return done(err);
             if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

    
                var newUserMysql = new Object();
                
                newUserMysql.email    = email;
                newUserMysql.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null); // use the generateHash function in our user model
            
                var insertQuery = "INSERT INTO users ( email, password ) values ('" + newUserMysql.email +"','"+ newUserMysql.password +"')";
                    console.log(insertQuery);
                connection.query(insertQuery,function(err,rows){
                newUserMysql.id = rows.insertId;
                
                return done(null, newUserMysql);
                }); 
            }   
        });
    }));

    passport.use('local-login', new LocalStrategy({
     
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { 

         connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
            if (err)
                return done(err);
             if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            } 
            

            console.log(rows[0].password);
            console.log("\n" + password);
            if(!(bcrypt.compareSync(password, rows[0].password)))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            

            return done(null, rows[0]);       
        
        });
        


    }));

};