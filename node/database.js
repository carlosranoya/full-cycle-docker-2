

const dbConfig = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb'
};

const mysql = require('mysql');

async function isInitialized() {
 
    const connection = mysql.createConnection(dbConfig);
    const sql = `SELECT TABLE_SCHEMA FROM information_schema.tables WHERE table_schema = '${dbConfig.database}' LIMIT 1;`;
    // console.log(sql);

    return new Promise((resolve, reject) => {
        connection.query(sql, function (err, result, fields) {
            // connection.end();
            if (err){
                reject(err)          
            }
            resolve(result !== undefined && result.length > 0);   
        });
    })

}

async function init() {
    let is_initialized = false;
    
    try {
        is_initialized = await isInitialized();
    }
    catch (e) {
        throw e;
    }

    console.log("database already initialized: ", is_initialized);
    if (is_initialized) return;

    console.log("\nCreating table people...");

    const connection = mysql.createConnection(dbConfig);

    console.log("Creating table people....");
    const sql = "CREATE TABLE `people` (\
        id int(11) AUTO_INCREMENT PRIMARY KEY,  \
        name varchar(100) NOT NULL \
    ) ENGINE=InnoDB AUTO_INCREMENT=53022 DEFAULT CHARSET=utf8;";
    console.log(sql);
    connection.query(sql);

    console.log("\nPopulating table people....");

    const data = require("./initial_population");

    var sql_insert = `INSERT INTO people(name) VALUES\n('${data.population.join("'),\n('")}')`;
    console.log(sql_insert);

    connection.query(sql_insert);

    connection.end();

}

function postPerson(name, callback) {
    const mysql = require('mysql');
    const connection = mysql.createConnection(dbConfig);
    const sql = `INSERT INTO people(name) values('${name}')`;
    connection.query(sql);
    const get_sql = `SELECT * FROM people WHERE name = '${name}' ORDER BY id DESC LIMIT 1`;
    connection.query(get_sql, callback);
    connection.end()
}

function getPeople(callback) {
    const mysql = require('mysql');
    const connection = mysql.createConnection(dbConfig);
    const sql = `SELECT * FROM people`;
    connection.query(sql, callback);
    connection.end();
}

function deletePerson(id, callback) {
    const mysql = require('mysql');
    const connection = mysql.createConnection(dbConfig);
    const sql = `DELETE FROM people WHERE id = ${id}`;
    connection.query(sql, callback);
    connection.end();
}

var repo = { 
    init: init,
    postPerson: postPerson,
    getPeople: getPeople,
    deletePerson: deletePerson
}

module.exports = repo;