
const ex= require("express");

const port= 3000;

const ejs= require("ejs");
const app= ex();

app.set("view engine", "ejs");
app.set("views", "views"); // Set the views directory
app.use(ex.static("public")); // Serve static assets like images
 
app.listen(port);

app.get("/", function(req,res){
    res.render("index");
    console.log(req.url);
   
});

app.get("/form", function(req,res){
    res.render('form')
    console.log(req.url);

})

app.get("/about", function(req,res){
    res.render("about");
    console.log(req.url);

    

     
});

app.use(function(req,res){
    res.status(404).render("404");
    console.log(req.url);

    
});
