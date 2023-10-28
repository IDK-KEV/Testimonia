
const ex= require("express");
const morgan= require("morgan");
const { connection } = require('./Db.js');
const port= 3000;
const ejs= require("ejs");
const app= ex();
const mysql= require("mysql2");

var con = mysql.createConnection({
    host: "192.168.1.101",
    user: "Joshua",
    password: "Testimonia101",
    database:"testimonia"

  });


  app.set("trust proxy", true);


  con.connect((error) => {
    if(error){
        console.error("error", error);   
    }else{
        console.log("connected");   
    }
  })    


//   con.end((err) => {
//     if (err) {
//       console.error('Error closing the connection:', err);
//       return;
//     }
//     console.log('Connection closed');
//   });


app.set("view engine", "ejs");
app.set("views", "views"); // Set the views directory
app.use(ex.static("public")); // Serve static assets like images

app.use(morgan("dev"));
 
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


process.on("SIGINT", () => {
    con.end((err) => {
      if (err) {
        console.error("Error closing the connection:", err);
      } else {
        console.log("Connection closed");
      }
      process.exit(0);
    });
  });
