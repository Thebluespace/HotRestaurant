var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var app = express();
var PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var currentlySeated = [];
var currentlyWaiting = [];
var interval;

function clearTables() {
    try {
        if (currentlySeated.length === 0)  return console.log("tables empty");
        console.log("============ Checking Tables ============");
        currentlySeated.forEach(item => {
            item.time++;
            if (item.time > 5){
                currentlySeated.splice(currentlySeated.indexOf(item),1);
                console.log("Bill Paid:",item);
                if(currentlyWaiting.length === 0) return;
                currentlySeated.push(currentlyWaiting[0]);
                console.log("Seated:",currentlyWaiting[0]);
                currentlyWaiting.splice(0,1);
            }
        });
        console.log("============ Tables Checked ============");
    } catch (error) {;
        console.log(error);
    }
};

function checkDups(item){
    var trigger = false;
    currentlySeated.forEach(data => {
        if (data.name === item.name){
            trigger = true;
            return true;
        }
    });
    currentlyWaiting.forEach(data => {
        if (data.name === item.name){
            trigger = true;
            return true;
        }
    });
    return trigger;
}

app.post("/api/addtolist", (req,res)=>{
    try {
        var data = req.body;
        var item = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            time: 0
        };
        var trigger = checkDups(item);
        if (trigger === true) {return res.json({"message":"DUP"})};
        var message = { "message": ""};
        if(currentlySeated.length < 5){
            currentlySeated.push(item);
            message.message = "All set! \n We have a table for you now!";
        } else {
            currentlyWaiting.push(item);
            message.message = "All set! \n Unfortunately all tables are full, you've been put on the wait list!";
        }
        console.log("added to list",item);
        return res.json(message);
    } catch (error) {
        console.log(error);
    }
});

app.get("/api/tablestatus", (req,res) => {
    var status = {
        "seated": currentlySeated,
        "waiting": currentlyWaiting
    };
    console.log("Table status checked");
    return res.json(status);
});

app.get("/api/checkres/:res", (req,res) => {
    try {
        var res = req.params.res;
        currentlyWaiting.forEach(item => {
            if (item.email === res){
                return res.json({"message":"false"});        
            } 
        });
        currentlySeated.forEach(item => {
            if (item.email === res){
                return res.json({"message":"true"});
            }
        });
        return res.json({"message":"na"});
    } catch (error) {
        console.log(error)   ;
    }
});

app.get("/", (req,res) =>{
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/view", (req,res) =>{
    res.sendFile(path.join(__dirname, "view.html"));
});

app.get("/add", (req,res) =>{
    res.sendFile(path.join(__dirname, "add.html"));
});

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
    interval = setInterval(clearTables, 1000 * 30);
});