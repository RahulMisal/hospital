var express=require('express');
var router=express.Router();
var session=require('express-session');
var exe1=require('../db.js');
var image1=require('express-fileupload');

router.use(session({
    secret: 'hospital_secret',
    resave: false,
    saveUninitialized: true
}));
router.use(image1());
function login_check(req,res,next){
    if(req.session.p_id){
        next();
    }else{
        res.redirect('/login');
    }
}
router.get('',async(req,res)=>{
    // res.send('Welcome Customer Panal');
    var id=1; // req.session.p_id
    var sql='select * from customer where p_id=?';
    var data=await exe1(sql,[id]);
    var sql2='select COUNT(*) AS record_count from prescription where p_id=?';
    var prescription=await exe1(sql2,[id]);
    // res.send(prescription);
    res.render('customer/dashboard.ejs',{data:data[0],prescription:prescription[0]});
})
router.get('/profile',async(req,res)=>{
    var id=1; // req.session.p_id
    var sql='select * from customer where p_id=?';
    var data=await exe1(sql,[id]);
    res.render('customer/profile.ejs',{data:data[0]});
})
router.post('/profile_save',async(req,res)=>{
    // res.send(req.body);
    var id=1; // req.session.p_id
    var {p_photo_old,p_name,p_email,p_phone,p_dob,p_bloodgroup,p_gender,p_address}=req.body;
    if(req.files){
        var image='new';
    }else{
        var image='old';
    }
    var sql='update customer set p_photo=?,p_name=?,p_email=?,p_phone=?,p_dob=?,p_bloodgroup=?,p_gender=?,p_address=? where p_id=?';
    var data=await exe1(sql,[image,p_name,p_email,p_phone,p_dob,p_bloodgroup,p_gender,p_address,id]);
    res.redirect('/customer/profile');
})
router.get('/appointments',async(req,res)=>{
    var id=1; // req.session.p_id
    var sql='select * from doctor';
    var data=await exe1(sql);
    var sql2='SELECT a.*, d.* FROM appointment AS a INNER JOIN doctor AS d ON a.app_dr_name = d.doc_id where a.customer_id=?';
    var data2=await exe1(sql2,[id]);
    // res.send(data2);
     res.render('customer/appointments.ejs',{data:data,data2:data2});
})
router.post('/book_appointment',async(req,res)=>{
    var {app_dr_name,app_date,app_time,app_reason}=req.body;
    var id=1; // req.session.p_id
    var sql="insert into appointment(app_dr_name,app_date,app_time,app_reason,customer_id,status,payment_status)values(?,?,?,?,?,?)";
    var data=await exe1(sql,[app_dr_name,app_date,app_time,app_reason,id,'pending','Pending']);
    res.redirect('/customer/appointments');
})
router.get('/treatment',async(req,res)=>{
    var id=2 //req.session.doc_id
    var sql1=`SELECT 
    d.*,
    ct.*
FROM doctor d
INNER JOIN customer_treatment ct
    ON d.doc_id = ct.doc_id
WHERE ct.treatment_p_id = ?
ORDER BY ct.treatment_id DESC`;
    var data2=await exe1(sql1,[id]);
    // res.send(data2);
    res.render('customer/treatment-history.ejs',{data2:data2});
})
router.get('/prescriptions',async(req,res)=>{
     var id=1 //req.session.doc_id
    var sql1=`SELECT 
    d.*,
    p.*
FROM doctor d
INNER JOIN prescription p
    ON d.doc_id = p.dr_id
WHERE p.p_id = ?
ORDER BY p.prescription_id DESC`;
    var data2=await exe1(sql1,[id]);
    // res.send(data2)
    res.render('customer/prescriptions.ejs',{data2:data2});
})
router.get('/prescriptions_view/:id/:drid',async(req,res)=>{
    var id=1 //req.session.doc_id
    var preid=req.params.id;
    var drid=req.params.drid;
    var sql='select * from prescription p LEFT JOIN prescription_medicine m ON p.prescription_id=m.prescription_id where p.prescription_id=?';
    var data=await exe1(sql,[preid]);
     var sql2='select * from doctor where doc_id=?';
    var doctor=await exe1(sql2,[drid]);
     var sql3='select * from customer where p_id=?';
    var customer=await exe1(sql3,[id]);
    // res.send(data);
    res.render('customer/prescription_view.ejs',{data:data,doctor:doctor[0],customer:customer[0]});
})
router.get('/payments',async(req,res)=>{
     var id=1 //req.session.doc_id
    var sql1=`SELECT 
    d.*,
    a.*
FROM doctor d
INNER JOIN appointment a
    ON d.doc_id = a.app_dr_name
WHERE a.customer_id = ? and a.status='complete'
ORDER BY a.app_id DESC`;
    var data2=await exe1(sql1,[id]);
    // res.send(data2);
    res.render('customer/payments.ejs',{data2:data2});
})
router.get('/payment_paid/:id',async(req,res)=>{
     var id=req.params.id;
    var sql='update appointment set payment_status=? where app_id=?';
    var data=await exe1(sql,['paid',id]);
    res.redirect('/customer/payments');
})
module.exports=router;