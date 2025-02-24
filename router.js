const express = require('express')
const router = express.Router()
const mongodb = require('./mongo')
const bp = require('body-parser')
const session = require('express-session')
const nocache = require('nocache');

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

router.use(nocache())
router.use(bp.json())
router.use(bp.urlencoded({extended:true}))

// --------- First page ----------
router.get('/',(req,res)=>{
    if(!req.session.admin){
        if(!req.session.user){
            res.render('login')
        }else{
            res.redirect('/home')
        }
    }else(
        res.redirect('/admin')
    )
})  

// --------- Logout ----------
router.post('/login',(req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

// ------- signup-page -------
router.get('/signup',(req,res)=>{
    res.render('signup')
})


// ------ After registration -------
router.get('/signup-check',async (req,res)=>{
    try {
        const { name, email, mobile, password } = req.query
        const checkEmail = await mongodb.findOne({ email: email })
        const checkMobile = await mongodb.findOne({ mobile: mobile })
        // ----- Password strong checking function -----
        function isStrongPassword(password) {
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            return strongPasswordRegex.test(password);
        }

        if(checkEmail) {
            const message = 'Email already exist'
            res.json({ message })
        } else if(checkMobile) {
            const message = 'Mobile already exist'
            res.json({ message })
        } else if (!/[A-Za-z0-9.%]+@gmail.com/.test(req.query.email)) {
            const message = 'Enter valid email'
            res.json({ message })
        } else if (!/^[0-9]+$/.test(mobile) || mobile.length !== 10) {
            const message = 'Enter valid mobile'
            res.json({ message })
        } else if(!isStrongPassword(password)){
            const message = 'Enter a strong password'
            res.json({ message })
        } else {
            const data = ([{
                name: name,
                email: email,
                mobile: mobile,
                password: password,
                is_admin: 0
            }])
            await mongodb.insertMany(data)
            res.json({ success: true })
        }
    } catch (error) {
        console.log(error.message)
    }
})


// ------ Home page ---------
router.get('/login-check',async (req, res) => {
    try {
        const check = await mongodb.findOne({ email: req.query.email })
        if(check) {
            if(check.password == req.query.password) {
                req.session.user = check
                res.json({ success: true })
            } else {
                res.json({ message: 'Ender correct password' })
            }
        } else {
            res.json({ message: 'User not found' })
        }
    }
    catch {
        console.log('Error')
    }
})

router.get('/home',(req,res)=>{
    if(req.session.user){
        const data = req.session.user
        res.render('home', { data })
        console.log(req.session.user)
    }else{
        res.redirect('/')
    }
})

// asdasd
module.exports = router