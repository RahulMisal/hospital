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

router.use(async(req,res,next)=>{
    var id=1 //req.session.doc_id
    var sql='select * from doctor where doc_id=?';
    var data=await exe1(sql,[id]);
    var user={
        name:data[0].doc_name,
        photo:data[0].doc_image,
    };
    res.locals.headerData=user;
    next();
})

function login_check(req,res,next){
    if(req.session.doc_id){
        next();
        // res.redirect('/admin/login');
    }else{
        res.redirect('/login');
    }
}
router.get('',async(req,res)=>{
    // res.send('Welcome Doctor Panal');
    var id=1 //req.session.doc_id
    var sql='select * from doctor where doc_id=?';
    var data=await exe1(sql,[id]);
    var sql2='select COUNT(*) as record from appointment where app_dr_name=?';
    var appointment=await exe1(sql2,[id]);
    // res.send(appointment)
    res.render('doctor/dashboard.ejs',{data:data[0],appointment:appointment[0]});
})
router.get('/profile',async(req,res)=>{
    var id=1 //req.session.doc_id
    var sql='select * from doctor where doc_id=?';
    var data=await exe1(sql,[id]);
    var sql3='select * from doctor_moredetails where doc_id=?';
    var moredetails=await exe1(sql3,[id]);
    var sql1='select * from department';
    var department=await exe1(sql1);    
    // res.send(department)
    res.render('doctor/profile.ejs',{data:data[0],department:department,moredetails:moredetails});
})
router.post('/profile_save',async(req,res)=>{
    var id=1 //req.session.doc_id
    var {doc_name,doc_phone,doc_specialty,doc_departmentid,doc_gender,doc_address,doc_desc,doc_language,doc_timetableday,doc_timetabletime}=req.body;
    var sql='update doctor set doc_name=?,doc_phone=?,doc_specialty=?,doc_departmentid=?,doc_gender=? where doc_id=?';
    var data=await exe1(sql,[doc_name,doc_phone,doc_specialty,doc_departmentid,doc_gender,id]);
    var sql1='select * from doctor_moredetails where doc_id=?';
    var data1=await exe1(sql1,[id]);
    if(data1[0]){
        var sql2='update doctor_moredetails set doc_address=?,doc_desc=?,doc_language=?,doc_timetableday=?,doc_timetabletime=? where doc_id=?';
        var data2=await exe1(sql2,[doc_address,doc_desc,doc_language,doc_timetableday,doc_timetabletime,id]);
    }else{
        var sql3="insert into doctor_moredetails(doc_id,doc_address,doc_desc,doc_language,doc_timetableday,doc_timetabletime)values(?,?,?,?,?,?)";
        var data3=await exe1(sql3,[id,doc_address,doc_desc,doc_language,doc_timetableday,doc_timetabletime])
    }
    res.redirect('/doctor/profile')
})
router.get('/appointments',async(req,res)=>{
    var id=1 //req.session.doc_id
    var sql2='SELECT a.*, c.* FROM appointment AS a INNER JOIN customer AS c ON a.customer_id =c.p_id where a.app_dr_name=? and status="pending"';
    var pending=await exe1(sql2,[id]);
    var sql3='SELECT a.*, c.* FROM appointment AS a INNER JOIN customer AS c ON a.customer_id =c.p_id where a.app_dr_name=? and status="confirm"';
    var confirm=await exe1(sql3,[id]);
    var sql4='SELECT a.*, c.* FROM appointment AS a INNER JOIN customer AS c ON a.customer_id =c.p_id where a.app_dr_name=? and status="reject"';
    var reject=await exe1(sql4,[id]);
    var sql5='SELECT a.*, c.* FROM appointment AS a INNER JOIN customer AS c ON a.customer_id =c.p_id where a.app_dr_name=? and status="complete"';
    var complete=await exe1(sql5,[id]);
    res.render('doctor/appointments.ejs',{pending:pending,confirm:confirm,reject:reject,complete:complete});
})
router.get('/app_confirm/:id',async(req,res)=>{
    var id=req.params.id;
    var sql='update appointment set status=? where app_id=?';
    var data=await exe1(sql,['confirm',id]);
    res.redirect('/doctor/appointments');

})
router.get('/app_reject/:id',async(req,res)=>{
    var id=req.params.id;
    var sql='update appointment set status=? where app_id=?';
    var data=await exe1(sql,['reject',id]);
    res.redirect('/doctor/appointments');
})
router.get('/app_complete/:id',async(req,res)=>{
    var id=req.params.id;
    var sql='update appointment set status=? where app_id=?';
    var data=await exe1(sql,['complete',id]);
    res.redirect('/doctor/appointments');
})
router.get('/patients',async(req,res)=>{
     var sql='select * from customer';
    var data=await exe1(sql);
    res.render('doctor/patients.ejs',{data:data});
})
router.get('/patients_details/:id',async(req,res)=>{
    var id=req.params.id;
    var sql='select * from customer where p_id=?';
    var data=await exe1(sql,[id]);
    var sql1='select * from appointment where customer_id=? order by app_id desc';
    var appointment=await exe1(sql1,[id]);
    res.render('doctor/patients_details.ejs',{data:data[0],appointment:appointment});
})
router.get('/treatment',async(req,res)=>{
    var id=1 //req.session.doc_id
    var sql1=`SELECT 
    c.*,
    ct.*
FROM customer c
INNER JOIN customer_treatment ct
    ON c.p_id = ct.treatment_p_id
WHERE ct.doc_id = ?
ORDER BY ct.treatment_id DESC
LIMIT 5`;
    var data2=await exe1(sql1,[id]);
    // res.send(data2);
     var sql='select * from customer';
    var data=await exe1(sql);
    res.render('doctor/treatment.ejs',{data:data,data2:data2});
})
router.post('/treatment_save',async(req,res)=>{
    // res.send(req.body);
    var id=1 //req.session.doc_id
    var {treatment_p_id,treatment_disease,treatment_diagnosis,treatment_notes,treatment_medicines,treatment_nextvisit}=req.body;
    var sql='insert into customer_treatment(treatment_p_id,treatment_disease,treatment_diagnosis,treatment_notes,treatment_medicines,treatment_nextvisit,doc_id)values(?,?,?,?,?,?,?)';
    var data=await exe1(sql,[treatment_p_id,treatment_disease,treatment_diagnosis,treatment_notes,treatment_medicines,treatment_nextvisit,id]);
    res.redirect('/doctor/treatment');
})
router.get('/prescription',async(req,res)=>{
    var id=1 //req.session.doc_id
    var sql='select * from customer';
    var data=await exe1(sql);
    var sql1='select * from prescription where dr_id=?';
    var data2=await exe1(sql1,[id]);
    res.render('doctor/prescription.ejs',{data:data,data2:data2});
})
router.post('/prescription_save',async(req,res)=>{
    // res.send(req.body);
    var id=1 //req.session.doc_id
    var {p_id,pre_date,pre_diagnosis,medicine,dosage,frequency,duration,advice}=req.body;
    var sql='insert into prescription(p_id,dr_id,pre_date,pre_diagnosis,advice)values(?,?,?,?,?)';
    var data=await exe1(sql,[p_id,id,pre_date,pre_diagnosis,advice]);
    var insertid1=data.insertId;
    // res.send(insertid1);
    for(var i=0;i<medicine.length;i++){
        var sql2='insert into prescription_medicine(prescription_id,medicine,dosage,frequency,duration)values(?,?,?,?,?)';
        var data2=await exe1(sql2,[insertid1,medicine[i],dosage[i],frequency[i],duration[i]]);
    }
    // res.send('Done');
    res.redirect('/doctor/prescription');

})
router.get('/prescription_view/:id/:p_id',async(req,res)=>{
    var id=1 //req.session.doc_id
    var preid=req.params.id;
    var p_id=req.params.p_id;
    var sql='select * from prescription p LEFT JOIN prescription_medicine m ON p.prescription_id=m.prescription_id where p.prescription_id=?';
    var data=await exe1(sql,[preid]);
     var sql2='select * from doctor where doc_id=?';
    var doctor=await exe1(sql2,[id]);
     var sql3='select * from customer where p_id=?';
    var customer=await exe1(sql3,[p_id]);
    // res.send(data);
    res.render('doctor/prescription_view.ejs',{data:data,doctor:doctor[0],customer:customer[0]});
})
router.get('/reports',(req,res)=>{
    res.render('doctor/reports.ejs');
})
router.get('/schedule',(req,res)=>{
    res.render('doctor/schedule.ejs');
})
module.exports=router;