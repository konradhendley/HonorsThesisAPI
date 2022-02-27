const express = require('express');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js")
const thesisConfig = require('./config.js');

const auth = require("./Thesis-API/middleware/authenticate")
const authorize = require("./Thesis-API/middleware/authorize")

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

//route for users to see all of the plans they have created




//PATCH route for users to update their information
//needs to be updated
app.patch("/user/me", auth, async (req,res)=>{

    user = req.user;

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let password = req.body.password;
    let email = req.body.email;

    if(!firstName|| !lastName || !email || !password){ return res.status(400).
    send("Bad request")};

    firstName = firstName.replace("'","''");
    lastName = lastName.replace("'","''");

    let emailCheckQuery = `SELECT email
    from user
    where email = '${email}'`;

    let existingUser = await db. executeQuery(emailCheckQuery);

    if (existingUser[0]){return res.status(409).send("duplicate email")};

    let hashedPassword = bcrypt.hashSync(password);

    let insertQuery = 
    `update users
    set firstName = '${firstName}', lastName = '${lastName}', email ='${email}', password = '${hashedPassword}'
    where userID = ${users.userID}`

    db.executeQuery(insertQuery)
    .then(()=>{res.status(201).send()})
    .catch((err)=>{
        console.log("error in PATCH/users/me/update", err);
        res.status(500).send();
    })
})


//route to see the signed in user
app.get("/users/me",auth,(req,res)=>{
    res.send(req.user);
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
    return res.status(401).send("invalid user credentials");
}
let users = result[0];

if(!bcrypt.compareSync(password, users.token)){
    return res.status(401).send("invalid user credentials");
}

let token = jwt.sign({pk:users.userID}, thesisConfig.JWT, {
    expiresIn: "60 minutes",
});
console.log("token", token);

let setTokenQuery = `update users
set token = '${token}'
where userID = ${users.userID}`

try{
   await db.executeQuery(setTokenQuery);

   res.status(200).send({
       token: token,
       user: {
           firstName: users.firstName,
           lastName: users.lastName,
           email: users.email,
           userID: users.userID, 
       },
   });
}
catch(myError){
    console.log("error in a setting user token", myError);
    res.status(500).send()
}

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
    `Insert into users (firstName,lastName,email,token,ACT,SAT,GPA)
    values('${firstName}', '${lastName}', '${email}', '${hashedPassword}','${ACT}','${SAT}','${GPA}' )`

    db.executeQuery(insertQuery)
    .then(()=>{res.status(201).send()})
    .catch((err)=>{
        console.log("error in POST /users", err);
        res.status(500).send();
    })

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