var express = require("express"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	mongoose = require("mongoose"),
	expressSanitizer = require("express-sanitizer"),
	app = express();

mongoose.connect('mongodb://localhost:27017/restful_blog_app',  {
    useNewUrlParser:  true,
    useUnifiedTopology:  true
})
.then(()  => console.log('Connected to DB!'))
.catch(error => console.log(error.message));


//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,  //{type: String, default: "placeholder: image.jpg"}
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


//RESTFUL ROUTES
app.get("/", function(req, res){
	res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});


//CREATE ROUTE
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body); //remove any unreq code in body
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){ res.render("new") }
		else{ res.redirect("/blogs") }
	});	
});


//SHOW BLOG POST
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){ res.redirect("/blogs") }
		else{ res.render("show", {blog: foundBlog}) }
	})
});


//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} 
		else { 
			res.render("edit", {blog: foundBlog});
		}
	})
});


//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		req.body.blog.body = req.sanitize(req.body.blog.body); //remove any unreq code in body
		if(err){ res.redirect("/blogs") }
		else { res.redirect("/blogs/" + req.params.id); }
	})
});


//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
});


//Tell Express to listen for request
app.listen(process.env.PORT || 3000, process.env.IP, function(){
console.log("Started server");
});


