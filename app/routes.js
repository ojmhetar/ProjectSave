module.exports = function(app, passport, connection, request, sendgrid) {

    var helper = sendgrid.mail;
    var sg = require('sendgrid')(process.env.SGPSKEY);

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('login.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/books', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/bookentry', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/books', function(req, res) {
        connection.query("select * from BookEntry",function(err,rows){   
            if (err) {
                return done(err);
            }
            if (rows.length < 0) {
                res.render('profile.ejs');
            } 
            else {
                console.log(rows);
                res.render('booklist.ejs', {entries : rows});
            }
            //res.render('booklist.ejs', {entries : rows});
        });
        //res.render('booklist.ejs');
    });

    app.get('/bookentry', function(req, res) {
        res.render('addbook.ejs');

    });

    app.post('/bookentry', isLoggedIn, function(req, res) {

        var isbn = req.body.isbn; 
        var price = req.body.price; 

        url = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn;
        request(url, function(error, response, html){
            if(!error){
                var resp = JSON.parse(html);
                var userId = req.user.id;
                var thumbnail = resp.items[0].volumeInfo.imageLinks.thumbnail;
                var title = resp.items[0].volumeInfo.title; 
                var author = resp.items[0].volumeInfo.authors[0];
                var description = resp.items[0].volumeInfo.description;
                var vol = " ";
                var date = Date.now();
                var cond = " ";
                var comments = " ";
                var insertQuery = "INSERT INTO BookEntry ( isbn, title, author, vol, cond, comments, price, date_posted, user_id ) values ('" + isbn +"','"+ title +"','"+ author +"','"+ title +"','"+ cond +"','"+ comments +"','"+ price +"','"+ date+"','"+ userId +"')";
                    console.log(insertQuery);
                connection.query(insertQuery,function(err,rows){
                
                return done(null, newUserMysql);
                });

                res.render('confirmbook.ejs', {thumbnail : thumbnail, title : title, author : author, description : description, price: price} );
            }
            else {
                res.redirect('/');
            }
        });

        
    });

    app.post('/processEmail', isLoggedIn, function(req, res) {

        var sellerId = req.body.sellerId; 
        connection.query("SELECT * FROM `users` WHERE `id` = '" + sellerId + "'",function(err,rows){   
            if (err) {
                return done(err);
            }
            if (rows.length < 0) {
                res.send("Error processing request.")
            } 
            else {

        


                var from_email = new helper.Email(req.user.email)
                var to_email = new helper.Email(rows[0].email)
                var subject = "Someone wants to buy your textbook!"
                var content = new helper.Content("text/plain", "Contact this person: " + req.user.email)
                var mail = new helper.Mail(from_email, subject, to_email, content)

                // email.addTo(rows[0].email);
                // email.setFrom(req.body.email);
                // email.setSubject("Someone wants to buy your textbook! ");
                // email.setHtml(" <br /> <br />Contact this person: " + req.body.email);

                var request = sg.emptyRequest({
                  method: 'POST',
                  path: '/v3/mail/send',
                  body: mail.toJSON()
                });

                sg.API(request, function(error, response) { 
                  console.log(response.statusCode)
                  console.log(response.body)
                  console.log(response.headers)

                  if(error) {
                     res.send("There was an error");
                  }
                  else {
                     res.send("Email sent!");
                  }
                })


            }
            //res.render('booklist.ejs', {entries : rows});
        });
        
});

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}