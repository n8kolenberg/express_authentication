const express               = require("express"),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      localStrategy         = require("passport-local")
      passportLocalMongoose = require("passport-local-mongoose"),
      User                  = require("./models/user");
      
//DB config
mongoose.connect("mongodb://127.0.0.1/auth_demo_app");
   
//App config
app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//We use body-parser so we can get user data from forms
//Through req.body.username and req.body.password for example
app.use(bodyParser.urlencoded({extended: true}));

//Using express-session at the same time as requiring it
app.use(require("express-session")({
    secret: "Code better N8",
    resave: false,
    saveUninitialized: false
}));


//Initializing express to use passport and session
app.use(passport.initialize());
app.use(passport.session());

//The following means that it will prevent page caching for the whole applications (all routes).
app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});


/*We're telling passport to use a localStrategy method called authenticate(), which comes from
passportLocalMongoose in user.js */
passport.use(new localStrategy(User.authenticate()));
/*
  The following methods are responsible for reading the session,
  taking the encoded data from the session, unencoding it with deserialize
  encoding it with serialize and putting it back in the session
*/
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Our own MiddleWare
function isLoggedIn(req, res, next) {
    //isAuthenticated() is a method from passport package
    //We're going to use this middleware on the /secret route
    //We only want users to access that page if they are logged in
    if(req.isAuthenticated()) {
        //Next will be the route handler when this function gets called as middleware
        return next();
    }
    res.redirect("/login");
}


//=================================================================================
//ROUTES
//=================

app.get('/', (req, res) => {
    res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

//=================
//AUTH ROUTES
//=================

//Show user signup form 
app.get("/register", (req, res) => {
    res.render("register");
});

//Handling user signup
app.post("/register", (req, res) => {
/*We register a new User with their username in the constructor. We send the password as a separate argument
because that will allow it to be hashed. We don't want to store passwords in the database.
Then, if there's an error, we redirect the user to the register page again.
But if no error, we locally authenticate the user and redirect them to the secret page.*/    
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.render("register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secret");
            })
        }
    });
});

//=================
//LOGIN ROUTES
//=================
//Render login form
app.get("/login", (req, res) => {
    res.render("login");
});

//Login logic
/*When our app gets a post request to /login, it will run the passport.authenticate middleware immediately
We can have multiple middleware stacked up running sequentially
The name middleware is given because they sit between the beginning of the route and the end which is the route handler
This middleware takes the password and username that the user filled into the login form in req.body
And it compares the password filled in to the form with the hashed version in the db
If there's a match, we redirect to /secret and if not, we redirect to /login
  */
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), (req, res) => {
    
});

//=================
//LOGOUT ROUTES
//=================

app.get("/logout", (req, res) => {
    //passport is destroying the user data in the session
    req.logout();
    res.redirect("/");
});




app.listen(3000, () => {
    console.log('App listening on port 3000!');
});