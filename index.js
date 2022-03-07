const express = require('express');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js")
const thesisConfig = require('./config.js');
const auth = require("./Thesis-API/middleware/authenticate")

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`app is running on  port  ${PORT}`);
});

//azurewebsites.net
app.get("/", (req,res) =>
{res.send("API is running");
});

//route to create a user (sign up page)
app.post("/users", async (req, res)=>{

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
    let ACT = req.body.ACT;
    let SAT = req.body.SAT;
    let GPA= req.body.GPA;

    if(!firstName|| !lastName || !email || !password){ return res.status(400).
    send("Bad request")};

    firstName = firstName.replace("'","''");
    lastName = lastName.replace("'","''");

    let emailCheckQuery = `SELECT email
    from users
    where email = '${email}'`;

    let existingUser = await db.executeQuery(emailCheckQuery);

    if (existingUser[0]){return res.status(409).send("duplicate email")};

    let hashedPassword = bcrypt.hashSync(password);

    let insertQuery = 
    `Insert into users (firstName,lastName,email,password,ACT,SAT,GPA)
    values('${firstName}', '${lastName}', '${email}', '${hashedPassword}','${ACT}','${SAT}','${GPA}' )`

    db.executeQuery(insertQuery)
    .then(()=>{res.status(201).send()})
    .catch((err)=>{
        console.log("error in POST /users", err);
        res.status(500).send();
    })

})

//route for user to log in (login page)
app.post("/users/login", async (req,res)=>{

    let email = req.body.email;
    let password = req.body.password;
    
    if(!email || !password){return res.status(400).send("bad request")};
       
    let query = `select *
    from users
    where email = '${email}'` 
    
    let result 
    try{
        result = await db.executeQuery(query);
    }catch(myError){
        console.log("error in /users/login", myError);
        return res.status(500).send();
    }
    
    if(!result[0]){
        return res.status(401).send("invalid user credentials no user");
    }
    let user = result[0];
    
    if(!bcrypt.compareSync(password, user.password)){
        console.log(user.token)
        return res.status(401).send("invalid user credentials wrong password");
    }
    
    let token = jwt.sign({pk:user.userID}, thesisConfig.JWT, {
        expiresIn: "60 minutes",
    });
    console.log("token", token);
    
    let setTokenQuery = `update users
    set token = '${token}'
    where userID = ${user.userID}`
    
    try{
       await db.executeQuery(setTokenQuery);
    
       res.status(200).send({
           token: token,
           user: {
               firstName: user.firstName,
               lastName: user.lastName,
               email: user.email,
               userID: user.userID, 
           },
       });
    }
    catch(myError){
        console.log("error in a setting user token", myError);
        res.status(500).send()
    }
    
    });

// route to logout a user
app.post("/users/logout", auth, (req,res)=>{
  let query = `Update users
  set token = null
  where userID = ${req.users.userID}`;
  
  db.executeQuery(query)
  .then(()=>{res.status(200).send()})
  .catch((err)=>{
console.log("error in POST /users/logout", err);
res.status(500).send;
  })
})

//route to see the signed in user
app.get("/users/me",auth,(req,res)=>{
    res.send(req.user);
})

//request to pull all the records on colleges
app.get("/colleges", (req,res)=>{
    db.executeQuery(
    `select *
    from colleges`
    ).then((theResults)=>{
        res.status(200).send(theResults)
    })
    .catch((myError)=>{
        console.log(myError);
        res.status(500).send();
    });
});
//route to get a specifc college
app.get("/colleges/:pk", (req,res)=>{
    let pk = req.params.pk;
    let myQuery = `select *
    from colleges
    Where collegeID = ${pk}`

    db.executeQuery(myQuery)
    .then((result)=>{
        console.log("result",result);
      if(result[0]) {
          res.send(result[0]);
        }else{
            res.status(404).send(`bad request`);
        } 
    })
    .catch((err)=>{
        console.log("error in /college/:pk", err);
        res.status(500).send()
    });
});
//request to pull all the records on scholarships
app.get("/scholarships", (req,res)=>{
    db.executeQuery(
    `select *
    from scholarships`
    ).then((theResults)=>{
        res.status(200).send(theResults)
    })
    .catch((myError)=>{
        console.log(myError);
        res.status(500).send();
    });
});
//route to get a specifc scholarship
app.get("/scholarships/:pk", (req,res)=>{
    let pk = req.params.pk;
    let myQuery = `select *
    from scholarships
    Where scholarshipID = ${pk}`

    db.executeQuery(myQuery)
    .then((result)=>{
        console.log("result",result);
      if(result[0]) {
          res.send(result[0]);
        }else{
            res.status(404).send(`bad request`);
        } 
    })
    .catch((err)=>{
        console.log("error in /scholarships/:pk", err);
        res.status(500).send()
    });
});

//route for users to create a plan

app.post("/plans", auth, async (req,res)=>{

    let tuition = req.body.tuition;
    let books = req.body.books;
    let supplies = req.body.supplies;
    let academic_misc = req.body.academic_misc;
    let academic_total = req.body.academic_total;
    let rent = req.body.rent;
    let groceries = req.body.groceries;
    let utilities = req.body.utilities;
    let phone = req.body.phone;
    let insurance = req.body.insurance;
    let transportation = req.body.transportation;
    let living_misc = req.body.living_misc;
    let living_total = req.body.living_total;
    let entertainment = req.body.entertainment;
    let shopping = req.body.shopping;
    let food = req.body.food;
    let savings = req.body.savings;
    let personal_misc = req.body.personal_misc;
    let personal_total = req.body.personal_total;
    let expenses_total = req.body.expenses_total;
    let job = req.body.job;
    let scholarships = req.body.scholarships;
    let grants = req.body.grants;
    let contributions = req.body.contributions;
    let income_misc = req.body.income_misc;
    let income_total = req.body.income_total;


    let insertQuery = 
    `Insert into plans (tuition, books,supplies,academic_misc,academic_total,rent,groceries,utilities,phone,
        insurance,transportation,living_misc,living_total,entertainment,shopping,food,savings,personal_misc,
        personal_total,expenses_total,job,scholarships,grants,contributions,income_misc,income_total,userID)

    values('${tuition}', '${books}','${supplies}','${academic_misc}','${academic_total}','${rent}','${groceries}','${utilities}','${phone}',
    '${insurance}','${transportation}','${living_misc}','${living_total}','${entertainment}','${shopping}','${food}','${savings}',
    '${personal_misc}','${personal_total}','${expenses_total}','${job}','${scholarships}','${grants}','${contributions}',
    '${income_misc}','${income_total}',${req.users.userID})`;

    db.executeQuery(insertQuery)
    .then(()=>{res.status(201).send()})
    .catch((err)=>{
        console.log("error in POST /plans", err);
        res.status(500).send();
    })
})

//route for users to see all of the plans they have created

app.get("/plans/me", auth, async (req,res)=>{

})