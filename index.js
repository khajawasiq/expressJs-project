import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import UserInfo from "./model/userInfo.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
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

const isAuthenticated = async (req, res, next) => {
    console.log(req.cookies);
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "ssadsad")
        // console.log("🚀 ~ isAuthenticated ~ decoded:", decoded);
        req.user = await UserInfo.findById(decoded.id);
        // console.log(await UserInfo.findById(decoded.id), "54", req.user);

        next();
    } else {
        res.redirect("/login");
    }

};



app.get("/", isAuthenticated, (req, res) => {


    // console.log(req.user, "12");
    res.render("logout", { name: req.user.name });

});
app.get("/register", (req, res) => {


    // console.log(req.user, "12");
    res.render("register");

});
app.get("/login", (req, res) => {


    // console.log(req.user, "12");
    res.render("form",{ note: "" });

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
    response.redirect("/register");
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let user = await UserInfo.findOne({ email });
    if (!user) {
        return res.redirect("/register");
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if (!isMatch) return res.render("form",{note:"incorrect password"})
       
    const token = jwt.sign({ id: user._id }, "ssadsad")
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    console.log(req.body);
    //  res.json(users)
    res.redirect("/");
})
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    let user = await UserInfo.findOne({ email });
    console.log("🚀 ~ app.post ~ userExist:", user)
    if (user) {
        return res.redirect("login");
    }
    const hashedPassword= await bcrypt.hash(password,10)
    user = await UserInfo.create({ name, email, password:hashedPassword });

    const token = jwt.sign({ id: user._id }, "ssadsad")
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    console.log(req.body);
    //  res.json(users)
    res.redirect("/");
});
