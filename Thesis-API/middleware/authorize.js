
   
const jwt = require("jsonwebtoken");

const db = require("/Users/konradhendley/Desktop/Honors Thesis/dbConnectExec.js")
const thesisConfig = require("/Users/konradhendley/Desktop/Honors Thesis/config.js");

const authorize = async(req,res,next)=>{
    
  try{

    //1 decode token

    let myToken = req.header("Authorization").replace("Bearer ","");

    let decoded = jwt.verify(myToken, thesisConfig.JWT);
    console.log(decoded);

   let userID = decoded.pk;

    //2 compare token with database
    let query = `select userID, firstName, lastName, roleType, email
    from Member
    where userID = ${userID} and token = '${myToken}' and roleType = 'Admin'`;

    let returnedUser = await db.executeQuery(query);
    console.log("returned user", returnedUser)

    //3 save user info in the request
    if(returnedUser[0]){
      req.member = returnedUser[0];
      next();
    }
    else{
      return res.status(401).send("invalid credentials (not admin user)");
    }

  }
  catch(err){
      console.log(err);
      return res.status(401).send("invalid credentials");
    }
  }
module.exports = authorize;