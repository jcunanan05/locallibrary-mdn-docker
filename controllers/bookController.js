var Book = require("../models/book");
var Author = require("../models/author");
var Genre = require("../models/genre");
var BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

var async = require("async");

exports.index = function(req, res) {
  async.parallel(
    {
      book_count: callback => {
        Book.countDocuments({}, callback);
      },
      book_instance_count: callback => {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: callback => {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      author_count: callback => {
        Author.countDocuments({}, callback);
      },
      genre_count: callback => {
        Genre.countDocuments({}, callback);
      }
    },
    (err, results) => {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results
      });
    }
  );
};

// Display list of all Books.
exports.book_list = function(req, res, next) {
  Book.find({}, "title author")
    .populate("author")
    .exec(function(err, list_books) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("book_list", { title: "Book List", book_list: list_books });
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res) {
  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_instances: function(callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      }
    },
    function(err, results) {
      res.render("book_detail", {
        title: "Title",
        book: results.book,
        book_instances: results.book_instances
      });
    }
  );
};

// Display book create form on GET.
exports.book_create_get = async function(req, res, next) {
  Promise.all([await Author.find(), await Genre.find()])
    .catch(err => next(err))
    .then(([authors, genres]) => {
      res.render("book_form", {
        title: "Create Book",
        authors,
        genres
      });
    });
};

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("author", "Author must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("summary", "Summary must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("isbn", "ISBN must not be empty")
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields (using wildcard).
  sanitizeBody("*").escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    });

    if (!errors.isEmpty()) {
      Promise.all([await Author.find(), await Genre.find()])
        .catch(err => next(err))
        .then(([authors, genres]) => {
          const checkedGenres = genres.map(genre => {
            if (book.genre.indexOf(genre._id) > -1) {
              return {
                name: genre.name,
                checked: true
              };
            }
            return genre;
          });
          res.render("book_form", {
            title: "Create Book",
            authors,
            genres: checkedGenres,
            book,
            errors: errors.array()
          });
          return;
        });
    } else {
      Promise.resolve(await book.save())
        .catch(err => next(err))
        .then(() => {
          res.redirect(book.url);
        });
    }
  }
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
  res.send("NOT IMPLEMENTED: Book update GET");
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
  res.send("NOT IMPLEMENTED: Book update POST");
};
