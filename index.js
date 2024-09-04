import express from 'express'
import path from 'path';
const app = express();
const port = 4000

app.use(express.static(path.join(path.resolve(),"public")))
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res) => {
    const pathLocation = path.resolve();
    // res.sendFile(path.join(pathLocation, "/index.html"));
    res.render("index",{name:"wasiq"})
});
app.get('/login', async(req, res) => {
    try {
        res.render("form")
    } catch (error) {
        res.status(500).send(error.message)
    }
})
app.get('/success', async(req, res) => {
    try {
        res.render("success")
    } catch (error) {
        res.status(500).send(error.message)
    }
})
const users=[];
app.post('/login', (req, res) => {
     console.log(req.body);
     users.push({userName:req.body.name,userEmail:req.body.email})
    //  res.json(users)
    res.redirect("/success")
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

