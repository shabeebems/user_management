const express = require('express')
const router = express.Router()
const mongodb = require('./mongo')
const bp = require('body-parser')
const session = require('express-session')
const nocache = require('nocache')

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

router.use(nocache())
router.use(bp.json())
router.use(bp.urlencoded({ extended: true }))


// ---------- Admin login page ----------
router.get('/admin', (req, res) => {
    if(req.session.admin) {
        res.redirect('/admin-home')
    } else {
        res.render('admin')
    }
})

// -------- Admin logout --------
router.post('/admin-logout', (req, res) => {
    req.session.destroy()
    res.redirect('admin')
})


// ---------- Check admin ----------
router.get('/adminLogin-check', async (req, res) => {
    try {
        const admin = await mongodb.findOne({ email: req.query.email })
        if(admin) {
            if(admin.password == req.query.password && admin.is_admin) {
                req.session.admin = admin
                res.json({ success: true })
            }
        }
        res.json({ message: 'Admin not found' })
    } catch (error) {
        console.log(error.message)
    }
})

// ---------- Session clear in admin page ---------
router.get('/admin-home', async (req, res) => {
    if(req.session.admin) {
        const data = req.session.admin
        res.render('admin-home', { message: data.name }) 
    } else {
        res.redirect('/admin')
    }
})


// ----------- Users list -----------
router.get('/dashboard', async (req, res) => {
    if(req.session.admin) {
        const data = await mongodb.find({ is_admin: 0 }, { _id: 0, password: 0, __v: 0, is_admin:0 })
        res.render('dashboard', { data });
        
    } else {
        res.redirect('/admin')
    }
});


// --------- Back to admin page ----------
router.post('/back-to-home',(req,res)=>{
    res.redirect('/admin-home')
})


// ---------- Add new users page -----------
router.get('/add-new-user', async(req,res)=>{
    if(req.session.admin){
        try {
            res.render('add-new-user')   
        } catch (error) {
            console.log(error)
        }
    }else{
        res.redirect('/admin')
    }
})


// --------- adding new users -------------
router.post('/new-user',async (req,res)=>{

    const check = await mongodb.findOne({email:req.body.email})

    if(!check){
        if(!/[A-Za-z0-9.%]+@gmail.com/.test(req.body.email)){
            res.render('add-new-user',{message:'Enter valid email'})
        }else{
            const data = ([{
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                password:req.body.password,
                is_admin:0
            }])
            await mongodb.insertMany(data)
            res.redirect('/dashboard')
        }
    }
    else{
        res.render('add-new-user',{message:'Email already exist'})
    }
})


// ------------ edit user-page -----------------
router.get('/edit-user', async (req,res)=>{
    if(req.session.admin){
        try {       
            const email = req.query.email
            const userData = await mongodb.findOne({email:email})
            if(userData){
                res.render('edit',{userData})
                
            }else{
                res.render('dashboard')
            }
            
        } catch (error) {
            console.log(error)
        }
    }else{
        res.redirect('/admin')
    }
})

// ------- Editing users -------
router.post('/update-user',async (req,res)=>{

    if(req.session.admin){

        // ------- Find body.email in collection -------
        const check = await mongodb.findOne({email:req.body.email})
        
        // ------- Select file for update -------
    const cEmail = req.query.email
    const userData = await mongodb.findOne({email:cEmail})

        try {
            if(!/[A-Za-z0-9.%]+@gmail.com/.test(req.body.email)){
                res.render('edit',{userData,message:'Enter valid email'})
            }else{
                const email = req.body.email
                if(!check||email==check.email){
                    if(!check||check.mobile==req.body.mobile){
                        await mongodb.findOneAndUpdate({email:req.query.email},{$set:{name:req.body.name,mobile:req.body.mobile,email:req.body.email}})
                        // ------- After update to dashboard(users list) -------
                        res.redirect('/dashboard')
                    }else{
                        res.render('edit',{userData,message:'Email already exist'})
                    }
                }else{
                    res.send('no')
                }
            }             
        } catch (error) {
            console.log(error)
        }
    }else{
        res.redirect('/admin')
    }
})



// --------- Deleting users ---------
router.get('/delete-user',async (req,res)=>{
    if(req.session.admin){
        const email = req.query.email
        await mongodb.deleteOne({email:email})
        // ------- After update to dashboard(users list) -------
        res.redirect('/dashboard')
    }else{
        res.redirect('/admin')
    }
})



module.exports = router




