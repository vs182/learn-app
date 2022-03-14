//Import
const express = require('express')
const app = express()
const port = 5000
const mysql = require('mysql')
const bodyparser = require('body-parser');
const encoder = bodyparser.urlencoded({ extended: false });
const multer = require('multer');
const storage = require('node-sessionstorage');
const { json }  = require('body-parser');

const upload = multer({
    storage: multer.memoryStorage()
})

//connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "figma"

});


//client-database


//connect to database

connection.connect(function(err) {
    if (err) {
        console.log("error", err)
    } else console.log("Database connected")
})

//Json


//Static files

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/Assets', express.static(__dirname + 'public/Assets'))


//Set Ejs

app.set('views', './views')
app.set('view engine', 'ejs')

//Admin

app.get('/', (req, res) => {
    res.render('Login')
})
app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/videos', (req, res) => {
    var proname = storage.getItem('user');
    connection.query(`select * from ${proname}`, function(err, rows) {
        res.render('admin', {
            users: rows
        })
    })

})

app.get('/add', (req, res) => {
    res.render('addcourse')
})

app.get('/adminLogin', (req, res) => {
    res.render('admin_login')
})
app.get('/adminRegister', (req, res) => {
    res.render('admin_register')
})



//Admin-create

app.post('/save', encoder, (req, res) => {
    let name = req.body.new_name
    let url = req.body.new_url
    let descs = req.body.new_desc
    let opt = req.body.opt
    var proname = storage.getItem('user');
    connection.query(`insert into Videos(course_name,url,catergory,descs) values(?,?,?,?)`, [name, url, opt, descs], function(err) {})
        // let data = {name:req.body.new_name,url:req.body.new_url,descs:req.body.desc}
    connection.query(`insert into ${proname}(course_name,url,catergory,descs) values(?,?,?,?)`, [name, url, opt, descs], function(err) {
        if (err) {
            res.redirect('/')
        } else {
            res.redirect('/videos')
        }
    })

})

//Admin-read

app.get('/edit/:coursename/:userId', (req, res) => {
    var proname = storage.getItem('user');
    const userId = req.params.userId;
    const course = req.params.coursename;
    connection.query(`select * from ${proname} where id = ? and course_name = ?`, [userId, course], function(err, result) {
        if (err) {
            res.redirect('/')
        } else {
            res.render('videoedit', {
                user: result[0]
            })
        }
    })
})

//Admin-update


app.post('/update', encoder, (req, res) => {
    var proname = storage.getItem('user');
    let name = req.body.new_name
    let url = req.body.new_url
    let descs = req.body.new_desc
    let id = req.body.id;
    connection.query(`update Videos set course_name=?,url=?,descs =? where course_name = ?`, [name, url, descs, name], function(err) {})
        // let data = {name:req.body.new_name,url:req.body.new_url,descs:req.body.desc}
    connection.query(`update ${proname} set course_name=?,url=?,descs =? where id = ${id}`, [name, url, descs], function(err) {
        if (err) {
            res.redirect('/')
        } else {
            res.redirect('/videos')
        }
    })

})

//Admin-delete

app.get('/delete/:coursename/:userId', (req, res) => {
    var proname = storage.getItem('user');
    const userId = req.params.userId;
    const course = req.params.coursename;
    connection.query(`delete from Videos where course_name = ?`, [course], function(err, result) {})
    connection.query(`delete from ${proname} where id = ?`, [userId], function(err, result) {
        if (err) {
            res.redirect('/')
        } else {
            res.redirect('/videos')
        }
    })
})

//adminRegister

app.post("/adminRegister", encoder, upload.single("profile"), function(req, res) {
    var username = req.body.new_name;
    storage.setItem('user', username)
    var new_user = req.body.new_name;
    var new_email = req.body.new_email;
    var new_password = req.body.new_password;
    console.log(image)
    if (new_user == "" || new_email == "" || new_password == "" || req.file.filename == "") {
        res.render('admin_register', { error: "Please fill the form Correctly" })
    }
    if (new_password.length < 6) {
        res.render('admin_register', { error: "Password Should be more than 6 Characters" })
    } else {
        var image = req.file.buffer.toString('base64');
        connection.query(`insert into loginuser(user_name) values(?)`, [username]);
        connection.query(`create table if not exists ${new_user}(id int not null primary key AUTO_INCREMENT,user_name varchar(255),user_pass varchar(255),user_email varchar(255),user_profile longtext,
        course_name varchar(255),url varchar(255),catergory varchar(255),descs varchar(255))`);
        connection.query(`insert into ${new_user}(user_name,user_email,user_pass,user_profile) values(?,?,?,?)`, [new_user, new_email, new_password, image], function(err) {
            if (err) {
                res.render('admin_register', { error: "Invalid Username or Password" })
            } else { res.redirect("/videos") }
            res.end();
        })
    }

})


//Admin-Login

app.post("/adminLogin", encoder, function(req, res) {
    var username = req.body.username;

    storage.setItem('user', username)
    var useremail = req.body.useremail;
    var password = req.body.password;
    connection.query(`select user_name from loginuser where user_name like "${username}"`, function(err, rows) {
        console.log(err, rows)
        rows.forEach(function(ans) {
            storage.setItem("con", ans.user_name)
        })
    })
    connection.query(`select * from loginuser where user_name like "${username}"`, function(err) {
        if (err) {
            res.render('admin_login', { error: "Invalid Username or Password" })
            console.log(err)
        } else {
            if (storage.getItem('con') == username) {
                console.log("one clear")
                connection.query(`select * from ${username} where user_email = ? and user_pass = ?`, [useremail, password], function(error, result, feilds) {
                    if (result.length > 0) {
                        res.redirect("/videos")
                        console.log("hello login")
                    } else if (error) {
                        res.render('admin_login', { error: "Invalid Username or Password" })
                        console.log(error)
                    } else {
                        res.render('admin_login', { error: "Invalid Username or Password" })
                    }
                    res.end();
                })
            } else {
                res.render('admin_login', { error: "Invalid Username or Password" })

            }

        }
    })

})

//Client-Register

app.post("/register", encoder, upload.single("profile"), function(req, res) {
    var username = req.body.new_name;
    storage.setItem('clientuser', username)
    var new_user = req.body.new_name;
    var new_email = req.body.new_email;
    var new_password = req.body.new_password;
    console.log(image)
    if (new_user == "" || new_email == "" || new_password == "" || req.file.filename == "") {
        res.render('register', { error: "Please fill the form Correctly" })
    }
    if (new_password.length < 6) {
        res.render('register', { error: "Password Should be more than 6 Characters" })
    } else {
        var image = req.file.buffer.toString('base64');
        connection.query(`insert into clientUser(user_name) values(?)`, [username]);

        connection.query(`create table if not exists client_${new_user}(id int not null primary key AUTO_INCREMENT,user_name varchar(255),user_pass varchar(255),user_email varchar(255),user_profile longtext,
        course_name varchar(255),url varchar(255),catergory varchar(255),descs varchar(255))`);

        connection.query(`insert into client_${new_user}(user_name,user_email,user_pass,user_profile) values(?,?,?,?)`, [new_user, new_email, new_password, image], function(err) {
            if (err) {
                res.render('register', { error: "Invalid Username or Password" })
            } else { res.redirect("/home") }
            res.end();
        })
    }

})


//Client-Login

app.post("/", encoder, function(req, res) {
    var username = req.body.username;

    storage.setItem('clientuser', username)
    var useremail = req.body.useremail;
    var password = req.body.password;
    connection.query(`select user_name from clientUser where user_name like "${username}"`, function(err, rows) {
        console.log(err, rows)
        rows.forEach(function(ans) {
            storage.setItem("con", ans.user_name)
        })
    })
    connection.query(`select * from clientUser where user_name like "${username}"`, function(err) {
        if (err) {
            res.render('Login', { error: "Invalid Username or Password" })
            console.log(err)
        } else {
            if (storage.getItem('con') == username) {
                console.log("one clear")
                connection.query(`select * from client_${username} where user_email = ? and user_pass = ?`, [useremail, password], function(error, result, feilds) {
                    if (result.length > 0) {
                        res.redirect("/home")
                        console.log("hello login")
                    } else if (error) {
                        res.render('Login', { error: "Invalid Username or Password" })
                        console.log(error)
                    } else {
                        res.render('Login', { error: "Invalid Username or Password" })
                    }
                    res.end();
                })
            } else {
                res.render('Login', { error: "Invalid Username or Password" })

            }

        }
    })

})



//Client-create



app.get('/learn', (req, res) => {
    var proname = storage.getItem('clientuser');
    connection.query(`select * from Videos`, function(err, rows) {
        if (err) {
            res.redirect('/')
        } else {
            connection.query(`select * from client_${proname}`, function(err, row) {
                if (err) {
                    res.redirect('/')
                } else {
                    res.render('learn', {
                        users: rows,
                        profile: row
                    })
                }
            })
        }
    })
})

app.get('/home', (req, res) => {
    var proname = storage.getItem('clientuser');
    connection.query(`select * from client_${proname}`, function(err, row) {
        if (err) {
            res.redirect('/')
        } else {
            res.render('index', {
                profile: row
            })
        }
    })


})
app.get('/url_converter', (req, res) => {
    res.render('url_converter', {})
})

//Listen on port 5000
app.listen(port, () => console.log("listening"))