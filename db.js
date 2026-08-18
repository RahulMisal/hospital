var mysql=require('mysql2');
var util=require('util');

var conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'hospital_web',
    port:3307
});

var exe=util.promisify(conn.query).bind(conn);

module.exports=exe;