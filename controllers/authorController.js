const Author = require("../models/author");
const Book = require("../models/book");

const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Display list of all Authors.
exports.author_list = function(req, res, next) {
  Author.find()
    .sort([["family_name", "ascending"]])
    .exec(function(err, list_authors) {
      if (err) return next(err);
      // successful
      res.render("author_list", {
        title: "Author List",
        author_list: list_authors
      });
    });
};

// Display detail page for a specific Author.
exports.author_detail = async function(req, res, next) {
  // async.parallel(
  //   {
  //     author: function(callback) {
  //       Author.findById(req.params.id).exec(callback);
  //     },
  //     author_books: function(callback) {
  //       Book.find({ author: req.params.id }, "title summary").exec(callback);
  //     }
  //   },
  //   function(err, results) {
  //     res.render("author_detail", {
  //       title: "Author Detail",
  //       author: results.author,
  //       author_books: results.author_books
  //     });
  //   }
  // );

  // try {
  //   const author = await Author.findById(req.params.id);
  //   const author_books = await Book.find(
  //     { author: req.params.id },
  //     "title summary"
  //   );

  //   res.render("author_detail", {
  //     title: "Author Detail",
  //     author,
  //     author_books
  //   });
  // } catch (error) {
  //   return next(error);
  // }

  Promise.all([
    await Author.findById(req.params.id),
    await Book.find({ author: req.params.id }, "title summary")
  ])
    .then(([author, author_books]) => {
      res.render("author_detail", {
        author,
        author_books
      });
    })
    .catch(err => next(err));
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .isLength({ min: 1 })
    .trim()
    .isAlphanumeric()
    .withMessage("Family name must be specified"),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601(),
  sanitizeBody("first_name").escape(),
  sanitizeBody("family_name").escape(),
  sanitizeBody("date_of_birth").toDate(),
  sanitizeBody("date_of_death").toDate(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array()
      });
      return;
    } else {
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });

      Promise.resolve(await author.save())
        .catch(err => next(err))
        .then(() => res.redirect(author.url));
    }
  }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
  res.send("NOT IMPLEMENTED: Author update POST");
};
