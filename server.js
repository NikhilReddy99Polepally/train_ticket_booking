
var express = require('express');
var app = express();

//var http = require('http').Server(app);
var socket = require('socket.io');
var server = app.listen(3000);
var io = socket(server);
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mysqlserver",
  database: "railUsers"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var client_details;

app.use(express.static('website'));

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/login_get',function (req, res) {
	var flag=false;
    response = {
      userid:req.query.userid,
      password:req.query.password
    };
   var final_result;
	const result1 = async() => {
		await con.query("SELECT name,password,bank_balance,from_place,to_place from user;", function (err, result, fields, result1) {
		    if (err || result==undefined){
		    	res.redirect('/login_unsuccesful');
		    }
			//	console.log(result1["userid"],"inside",result);
			result1 = result;
			for(var i=0;i<result1.length;i++)
			{
			   	var result = JSON.parse(JSON.stringify(result1[i]));
			   	//console.log(result.name);
			   	if(result.name == response.userid && result.password == response.password)
			   	{
			   		flag=true;
			   		//res.redirect('/login_success.html');
			   		final_result = result;
			   		client_details = result;
			   	}
			}
		});
	}
	var result = result1();
	setTimeout(function(){
		if(flag)
		{
			res.redirect('/login_success');
		}
		else{
			res.redirect('/login_unsuccesful');
		}
	},1000);
	client_details = final_result;
   //res.redirect('/login_success.html');
   //res.end(JSON.stringify(response), result1);
});

app.get('/signup_get',function (req, res) {
   response = {
      userid:req.query.userid,
      password:req.query.password,
      con_password:req.query.con_password,
      aadhar:req.query.aadhar,
      bank_balance:req.query.bank_balance
  	};
  	if(response.password == response.con_password)
  	{
  	var querystr = "insert into user(name,password,bank_balance,aadhar) values('".concat((response.userid).concat("','".concat((response.password).concat("',".concat((response.bank_balance).concat(",'".concat((response.aadhar).concat("');"))))))));
  	var querystr1="";
  	try{
  		con.query(querystr,function(err,result){
			if(err)throw err;
			console.log("inserted");
		});
		res.redirect('/login_success');
  	}
  	catch(err){
  		console.log(err);
  		res.redirect('/login_unsuccesful');
  	}
   	client_details = response;
   	res.end(JSON.stringify(response));
   }
   else{
   	res.redirect('/index.html');
   }
});

app.use(express.static('website'));

var user_logged = false;

app.get('/login_success',function(req,res) {
	//res.sendFile( __dirname + "/" + "website/index.html");
	res.sendFile(__dirname+"/"+"website/login_success.html");

	user_logged = true;
	io.sockets.on('connection',function(){
		io.sockets.emit('broadcast',client_details);
   		console.log("Sent data",client_details);
	});
});

app.get('/book_ticket',function(req,res) {
	res.sendFile(__dirname+"/"+"website/prev_bookings.html");
//datepicker=11%2F01%2F2018&from_place=&to_place=&passenger=&age=&account_no=&amount=
	console.log(req,"book_ticket");
	var dummy = req.query.train_vals.split(',');
	response = 
	{
      date:req.query.datepicker,
      from_place:req.query.from_place,
      to_place:req.query.to_place,
      passenger:req.query.passenger,
      age:req.query.age,
      account_no:req.query.account_no,
      amount:req.query.amount,
  	  userid:client_details.userid,
      bank_balance:client_details.bank_balance,
      train_no:dummy[0],
      train_name:dummy[1]
  	};
  	client_details = response;
	io.sockets.on('connection',function(){
		io.sockets.emit('broadcast',response);
	});
});

app.get('/login_unsuccesful',function(req,res){
	res.sendFile(__dirname+"/"+"website/login_unsuccesful.html");
});

app.get('/prev_bookings',function(req,res)
{
	res.sendFile(__dirname+"/"+"website/prev_bookings.html");
	io.sockets.on('connection',function(){
		io.sockets.emit('broadcast',client_details);
   		console.log("Sent data to prev_bookings",client_details);
	});
});

