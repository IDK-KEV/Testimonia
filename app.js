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
const { timeStamp } = require('console');
const { fromWeb } = require('winston-mysql');
const { default: test } = require('node:test');
const { constants } = require('os');

const session= require("express-session");


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




const testimonials = [];// array van alle testimonials worden hierin opgeslagen
const arrayFilter=[]; //arrat van filter
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
    let query= "SELECT * FROM coMaker" ;
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
 

var testimonialsArray=ArrayQuery();
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
            console.log("hashed password=" + hashedPassword)
            res.render('AdminPages/AdminDashboard', {testimonialsArray});
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
  const logMessage= "user "+ req.session.username +" made an edit on table BEdrijven";
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
      res.render( "AdminPages/AdminBedrijven",{bedrijven:bedrijven})
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
        ArrayQuery();
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
    
    res.render("AdminPages/AdminDashboard",{testimonialsArray:testimonialsArray})
    testimonials.length=0;
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
        ArrayQuery();
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
    res.render("AdminPages/AdminDashboard",{testimonialsArray:testimonialsArray})
    testimonials.length=0;
    
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
      ArrayQuery();
    }
    const logMessage= "user"+ req.session.username +" added a row in BEdrijven";
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
    
    res.render('AdminPages/AdminDashboard', {testimonialsArray });
    testimonials.length=0;
  })

  });


  
app.get("/", function(req,res){
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
  testimonialsArray=ArrayQuery();
  res.render("AdminPages/AdminDashboard",{testimonialsArray:testimonialsArray});
  testimonials.length=0;
  console.log(req.url);
  
})
app.get("/AdminBedrijven", function(req,res){
  console.log(bedrijven);
  bedrijvenArray=BedrijvenLijst();
  res.render("AdminPages/AdminBedrijven",{bedrijven:bedrijvenArray});
  bedrijven.length=0;
  console.log(req.url);
  
})
let arrayLogs=GetLogs();
app.get("/AdminLogging", function(req,res){
  res.render("AdminPages/AdminLogging",{arrayLogs:arrayLogs});
  console.log(req.url);
  
  
})
app.get("/AdminPersonal", function(req, res) {
  
  const storedUsername = req.session.username;
  console.log(storedUsername);
  beheerder(storedUsername);
  console.log(beheerderdata);
  res.render("AdminPages/AdminPersonal", {beheerderdata:beheerderdata});
});

app.use(function(req,res){
    res.status(404).render("404");
    console.log(req.url);
});


module.exports= pool;

