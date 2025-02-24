const mongoose = require('mongoose')

const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('MongoDB success'))
.catch(()=>console.log('MongoDB cracked'))

const sSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        require:true
    }
})

module.exports = mongoose.model('collection2',sSchema)


