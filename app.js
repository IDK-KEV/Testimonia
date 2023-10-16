
const ex= require("express");

const port= 3000;

const ejs= require("ejs");
const app= ex();

app.set("view engine", "ejs");
app.set("views", "views"); // Set the views directory
 
app.listen(port);

app.get("/", function(req,res){
    res.render("index");
   
});

app.get("/form", function(req,res){
    res.render('form')
    console.log(req.url);
})

app.get("/about", function(req,res){
    res.render("about");
    
});

app.use(function(req,res){

    res.status(404).render("404");
    
});
