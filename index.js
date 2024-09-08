import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import UserInfo from "./model/userInfo.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
const app = express();
const port = 4000;
dotenv.config();
const url = process.env.URL;

mongoose
    .connect(url)
    .then(() => {
        console.log("Connected to MongoDB!");
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => console.log("Error connecting to MongoDB:", error));
app.use(express.static(path.join(path.resolve(), "public")));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const isAuthenticated = async(req, res, next) => {
    console.log(req.cookies);
    const { token } = req.cookies;
    if (token) {
    const decoded=jwt.verify(token,"ssadsad")
    console.log("🚀 ~ isAuthenticated ~ decoded:", decoded);
   req.user = await UserInfo.findById(decoded.id);
console.log(await UserInfo.findById(decoded.id),"54",req.user);

        next();
    } else {
        res.render("form");
    }

};



app.get("/",isAuthenticated, (req, res) => {


        console.log(req.user,"12");
        res.render("logout",{name:req.user.name});

});

app.get("/success", async (req, res) => {
    try {
        res.render("success");
    } catch (error) {
        res.status(500).send(error.message);
    }
});
// app.get('/add', async(req, res) => {
//    await UserInfo.create({name:"wasq",email:"wasiq@naivex.com"})
//     res.send("add");
// })
app.get('/logout', (request, response) => {
    response.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    response.redirect("/");
})
app.post("/login", async (req, res) => {
    const { name, email, password } = req.body;
    const user= await UserInfo.create({ name, email, password });

    const token=jwt.sign({id:user._id},"ssadsad")
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    console.log(req.body);
    //  res.json(users)
    res.redirect("/");
});
