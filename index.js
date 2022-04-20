const http = require('http');
const fs = require('fs');
const express= require('express');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const app= express();
const morgan =require('morgan');
const mongoose = require('mongoose');
const fill = require("./models/filler");
const seek = require("./models/seeker");
const fillercom = require("./models/fillercompany");
const comp = require('./models/comp');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { ifError } = require('assert');
const {JWT_SECRET}= require('./keys');
const bcrypt = require('bcryptjs');
const store = require('store2');


//connect to db
const dburl = 'mongodb+srv://Project1:make1234@cluster0.kusws.mongodb.net/projectPL?retryWrites=true&w=majority';
mongoose.connect(dburl)
 .then((result)=> console.log('connected to db')).catch((err)=> console.log(err));

 app.listen(3000);
 
 //transporter 
 const transporter = nodemailer.createTransport(sendgridTransport({
     auth:{
         api_key:"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"
     }
 }));

//making public (useable) for server and middleware
app.use(express.static('./firstend/public'));
app.use(express.static('./firstend/fonts'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
// view engine
app.set('view engine','ejs'); 
app.set('views','firstend');




// app.use(express.static('css1'));
//app.use(express.static('fonts'));
                /////
// it gets / request and it response file
app.get('/',(req,res) => {
   
      res.render('index');
});

app.post('/homejb',(req,res) => {
    // const a= store.get('user');
    // console.log(a.Email);
    // console.log(req.body);
   seek.findOne({fname:req.body.fname,field:req.body.field,Education:req.body.Education,workext:req.body.workext})
        .then(result=>{
            if(result){
                console.log('u have already submitted the same files,pls be petient and check ur email');
                res.render('newhomere3',{name:result.fname}); //try like name dipslayed on screen
            }
            else{
                // the below code ....
                const{fname,field,cgpa,sex,Education,language,workext}=req.body;
                const seekinfo = new seek({
                    fname,
                    field,
                    cgpa,
                    sex,
                    Education,
                    language,
                    workext,
                    loggedby:a,
                    Email:a.Email
                });

                seekinfo.save().then((result)=>{
                    console.log(result);
                    res.render('loghomejb');
                })
                .catch((err)=>console.log(err));
            }
        });    
    
});

app.post('/home',(req,res) => {
  
  console.log(req.body);



    const compinfo = new comp(req.body);

    compinfo.save().then((result)=>{
    

       seek.find({field:req.body.Field,Education:req.body.Education,cgpa:{$gte:req.body.cgpa},workext:{$gte:req.body.workext}})
    .then(risk=>{
       console.log(risk.Email);
       console.log(risk);
       res.render('loghome',{name:risk});
       
    });
    })
    .catch((err)=>console.log(err));
    

});

// it gets /login request and it response file
app.get('/login',(req,res) => {

    res.render('login');
});

app.post('/login',(req,res) => {
    console.log(req.body);
    if(req.body.name=== "jobseeker")
    {
         fillercom.findOne({Email:req.body.Email}).then(user=>{

            if(user){
                console.log("this account already exist");
                res.render('register1');
            }
            else{  
                fill.findOne({Email:req.body.Email})
             .then(result=>{
                if(result){
                    console.log("this account already exist");
                    res.render('register1');
                }
                else{
                    // the below code...
                    console.log("new account");
                    const{name,Email,telephone,password} = req.body;
                    bcrypt.hash(password,12)
                    .then(hashedpassword =>{ 
                        
                        const info = new fill({
                            name,Email,telephone,password:hashedpassword
                    });
    
                    info.save().then((result)=>{
                                transporter.sendMail({
                                    to:info.Email,
                                    from:"getnetabenezar@gmail.com",
                                    subject:"register successfully",
                                    html:"<h2>Welcome to Make </h2>"
                                })
                                .then(()=>{
                                    console.log('welcome jb');
                                }).catch((err)=>console.log(err));
               
                       res.redirect('/login');         
                    })
                   .catch((err)=>console.log(err));
                    });
                    
                }
            }); 
         }

        }).catch((err)=>console.log(err));
        
           
     }
    else if(req.body.name=== "Company")
    {
        fill.findOne({Email:req.body.Email})
             .then(user=>{
                 if(user){
                    console.log("this account already exist");
                    res.render('register1');
                 }
                 else{
                    fillercom.findOne({Email:req.body.Email})
        .then(result=>{
            if(result){
                console.log("this account already exist");
                res.render('register1');
            }
            else{
                // the below code...
                const{name,Email,telephone,pssword} = req.body;
                bcrypt.hash(pssword,12)
                    .then(hashedpssword =>{ 
                        const infocomp = new fillercom({
                            name,Email,telephone,pssword:hashedpssword
                        });
                        infocomp.save().then((result)=>{
                                transporter.sendMail({
                                    to:infocomp.Email,
                                    from:"getnetabenezar@gmail.com",
                                    subject:"register successfully",
                                    html:"<h2>Welcome to Make </h2>"
                                }).then(()=>{
                                    console.log('welcome cm');
                                
        
                                }).catch((err)=>console.log(err));
                                res.redirect('/login');
                            })
                            .catch((err)=>console.log(err));
                    });
                

            }
        });   
                 }
             }).catch((err)=>console.log(err));
       
    

    }
    
    else{console.log('erre');}
   
});

// it gets /reset request and it response file for forget password
app.get('/reset',(req,res)=>{

    res.render('reset');
});

// email sending reset password it needs checking
 
 app.post('/reset',(req,res)=>{
     
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
        }        
        const taken= buffer.toString("hex");
        fillercom.findOne({Email:req.body.Email}).then(rep1=>{
        if(rep1){
            // u can use rep1 instead of fillercom
            rep1.resetTaken = taken;
            rep1.expireTaken = Date.now() + 7200000 ;
            rep1.save().then(() =>{
                transporter.sendMail({
                    to:req.body.Email,
                    from:"getnetabenezar@gmail.com",
                    subject:"reset password",
                    html:`
                        <p> your requested for password reset</p>
                        <h2>click in this <a href="http://localhost:3000/forgotpsw/${taken}">link</a> to reset password</h2>
                    `}).then(()=>{
                        res.render('newhomeres');
                    console.log("check your email101");
                    // render smthg
                });
            });
        }
        else{
             fill.findOne({Email:req.body.Email}).then(rep2=>{
        if(rep2){
            
            rep2.resetTaken = taken;
            rep2.expireTaken = Date.now() + 7200000 ;
            rep2.save().then(() =>{
                transporter.sendMail({
                    to:req.body.Email,
                    from:"getnetabenezar@gmail.com",
                    subject:"reset password",
                    html:`
                        <p> your requested for password reset</p>
                        <h2>click in this <a href="http://localhost:3000/forgotpsw/${taken}">link</a> to reset password</h2>
                    `}).then(()=>{
                        res.render('newhomeres');
                    console.log("check your email");
                });
            });
        
        }
        else{
            res.render('newhomeres1');
        }
     });
        }
        

         });
  
        
    });



});

app.get('/about',(req,res) => {

    res.render('index#about-us');
});

app.get('/register',(req,res) => {

    res.render('register');
});

app.post('/company',(req,res) => {
    const pssword=req.body.pssword;
    fillercom.findOne({Email:req.body.Email})
        .then((result)=>{
            if(result){
                bcrypt.compare(pssword,result.pssword)
                .then(match=>{
                    if(match){
                        res.render('company',{name:result.name});
                    }
                    else{
                        res.render('login1');
                    }
                })
            
            }else
            res.render('login1');
        }).catch((err)=>{
            console.log(err);
        });
    
    });


app.post('/jobseeker',(req,res) => {
    fill.findOne({Email:req.body.Email})
    .then((result)=>{
        if(result){
            bcrypt.compare(req.body.password,result.password)
            .then(match=>{
                if(match){
                    store.set('user',result);
                    res.render('jobseeker',{name:result.name});
                }
                else{res.render('login1');}
            });
            
        }else
        res.render('login1');
    }).catch((err)=>{
        console.log(err);
    });

});

app.get('/forgotpsw/:taken',(req,res)=> {
 
res.render('reset3');
});
//fixed things are here
app.post('/forgotpsw/:taken',(req,res)=>{
    const taken = req.params;
    const sentTaken=taken.taken;
    console.log(req.body);
    if(req.body.password){
        const newpassword=req.body.password;            
          fill.findOne({resetTaken:sentTaken,expireTaken:{$gt:Date.now()}}).then(user=>{
                 if(!user){
                     //    return res.status(404).json({error:"Try agin session error"});
                     console.log("Try again session error");
                     res.render('reset2');
                    }
                else{
                    bcrypt.hash(newpassword,12).then(hashedpassword=>{
                        user.password=hashedpassword;
                        user.resetTaken=undefined;
                        user.expireTaken=undefined;
                        user.save().then(saved=>{
                            res.render("login2");
                            console.log("password changed");
                        });
                    })
                    
                  }
         
         
             }).catch(err=> console.log(err));
            
                 
    }
    else{
        const newpassword=req.body.pssword;
        fillercom.findOne({resetTaken:sentTaken,expireTaken:{$gt:Date.now()}}).then(user=>{
            if(!user){
                     //    return res.status(404).json({error:"Try agin session error"});
                    console.log("Try again session error");
                    res.render('reset2');
                }
            else{ 
                bcrypt.hash(newpassword,12).then(hashedpssword=>{
                    user.pssword=hashedpssword;
                    user.resetTaken=undefined;
                    user.expireTaken=undefined;
                    user.save().then(saved=>{
                        res.render("login2");
                        console.log("password changed");
                        });
                });
                 
                }
            
                 
         }).catch(err=> console.log(err));
    }
});
