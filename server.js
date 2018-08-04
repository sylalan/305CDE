var http = require('http');
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var dbUrl = "mongodb://localhost:27017/";
var weburl = require('url');

(function() 
{
	var fs, http, qs, server, url;
	http = require('http');
	url = require('url');
	qs = require('querystring');
	fs = require('fs');

	var loginStatus = false, loginUser = "";

	server = http.createServer(function(request, response) {
		var action, form, formData, msg, publicPath, urlData, stringMsg;
		urlData = url.parse(request.url, true);
		action = urlData.pathname;
		publicPath = __dirname + "\\public\\";
		console.log("Requested URL is " +request.url);

		// ---------- start INDEX ----------
		if(request.url === "/index"){
			console.log("-INDEX-");
			form = "index.html";
			return fs.readFile(form, function(err, contents) 
			{
				if (err !== true) 
				{
					response.writeHead(200, 
					{
						"Content-Type": "text/html"
					});
					return response.end(contents);
				} 
				else 
				{
					response.writeHead(500);
					return response.end;
				}
			});
		}
		// --------- end INDEX ------------
		
		//------ start READ FAV ---------
		else if (action === "/readfav")
		{
			
			if (request.method === "POST") 
			{
				console.log("action = post");
				formData = '';
				msg = '';
				return request.on('data', function(data) 
				{
					formData += data;
          
					console.log("form data="+ formData);
					return request.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						msg = JSON.stringify(user);
						stringMsg = JSON.parse(msg);
						
						var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[0];var splitName = tempSplitName.split("=");
						var username =splitName[1];
						console.log("login="+username);
						
						MongoClient.connect(dbUrl, function(err, db) 
						{
							var finalcount;
							if (err) throw err;
							var dbo = db.db("mydb");
							var myobj = stringMsg;
							dbo.collection("profile").find({"username" : username}).toArray(function(err, result) 
							{
								if (err) throw err;
									console.log(result);
								db.close();
								var resultReturn = JSON.stringify(result);
									console.log(resultReturn);
									return response.end(resultReturn);
							});
						});
					});
				});
			}
		}// ----------end READ FAV ----------
		
		//------ start REMOVE FAV ---------
		else if (action === "/removefav")
		{
			
			if (request.method === "POST") 
			{
				console.log("action = post");
				formData = '';
				msg = '';
				return request.on('data', function(data) 
				{
					formData += data;
          
					console.log("form data="+ formData);
					return request.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						var splitFav = formData.split("=");
						var favid = splitFav[1];

						console.log("splitFav = "+ splitFav);
						console.log("favid = "+ favid);
						
						MongoClient.connect(dbUrl, function(err, db) 
						{
							var finalcount;
							if (err) throw err;
							var dbo = db.db("mydb");
							var myobj = {_id : new ObjectID(favid)};
							dbo.collection("profile").count(myobj, function(err, count)
							{
								console.log(err, count);
								finalcount = count;
								if(finalcount > 0)
								{
									dbo.collection("profile").deleteOne(myobj, function(err, res)
									{
										if (err) throw err;
										console.log("Item Removed");
										db.close();
										return response.end("Item Removed");
									});
								}
								else
								{
									if (err) throw err;
									console.log("fav not exist");
									db.close();
									return response.end("Failed");
								}
							});
							dbo.collection("profile").find({}).toArray(function(err, result) {
								if (err) throw err;
								console.log(result);
								db.close();
							});
						});
					});
				});
			}
			
		}// ----------end REMOVE FAV ----------

		
		// ---------- start ADD FAV ----------
		else if(request.url === "/addfav"){
			console.log("-ADD FAV-");
			if(request.method === "POST"){
				// add Fav
				console.log("action = POST")
				formData = '';
				msg = '';
				return request.on('data', function(data) 
				{
					formData += data;
					console.log("form data = "+ formData);
					return request.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						//msg = JSON.stringify(user);
						//stringMsg = JSON.parse(msg);
						var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[0];
						var splitName = tempSplitName.split("=");
						var tempSplitFav = splitMsg[1];
						var splitFav = tempSplitFav.split("=");
						var username = splitName[1];
						var favourite = splitFav[1];

						// check splitted data value
						console.log("msg = "+ msg);
						console.log("stringMsg = "+ stringMsg);
						console.log("splitMsg = "+ splitMsg);
						console.log("tempSplitName = "+ tempSplitName);
						console.log("splitName = "+ splitName);
						console.log("tempSplitFav = "+ tempSplitFav);
						console.log("splitFav = "+ splitFav);
						console.log("username = "+ username);
						console.log("favourite = "+ favourite);

						// connect mongo db
						MongoClient.connect(dbUrl, function(err, db) {
							var finalcount;
							var dbo = db.db("mydb");
							//var myobj = stringMsg;
							var myobj = {"username" : username, "favourite" : favourite};
							if (err) {
							console.log("MongoClient connection failed");
							throw err;
							} else {
								console.log("MongoClient connection success")
							}
							//dbo.collection("profile").count({"username" : splitName[1]}, function(err, count)
							dbo.collection("profile").count(myobj, function(err, count)
							{
								console.log(err, count);
								finalcount = count;
								if(finalcount > 0)
								{
									if (err) throw err;
									console.log("fav exist");
									db.close();
									return response.end("Item already exist in your profile");
								}
								else
								{
									dbo.collection("profile").insertOne(myobj, function(err, res) 
									{
										if (err) throw err;
										console.log("fav inserted");
										db.close();
									});
									return response.end("favourite Added");
								}
							});
							dbo.collection("profile").find({}).toArray(function(err, result) {
								if (err) throw err;
								console.log(result);
								db.close();
							});
						});
					});
				});
			}
			else 
			{
				form = "index.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						response.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return response.end(contents);
					} 
					else 
					{
						response.writeHead(500);
						return response.end;
					}
				});
			}
		}
		// --------- end ADD FAV ------------


		else if(request.url === "/"){
			console.log("-Default-");
			sendFileContent(response, "index.html", "text/html");
			//response.writeHead(200, {'Content-Type': 'text/html'});
			//response.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + request.url);
		}
		// ---------- start SIGN UP -----------
		else if(request.url === "/signup"){
			console.log("-SIGN UP-");
			//sendFileContent(response, "signup.html", "text/html");
			if(request.method === "POST"){
				console.log("action = POST")
				formData = '';
				msg = '';
				return request.on('data', function(data) 
				{
					formData += data;
					console.log("form data = "+ formData);
					return request.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						user.id = "0";
						msg = JSON.stringify(user);
						stringMsg = JSON.parse(msg);
						var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[0];
						var splitName = tempSplitName.split("=");
						var tempSplitPass = splitMsg[1];
						var splitPass = tempSplitPass.split("=");
						var searchDB = "username : "+ splitName[1];
						//var tempPassword = splitMsg[1];
						//var splitPassword = tempPassword.split("=");
						console.log("msg = "+ msg);
						console.log("stringMsg = "+ stringMsg);
						console.log("splitMsg = "+ splitMsg);
						console.log("tempSplitName = "+ tempSplitName);
						console.log("splitName = "+ splitName);
						console.log("tempSplitPass = "+ tempSplitPass);
						console.log("splitPass = "+ splitPass);
						console.log("searchDB = "+ searchDB);
						
						/*
						response.writeHead(200, 
						{
						"Content-Type": "application/json",
						"Content-Length": msg.length
						});
						*/
						
						//1. connect mongo db
						MongoClient.connect(dbUrl, function(err, db) {
							var finalcount;
							var dbo = db.db("mydb");
							var myobj = stringMsg;
							if (err) {
							console.log("MongoClient connection failed");
							throw err;
							} else {
								console.log("MongoClient connection success")
							}
							dbo.collection("user").count({"username" : splitName[1]}, function(err, count)
							{
								console.log("err & count ="+err, count);
								finalcount = count;
								if(finalcount > 0)
								{
									if(err) throw err;
									console.log("User exist");
									db.close();
									response.writeHead(200, 
									{
									"Content-Type": "application/json",
									"Content-Length": msg.length
									});
									return response.end("fail");

								}
									else
								{
									dbo.collection("user").insertOne(myobj, function(err, result)
									{
										if (err) throw err;
										console.log("1 record inserted");
										db.close();
									});
									response.writeHead(200, 
									{
									"Content-Type": "application/json",
									"Content-Length": msg.length
									});
									return response.end(msg);
									
								}
							});
						});
					});
				});
			}
			else 
			{
				
				form = "signup.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						response.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return response.end(contents);
					} 
					else 
					{
						response.writeHead(500);
						return response.end;
					}
				});
			}
		} //-------- end SIGN UP ----------
		
		// ---------- start CHANGE PWD -----------
		else if(request.url === "/changepwd"){
			console.log("-CHANGE PWD-");
			//sendFileContent(response, "signup.html", "text/html");
			if(request.method === "POST"){
				console.log("action = POST")
				formData = '';
				//msg = '';
				return request.on('data', function(data) 
				{
					formData += data;
					console.log("form data = "+ formData);
					return request.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[0];
						var splitName = tempSplitName.split("=");
						var username = splitName[1];
						var tempSplitPass1 = splitMsg[1];
						var tempSplitPass2 = splitMsg[2];
						var splitPass1 = tempSplitPass1.split("=");
						var splitPass2 = tempSplitPass2.split("=");
						var pwd = splitPass1[1];
						var newpwd = splitPass2[1];
						//var tempPassword = splitMsg[1];
						//var splitPassword = tempPassword.split("=");
						//console.log("msg = "+ msg);
						console.log("splitMsg = "+ splitMsg);
						console.log("tempSplitName = "+ tempSplitName);
						console.log("splitName = "+ splitName);
						console.log("tempSplitPass1 = "+ tempSplitPass1);
						console.log("tempSplitPass2 = "+ tempSplitPass2);
						console.log("splitPass1 = "+ splitPass1);
						console.log("splitPass2 = "+ splitPass2);
						console.log("username = "+ username);
						console.log("pwd = "+ pwd);
						console.log("newpwd = "+ newpwd);
						
						//1. connect mongo db
						MongoClient.connect(dbUrl, function(err, db) {
							var finalcount;
							var dbo = db.db("mydb");
							var myobj = {"username" : username, "pwd" : pwd};
							var newobj = {"username" : username, "pwd" : newpwd, "id" : "0"};
							if (err) {
							console.log("MongoClient connection failed");
							throw err;
							} else {
								console.log("MongoClient connection success")
							}
							if (dbo.collection("user").find(myobj))
							{
								dbo.collection("user").update(myobj, newobj, function(err, result)
								{
									if (err) throw err;
									console.log("1 record updated");
									db.close();
								});
							
								return response.end("Password changed");
							} else {
								return response.end("Existing password incorrect");
							}
							
						});
					});
				});
			}
			else 
			{
				
				form = "profile.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						response.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return response.end(contents);
					} 
					else 
					{
						response.writeHead(500);
						return response.end;
					}
				});
			}
		} //-------- end CHANGEPWD ----------
		
		// ----------- start LOGIN -----------
		else if(request.url === "/login"){
			console.log("-LOGIN-");
			//sendFileContent(response, "login.html", "text/html")
			if(request.method === "POST"){
				console.log("login action = POST")

				formData = '';
				msg = '';
				return request.on('data', function(data) 
				{
					formData += data;
          
					console.log("form data="+ formData);
					return request.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						msg = JSON.stringify(user);
						stringMsg = JSON.parse(msg);
						var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[0];
						var splitName = tempSplitName.split("=");
						var tempPassword = splitMsg[1];
						var splitPassword = tempPassword.split("=");
						//var searchDB = "Name : " + splitName[1];
						console.log("msg="+msg);
						console.log("formData="+formData);
						console.log("user=" + splitName[1] + ", password=" + splitPassword[1]);
						//console.log("split=" + msg[1]);
						//console.log("search=" + searchDB);
						response.writeHead(200, 
						{
							"Content-Type": "application/json",
							"Content-Length": msg.length
						});
						MongoClient.connect(dbUrl, function(err, db) 
						{
							var finalcount;
							if (err) throw err;
							var dbo = db.db("mydb");
							var myobj = stringMsg;
							dbo.collection("user").count({"username" : splitName[1], "pwd" : splitPassword[1]}, function(err, count)
							{
								console.log(err, count);
								finalcount = count;
								if(err) throw err;
								if(finalcount > 0)
								{
									loginStatus = true;
									loginUser = splitName[1];
									console.log("User Exist, User Name is: " + loginUser);
									db.close();
									return response.end(msg);
								}
								else
								{
									db.close();
									console.log("Username or Password not match");
									return response.end("fail");
								}
							});
						});
					});
				});

			}
			else
			{
				form = "login.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						response.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return response.end(contents);
					} 
					else 
					{
						response.writeHead(500);
						return response.end;
					}
				});

			}
		}
		else if(request.url === "/logout"){
			console.log("Requested URL is " +request.url);
			sendFileContent(response, "index.html", "text/html")

		}
		else if(request.url === "/test"){
			console.log("Requested URL is " +request.url);
			sendFileContent(response, "test.html", "text/html")

		}
		else if(request.url === "/profile"){
			console.log("Requested URL is " +request.url);
			sendFileContent(response, "profile.html", "text/html");
			if (response.method === "POST") {
				return response.end("hi alex");
			}
		}
		else if(/^\/[-a-zA-Z0-9\/]*.js$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.min.js$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.bundle.min.js$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.easing.min.js$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.magnific-popup.min.js$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.bundle.min.js.map$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/javascript");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.css$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/css");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.min.css$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/css");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.min.css.map$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "text/css");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.jpg$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "image/jpg");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.png$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "image/png");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.woff2$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "font/woff2");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.woff$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "font/woff");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.ttf$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "font/ttf");
		}
		else if(/^\/[-a-zA-Z0-9\/]*.ico$/.test(request.url.toString())){
			sendFileContent(response, request.url.toString().substring(1), "image/x-icon");
		}
		else{
			console.log("!!! Failed to load URL: " + request.url);
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + request.url);
			response.end();
		}
		
	}).listen(8888);

	console.log("Server time is " + new Date());

	function sendFileContent(response, fileName, contentType)
	{
		fs.readFile(fileName, function(err, data)
		{
			if(err){
				response.writeHead(404);
				response.write("<h1>Error 404</h1> <br> Page Not Found!");
			}
			else
			{
				response.writeHead(200, {'Content-Type': contentType});
				response.write(data);
			}
			response.end();
		});
	}
}).call(this);
