var express=require('express');
var app=express();

var web=require('./routes/web');
var admin=require('./routes/admin');
var doctor=require('./routes/doctor');
var customer=require('./routes/customer');

app.use('',web);
app.use('/admin',admin);
app.use('/doctor',doctor);
app.use('/customer',customer);

app.use(express.static('public'));

app.listen(3000);