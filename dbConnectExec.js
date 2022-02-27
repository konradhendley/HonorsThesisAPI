const { builtinModules } = require("module");
const sql = require("mssql");
const honorsThesis = require("./config.js");


const config = {
    user: honorsThesis.DB.user,
    password: honorsThesis.DB.password,
    server: honorsThesis.DB.server,
    database: honorsThesis.DB.database,
};

async function executeQuery(aQuery){
    let connection = await sql.connect(config);
    let result = await connection.query(aQuery);

    //console.log(result)
    return result.recordset
}

module.exports = {executeQuery: executeQuery};