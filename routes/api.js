/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoose = require("mongoose");

const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
mongoose.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true });
var Schema = mongoose.Schema;
var BookSchema = new Schema({
    title:  {type: String, required: true},
    comments: [String],
    commentcount: Number
  });

var Book = mongoose.model("Book", BookSchema);




module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}, function(err, data) {
        if (err) {
          console.log(err);
          res.json({error: "Error getting books from database."});
        } else {
          console.log("books retrieved");
          // return an array!
          
          var newArr = data.map(function(el) {
            return {_id: el._id, title: el.title, commentcount: el.commentcount};
          });
          
          res.json(newArr); // json or send
        }
      });
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      console.log(title);
      if (title) {
        var book = new Book({title: title, commentcount: 0, comments: []});
        book.save(function(err, data) {
          if (err) {
            console.log(err);
            res.json({error: "Error saving book to database."});
          } else {
            console.log("book saved!");
            res.json({"title": title,"comments":[],"_id":data._id});
          }
        });
      } else {res.json({error: "missing title"});}
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, function(err) {
        if (err) {
          console.log(err);
          res.json({error: "Error deleting books in database."});
        } else {
          console.log("complete delete successful");
          res.json({"message": "complete delete successful"});
        }
      });
      //if successful response will be 'complete delete successful'
    });


  // specific book routes /////////////////////////////////////////////////////////////////////////////
  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      Book.findById(bookid, function(err, data) {
        if (data) {
          if (err) {
            console.log(err);
            res.json({error: "Error finding book in database."});
          } else {
            console.log("found book"); //, data);
            res.json({"_id": data._id, "title": data.title, "comments": data.comments});
          }
        } else {
          console.log("book not found");
          res.json({error: "book not found"});
        }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
  
    // put?
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
        // {new: true} returns5bee01ae1bd42910dbbedd0e the updated book
        Book.findByIdAndUpdate(bookid, { $push: { comments: comment },  $inc: { commentcount: 1 }}, { new: true }, function(err, data) {
        if (data) {
          if (err) {
            console.log(err);
            res.json({error: "Error finding book in database."});
          } else {
            console.log("comment update successful"); //, data);
            res.json({"_id": data._id, "title": data.title, "comments": data.comments});
          }
        } else {
          console.log("book not found");
          res.json({error: "book not found"});
        }
      });
      //json res format same as .get
    })
    
    
    .delete(function(req, res){
      var bookid = req.params.id;
      Book.findByIdAndDelete(bookid, function(err, data) {
        if (data) {
          if (err) {
            console.log(err);
            res.json({error: "Error finding book in database."});
          } else {
            console.log("delete successful", data);
            res.send("delete successful");
          }
        } else {
          console.log("book not found");
          res.json({error: "book not found"});
        }
      });
      //if successful response will be 'delete successful'
    });
  
};
