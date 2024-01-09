const Testimonial = require('./script.js');
const logger= require("./logger.js");
const { Sequelize } = require('sequelize');
const ex= require("express");
const morgan= require("morgan");
const bodyParser = require('body-parser');
const hash= require("bcrypt");
const path = require('path');
const port= 3000;
const ejs= require("ejs");
const app= ex();
const mysql= require("mysql2");
const { timeStamp, error } = require('console');
const { fromWeb } = require('winston-mysql');
const { default: test } = require('node:test');
const { constants } = require('os');

const session= require("express-session");
const { findSourceMap } = require('module');


app.listen(port);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(ex.static("public")); 
app.use(bodyParser.urlencoded({extended:true}));

  app.use(session({
    secret: 'Mixed_colors',
    resave: true,
    saveUninitialized: true
  }));

const testimonialAdmin=[];// array van alle testimonials voor amdin
const testimonials = [];// array van alle testimonials die goedgekeurd zijn worden hier opgeslagen en getoond op website
const arrayFilter=[]; //array van filter

const bedrijven =[];
const bedrijvenPost=[];
const logs=[];  // array van alle logs 

var beheerderdata= {};

  app.set("trust proxy", true);

  const pool = mysql.createPool({
    host: '192.168.1.101',  // PMA_HOST
    user: 'Joshua',            // PMA_USER
    password: 'Testimonia101',  // PMA_PASSWORD
    port: 32768,             // PMA_PORT
    database: 'testimonia', 
    connectionLimit: 10, // Maximum number of connections in the pool
    
  });

  pool.getConnection(function(err, connection) {
    if(err) throw err;
    else {console.log("Connected!");
    console.log("test to see")                    
  }
  });

  function beheerder(username){
    let sql= "SELECT * FROM beheerder where Username= ?";
    pool.query(sql,[username], function(err, results){
      if(err){
        console.log('error oops');
      }else{
        if(results.length>0){
        beheerderdata=results[0];
        console.log(beheerderdata);
        }
      }
    })

  }

  function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

  

  function Filtered(leerjaar, leerrichting){
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM coMaker where Leerjaar= ? AND leerRichting = ?";
      pool.query(sql, [leerjaar, leerrichting], function(err, results) {
          if (err) {
              console.log(err);
              reject(err);
          } else {
              for (let j = 0; j < results.length; j++) {
                  let row = results[j];
                  arrayFilter.push(row);
              }
              console.log("array added");
              resolve(arrayFilter);
          }
      });
  });
}


function BedrijvenLijst(){
  let sql= "SELECT * FROM Bedrijven"
  pool.query(sql,function(err,results){
    if(err){
      console.log("error");
      console.log(err);
    }else{
      for(let i=0; i< results.length;i++){
        let row= results[i];
        bedrijven.push(row);
      }
    }
  })
  return bedrijven;
}
  function ArrayQuery(){
    let query= "SELECT * FROM coMaker WHERE Status > 0"  ;
    pool.query(query,function(error,results){
      if(error){
        console.log('error');
        console.log(error);
      }else{
        for(let i=0; i<results.length;i++){
          let row=results[i];
          let coMaker= new Testimonial(row.Student,row.Beschrijving,row.Naam,row.CoMakerID,row.Leerjaar,row.Leerrichting);
          testimonials.push(coMaker);
        }
      }
    })
    return testimonials;
  }
  
  function GetLogs(){
    const sql= "SELECT * FROM Logs";
    pool.query(sql, function(error,results){
    if(error){
      console.log(error, " no logs available");
    }else{
      for(let i=0; i< results.length;i++){
        let row= results[i];
        logs.push(row);
      }
    }

    });
    return logs;
  }

  function ArrayQueryBeheerder(){

    let query= "SELECT * FROM coMaker"  ;
    pool.query(query,function(error,results){
      if(error){
        console.log('error');
        console.log(error);
      }else{
        for(let i=0; i<results.length;i++){
          let row=results[i];
          let coMaker= new Testimonial(row.Student,row.Beschrijving,row.Naam,row.CoMakerID,row.Leerjaar,row.Leerrichting);
          testimonialAdmin.push(coMaker);
        }
      }
    })
 
    return testimonialAdmin;
  }

 

var testimonialsArray=ArrayQuery();
var testimonialsArrayAdmin=ArrayQueryBeheerder();
var bedrijvenArray= BedrijvenLijst();
  

  app.post("/form-submit",function(req,res){
    const { comaker_name, comaker_description, school_year, company_name, company_description, student_name, profile, privacy } = req.body;
    let query= "INSERT INTO coMaker (Naam, Beschrijving, Leerjaar,student,leerRichting) VALUES (?,?,?,?,?)";

  pool.query(query, [comaker_name, comaker_description, school_year, student_name,profile], (error, results) => {
    if (error) {
      console.error('Error inserting data:', error);
      res.status(404).render("404");
    } else {
      console.log("succesgully entered");
    }
    res.render('index', { testimonialsArray });
  }); 
// dit is hoe de form wordt insert into database^^

  })

  app.post("/FilterTestimonials", async function(req, res){
    const { school_year, leerrichting,submit} = req.body;
    if(submit=="Submit" && school_year!="alles" && leerrichting!= "alles"){

    try {
        const arrayFilter = await Filtered(school_year, leerrichting);
        res.render("Testimonials", { testimonialsArray: arrayFilter });
        arrayFilter.length = 0;
    } catch (error) {
        // Handle the error
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
  }else{
    res.render("Testimonials", {testimonialsArray:testimonialsArray})

  }
});

  app.post("/adminLogin-Post", function(req,res){
   
    const{ username, password}= req.body;
    const saltround=10;
    var Username= username;
    var Password= password;
    let query= "SELECT * FROM beheerder where Username = ? AND Wachtwoord = ?"
    pool.query(query, [Username,Password], function(err,results){
      if(results.length>=1){
        hash.hash(Password,saltround,function(err,hashedPassword){
          if(err){
            console.log("failed to hash")
          }
          else{
            req.session.username = Username;
            console.log("hashed password=" + hashedPassword);
            beheerder(Username);
            res.render('AdminPages/AdminDashboard', {testimonialsArrayAdmin});
          }
        })
      
      }else{
        console.log(err);
        res.status(404).render("404");
      }
    })
    const logMessage = `Admin ${Username} logged in.`;
        let level= logger.level;
        
        let sql= "INSERT INTO Logs(DescriptionLog,Type) VALUES(?,?)";
        pool.query(sql,[logMessage,level],function(error,results){

          if(error){
            console.log(error, "erorr  has occured");
            res.status(404).render("404");

          }else{
            console.log("entered in the databse");
          }

        });
        logger.info(logMessage);

  });

  app.use((req, res, next) => {
    if (req.path === '/adminLogin-Post' && req.body && req.body.username) {
        req.session.username = req.body.username;
    }
    next();
  });
app.use(morgan("dev"));

app.post('/editedPost', (req, res) => {
  const{ ID, Bedrijf, Locatie}= req.body;
  const intID= parseInt(ID);
  let sql= "UPDATE Bedrijven SET BedrijfNaam= ? , BedrijfLocatie= ? WHERE BedrijfID= ?"
  pool.query(sql,[Bedrijf,Locatie,intID],function(err,results){

    if(err){
      console.log("erorrrrr");
      res.status(404).render("404");

    }else{
      console.log("nice job");
      BedrijvenLijst();
    }
   
    
  })
  const logMessage= "admin "+ req.session.username +" made an edit on table BEdrijven";
  const level= logger.level
  let query= "INSERT INTO Logs(DescriptionLog,Type) VALUES(?,?)";
      pool.query(query,[logMessage,level],function(error,results){

        if(error){
          console.log(error, "erorr  has occured");
          res.status(404).render("404");

        }else{
          console.log("entered in the databse");
        }

      });
      logger.info(logMessage);
      res.render( "AdminPages/AdminBedrijven",{bedrijven:bedrijvenArray})
      bedrijven.length=0;
});

  app.post("/DeletePost", function(req,res){
    const{deleteID}= req.body;
    const intID= parseInt(deleteID);
    let sql= "DELETE FROM Bedrijven WHERE BedrijfID=?";
    pool.query(sql,[intID], function(err,results){
      if(err){
        console.log(err);
        res.status(404).render("404");
      }else{
        console.log("deleted the row");
        BedrijvenLijst();
      }
      const logMessage= "user "+ req.session.username +" deleted rows in table Bedrijven";
    const level= logger.level
    let sql= "INSERT INTO Logs(DescriptionLog,Type) VALUES(?,?)";
        pool.query(sql,[logMessage,level],function(error,results){

          if(error){
            console.log(error, "erorr  has occured");
            res.status(404).render("404");

          }else{
            console.log("entered in the databse");
          }

        });
        logger.info(logMessage);

         
    })
   
    console.log(bedrijven)
    res.render("AdminPages/AdminBedrijven",{bedrijven:bedrijvenArray})
    bedrijven.length=0;
  })
  
  app.post("/addPost", function(req,res){
    const{Naam,Locatie}=req.body;
    let sql="INSERT INTO Bedrijven (BedrijfNaam, BedrijfLocatie) VALUES(?,?)";
    pool.query(sql,[Naam,Locatie],function(err,results){
      if(err){
        console.log("errrorr");
        res.status(404).render("404");
      }else{
        console.log("yessirr laten lukken");
        BedrijvenLijst();
      }
      const logMessage= "user "+ req.session.username +" added a row in table BEdrijven";
    const level= logger.level
    let sql= "INSERT INTO Logs(DescriptionLog,Type) VALUES(?,?)";
        pool.query(sql,[logMessage,level],function(error,results){

          if(error){
            console.log(error, "erorr  has occured");
            res.status(404).render("404");

          }else{
            console.log("entered in the databse");
          }

        });
        logger.info(logMessage);
    })
    
    res.render("AdminPages/AdminBedrijven", {bedrijven,bedrijvenArray})
    bedrijven.length=0;
  });

  app.post("/editPostCoMaker",function(req,res){
    const{ID,ComakerNaam,Student, Leerjaar,Beschrijving,Leerrichting}=req.body;
    const intID=parseInt(ID);
    let sql= "UPDATE coMaker SET Naam= ? ,Student=? , Leerjaar=? ,Beschrijving=? ,LeerRichting=? WHERE CoMakerID=?";
    pool.query(sql,[ComakerNaam, Student,Leerjaar,Beschrijving,Leerrichting,intID],function(err,results){
      if(err){
        console.log("errorrrr");
        res.status(404).render("404");

      }else{
        console.log("yessir");
        ArrayQueryBeheerder();
      }
      const logMessage= "user "+ req.session.username +" made an edit on table coMaker";
      const level= logger.level
      let sql= "INSERT INTO Logs(DescriptionLog,Type) VALUES(?,?)";
        pool.query(sql,[logMessage,level],function(error,results){

          if(error){
            console.log(error, "erorr  has occured");
            res.status(404).render("404");

          }else{
            console.log("entered in the databse");
          }

        });
        logger.info(logMessage);
    })
    
    res.render("AdminPages/AdminDashboard",{testimonialsArrayAdmin:testimonialsArrayAdmin})
    testimonialAdmin.length=0;
  });

  app.post("/deletePostComaker",function(req,res){
    const{ID}=req.body;
    intID= parseInt(ID);
    let sql="DELETE FROM coMaker where CoMakerID= ?";

    pool.query(sql,[intID],function(err,results){ 
      if(err){
        console.log("errrroorrr");
        res.status(404).render("404");
      }else{
        console.log("yesssirrr");
        ArrayQueryBeheerder();
      }
      const logMessage= "user "+ req.session.username +" Deleted a row in BEdrijven";
      const level= logger.level
      let sql= "INSERT INTO Logs(DescriptionLog,Type) VALUES(?,?)";
        pool.query(sql,[logMessage,level],function(error,results){

          if(error){
            console.log(error, "erorr  has occured");
            res.status(404).render("404");

          }else{
            console.log("entered in the databse");
          }

        });
        logger.info(logMessage);
    })
    res.render("AdminPages/AdminDashboard",{testimonialsArrayAdmin:testimonialsArrayAdmin})
    testimonialAdmin.length=0;
    
  });

  app.post("/addPostComaker",function(req,res){
    const{ComakerNaam,Student,Leerjaar,Beschrijving,Leerrichting}=req.body
    console.log(Leerrichting);
    let query= "INSERT INTO coMaker (Naam, Beschrijving, Leerjaar,student,leerRichting) VALUES (?,?,?,?,?)";

  pool.query(query, [ComakerNaam, Beschrijving, Leerjaar, Student,Leerrichting], function(error, results){
    if (error) {
      console.error('errrorrrrr', error);
      res.status(404).render("404");
    } else {
      console.log("yessirrrr");
      ArrayQueryBeheerder();
    }
    const logMessage= "user"+ req.session.username +" added a row in Comaker";
    const level= logger.level
    let sql= "INSERT INTO Logs(DescriptionLog,Type) VALUES(?,?)";
        pool.query(sql,[logMessage,level],function(error,results){

          if(error){
            console.log(error, "erorr  has occured");
            res.status(404).render("404");

          }else{
            console.log("entered in the databse");
          }

        });
        logger.info(logMessage);
    
    res.render('AdminPages/AdminDashboard', {testimonialsArrayAdmin });
    testimonialAdmin.length=0;
  })

  });

  app.post('/ChangePassword', function(req,res){
    const{userId,confirmPassword}= req.body;
    sql= "UPDATE beheerder SET Wachtwoord=? WHERE beheerderID= ?";
    pool.query(sql,[confirmPassword,userId],function(err,results){
      if(err){
        console.log("errorrr");
      }else{
        console.log("updated password");
      }
    })

    res.render("AdminPages/AdminPersonal",{beheerderdata:beheerderdata});


  });

  app.post("/beheerderpost", function(req,res){
    const{firstname}=req.body;
    console.log(firstname);
   
    username= firstname+ "_Beheerder"
    email= firstname+"@windesheim.nl"
    role="Beheerder"
    password= generatePassword();

  

    sql="INSERT INTO beheerder(Naam,Username,Wachtwoord,email, role) VALUES(?,?,?,?,?)"
    pool.query(sql,[firstname,username,password,email,role],function(results,err){
      if(err){
        console.log("erorrrr");
        console.log(err);
      }else{
        console.log("nice job");
        
      }
    })
    res.render("AdminPages/AdminPersonal",{beheerderdata:beheerderdata});
  });

  app.post("/toggleFavorite", function(req, res) {
    const coMakerID = req.params.id; // Verkrijg de CoMaker ID uit de URL parameter
  
    // Toggle de favoriet status in de database
    let query = "UPDATE coMaker SET Favoriet = 1- Favoriet WHERE CoMakerID = ?";
    pool.query(query, [coMakerID], function(error, results) {
      if (error) {
        console.error('Error toggling favorite status:', error);
        res.status(500).send("Error toggling favorite status");
      } else {
        // Stuur een bevestiging terug naar de frontend
        res.status(200).send("Favorite status toggled");
      }
    });
  });

  app.post('/goedkeuring', function(req, res) {
    const { ID } = req.body;
    const query = "UPDATE coMaker SET Status=1 WHERE CoMakerID=?";

    pool.query(query, [ID], function(err, results) {
        if (err) {
            console.error("Error updating record:", err);
            res.status(500).send("Internal Server Error"); // Send an appropriate error response
        } else {
            console.log("Record updated successfully");
            res.render('index', { testimonialsArray: testimonialsArray });
        }
    });
});



  
app.get("/", function(req,res){
      console.log(testimonials);
      console.log(testimonialAdmin);
  
      res.render("index",{testimonialsArray:testimonialsArray});
     
    
    console.log(req.url);
     
});

app.get("/form", function(req,res){
  console.log("testi")
  console.log(testimonials);
    res.render('form');
    console.log(req.url);

})

app.get("/Testimonials", function(req,res){
  res.render("Testimonials",{testimonialsArray:testimonialsArray});
  console.log(req.url);
})


app.get("/about", function(req,res){
    res.render("about");
    console.log(testimonialsArray);

    console.log(req.url);      
});

app.get("/adminLogin" , function(req,res){
    res.render("adminLogin");
    console.log(req.url);

});

app.get("/AdminDashboard", function(req,res){
  if(req.session.username){
  res.render("AdminPages/AdminDashboard",{testimonialsArrayAdmin:testimonialsArrayAdmin});
  testimonialAdmin=0;
  
  console.log(req.url);

  }else{
    res.status(404).render("404");

  }
  
  
})
app.get("/AdminBedrijven", function(req,res){
  if(req.session.username){
  console.log(bedrijven);
  bedrijvenArray=BedrijvenLijst();
  res.render("AdminPages/AdminBedrijven",{bedrijven:bedrijvenArray});
  bedrijven.length=0;
  console.log(req.url);
  }else{
    res.status(404).render("404");
  }
  
})
let arrayLogs=GetLogs();

app.get("/AdminLogging", function(req,res){
  if(req.session.username){
  res.render("AdminPages/AdminLogging",{arrayLogs:arrayLogs});
  console.log(req.url);
  }else{
    res.status(404).render("404");

  }
  
  
});
app.get("/AdminPersonal", async function(req, res) {
  if(req.session.username){
  const storedUsername = req.session.username;
  console.log(storedUsername);
  const functie= await beheerder(storedUsername);
  res.render("AdminPages/AdminPersonal", {beheerderdata:beheerderdata});
  }
  else{
    res.status(404).render("404");

  }
});

app.get('/tes', function(req,res){
  res.render('tes')
})

app.use(function(req,res){
    res.status(404).render("404");
    console.log(req.url);
});


module.exports= pool;

