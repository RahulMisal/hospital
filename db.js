var mysql=require('mysql2');
var util=require('util');

var conn=mysql.createConnection({
    host:'brtrgihkpflcpdlmwxtj-mysql.services.clever-cloud.com',
    user:'uh1jhckgfyweaqit',
    password:'QAvKSrKX83YEG6wExWzQ',
    database:'brtrgihkpflcpdlmwxtj'
});

var exe=util.promisify(conn.query).bind(conn);

module.exports=exe;
