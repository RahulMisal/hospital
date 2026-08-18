var express=require('express');
var router=express.Router();
var session=require('express-session');
var image1=require('express-fileupload');
var path=require('path');
var exe1=require('../db.js');

router.use(express.urlencoded({extended:true}));
router.use(image1());
router.use(session({
    secret: 'hospital_secret',
    resave: false,
    saveUninitialized: true
}));

function login_check(req,res,next){
    if(req.session.aid){
        next();
        // res.redirect('/admin/login');
    }else{
        res.redirect('/admin/login');
    }
}
router.get('/',(req,res)=>{
    res.render('admin/login.ejs')
})
router.get('/login',(req,res)=>{
    res.render('admin/login.ejs')
})
router.post('/login_save',async(req,res)=>{
    var {email,password}=req.body;
    var sql='select * from admin_login where email=? and password=?';
    var data=await exe1(sql,[email,password]);
    if(data){
        req.session.aid=data[0].aid;
        res.redirect('/admin/dashboard');
    // res.send(data);
    }else{
        res.redirect('/admin/login');
    }

})
router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/admin/login');
})
router.get('/dashboard',(req,res)=>{
    // res.send(req.session);
    // res.send('Welcome Admin Panal');
    res.render('admin/dashboard.ejs')
})
router.get('/departments',async(req,res)=>{
    var sql='select * from department';
    var data=await exe1(sql);
    res.render('admin/departments.ejs',{data:data})
})
router.post('/department_save',async(req,res)=>{
    // res.send(req.body);
    var {name,icon,image,beds,description}=req.body;
    var sql='insert into department(name,icon,image,beds,description)values(?,?,?,?,?)';
    var data=await exe1(sql,[name,icon,image,beds,description]);
    // res.send('done');
    res.redirect('/admin/departments');
})
router.get('/department_delete/:id',(req,res)=>{
    res.send('delete')
})
router.get('/department_edit/:id',async(req,res)=>{
    // res.send('edit')
    var id=req.params.id;
    var sql='select * from department where did=?';
    var data=await exe1(sql,[id]);
    res.render('admin/department_edit.ejs',{data:data[0]})
})
router.get('/treatments',async(req,res)=>{
    var sql='select * from department';
    var dept=await exe1(sql);
    var sql1='select * from treatment';
    var treatment=await exe1(sql1);
    res.render('admin/treatments.ejs',{dept:dept,treatment:treatment})
})
router.post('/treatment_save',async(req,res)=>{
    // res.send(req.body);
    // res.send(req.files);
    var {tname,tdepartment,tduration,tprice,tdescription}=req.body;
    var img1=req.files.timage;
    var imgname=Date.now()+img1.name;
    var imgpath=path.join(__dirname,'../','public/images/',imgname);
    img1.mv(imgpath,(err)=>{})
    // res.send(imgpath);
    var sql='insert into treatment(tname,tdepartment,tduration,tprice,tdescription,timage)values(?,?,?,?,?,?)';
    var data=await exe1(sql,[tname,tdepartment,tduration,tprice,tdescription,imgname]);
    res.redirect('/admin/treatments');
})
router.get('/doctors',async(req,res)=>{
    var sql='select * from department';
    var dept=await exe1(sql);
    var sql1='select * from doctor';
    var doctor=await exe1(sql1);
    res.render('admin/doctors.ejs',{dept:dept,doctor:doctor})
})
router.post('/doctor_save',async(req,res)=>{
    // res.send(req.body);
    var {doc_name, doc_specialty, doc_departmentid, doc_experience, doc_fees, doc_rating, doc_email, doc_phone, doc_gender, doc_password}=req.body;
    var img1=req.files.doc_image;
    var imgname=Date.now()+img1.name;
    var imgpath=path.join(__dirname,'../','public/images/',imgname);
    img1.mv(imgpath,(err)=>{})
    var sql='insert into doctor(doc_name, doc_specialty, doc_departmentid, doc_experience, doc_fees, doc_rating, doc_email, doc_phone, doc_gender, doc_password,doc_image)values(?,?,?,?,?,?,?,?,?,?,?)';
    var data=await exe1(sql,[doc_name, doc_specialty, doc_departmentid, doc_experience, doc_fees, doc_rating, doc_email, doc_phone, doc_gender, doc_password,imgname]);
    // res.send("Done");
    res.redirect('/admin/doctors');

    })

module.exports=router;