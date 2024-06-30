const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { generateToken, generateOTP,authenticateToken} = require('./Middleware/auth.middleware');

const prisma = new PrismaClient()

// env initialization
dotenv.config();

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


// login api
app.post('/login',async (req,res)=>{
    const { email, password } = req.body;

    if(!email ||!password){
        return res.status(400).json({
            error:"Please provide email and password"
        })   
    }

    try{

        const user = await prisma.user.findUnique({
            where:{
                email
            }

        })
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }
          const payload = {
            id: user.id,
            email: user.email,
          };
          const token = generateToken(payload);
          delete user.password;

        // Set the token as a cookie
          res.cookie('token', token);
          res.status(200).json({ token: token, user: user });



    }catch(err){
        res.status(500).send("Internal server error"); 
        console.log(err);

    }
})

app.get('/protected-route', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'You have access to this route', user: req.user });
  });





app.get('/',(req,res)=>{
    res.send("hello world")
})

app.get('/set-cookie',(req,res)=>{
    res.cookie('test1','value1')
    res.send("cookie is set")
})

app.get('/get-cookie',(req,res)=>{
    res.send(req.cookies)
})
app.get('/clear-cookie', function(req, res){
    res.clearCookie('test1');
    res.send('cookie test1 cleared');
 });


app.listen(4000,()=>{
    console.log("server is running on port 4000")
})


