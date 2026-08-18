var express=require('express');
var router=express.Router();
var exe1=require('../db.js');
var session=require('express-session');

router.use(session({
    secret: 'hospital_secret',
    resave: false,
    saveUninitialized: true
}));
router.use(express.urlencoded({extended:true}));

router.get('',async(req,res)=>{
    var sql='select * from department';
    var department=await exe1(sql);
    var sql1='select * from doctor';
    var doctor=await exe1(sql1);
     var sql2='select * from treatment';
    var treatment=await exe1(sql2);
    // res.send(department);
    res.render('index.ejs',{department:department,doctor:doctor,treatment:treatment});
})
router.get('/about',(req,res)=>{
    res.render('about.ejs');
})
router.get('/departments',async(req,res)=>{
    var sql='select * from department';
    var department=await exe1(sql);
    
    res.render('departments.ejs',{department:department});
})
router.get('/doctors',async(req,res)=>{
    var sql='select * from department';
    var department=await exe1(sql);
    var sql1='select * from doctor';
    var doctor=await exe1(sql1);
    res.render('doctors.ejs',{department:department,doctor:doctor});
})
router.get('/doctors1',async(req,res)=>{
    var doctor=req.query.doctor;
    var dept_name=req.query.dept_name;
    var sql=`SELECT * FROM doctor WHERE doc_name LIKE '%${doctor}%' AND doc_departmentid=${dept_name}`;
    var doctor1=await exe1(sql);
    // res.send(doctor1);
    var sql='select * from department';
    var department=await exe1(sql);
     res.render('doctors.ejs',{department:department,doctor:doctor1});
})
router.get('/doctor-details/:id',async(req,res)=>{
    var id=req.params.id;
    var sql='select * from doctor where doc_id=?';
    var doctor=await exe1(sql,[id]);
    res.render('doctor-details.ejs',{doctor:doctor[0]});
})

router.get('/services',(req,res)=>{
    res.render('services.ejs');
})
router.get('/blog',(req,res)=>{
    res.render('blog.ejs');
})
router.get('/contact',(req,res)=>{
    res.render('contact.ejs');
})
router.get('/contact',(req,res)=>{
    res.render('contact.ejs');
})
router.get('/testimonials',(req,res)=>{
    res.render('testimonials.ejs');
})
router.get('/treatment',(req,res)=>{
    res.render('treatment.ejs');
})
router.get('/login',(req,res)=>{
    res.render('login.ejs');
})
router.post('/login_check',async(req,res)=>{
    // res.send(req.body);
    var {email,password}=req.body;
    var sql='select * from doctor where doc_email=? and doc_password=?';
    var doctor=await exe1(sql,[email,password]);
    var sql1='select * from customer where p_email=? and p_password=?';
    var customer=await exe1(sql1,[email,password]);
    // res.send(doctor);
    if(doctor[0]){
        req.session.doc_id=doctor[0].doc_id;
        req.session.doc_name=doctor[0].doc_name;
        res.redirect('/doctor/');
    }else if(customer[0]){
        req.session.p_id=customer[0].p_id;
        req.session.p_name=customer[0].p_name;
        res.redirect('/customer/');
    }else{
        res.send('Record Not Found')
    }
})
router.get('/forgot-password',(req,res)=>{
    res.render('forgot-password.ejs');
})
router.get('/register',(req,res)=>{
    res.render('register.ejs');
})
router.post('/register_save',async(req,res)=>{
    // res.send(req.body);
    var {p_name,p_email,p_phone,p_password,p_confirmPassword}=req.body;
    var sql='select * from customer where p_email=?';
    var customer=await exe1(sql,[p_email]);
    if(customer[0]){
        res.send('Already Exist');
    }else{
        var sql1='insert into customer(p_name,p_email,p_phone,p_password)values(?,?,?,?)';
        var data=await exe1(sql1,[p_name,p_email,p_phone,p_password]);
        res.redirect('/login');
    }
})
router.get('/appointment',async(req,res)=>{
    var sql='select * from department';
    var department=await exe1(sql);
    var sql1='select * from doctor';
    var doctor=await exe1(sql1);
    res.render('appointment.ejs',{department:department,doctor:doctor});
})
router.post('/appointment_save',async(req,res)=>{
    // res.send(req.body);
    var {app_patientname,app_phone,app_email,app_departmentid,app_doctorid,app_date,app_time,app_reason}=req.body;
    var sql="insert into appointment_web(app_patientname,app_phone,app_email,app_departmentid,app_doctorid,app_date,app_time,app_reason,status)values(?,?,?,?,?,?,?,?,?)";
    var data=await exe1(sql,[app_patientname,app_phone,app_email,app_departmentid,app_doctorid,app_date,app_time,app_reason,'pending']);
    res.redirect('/appointment');
})

module.exports=router;