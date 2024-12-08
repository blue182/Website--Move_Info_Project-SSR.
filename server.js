require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const TemplateEngine = require("./22393");
const MyError = require("./cerror");

const port = process.env.PORT || 3001;
const templateEngine = new TemplateEngine(path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const template = `
22393{if user.isLoggedIn}
Welcome back, 22393{user.name}!
{else}
Please log in to continue.
{/if}

22393{for item in items}
- 22393{item.name} (22393{item.quantity})
{/for}
`;

const data = {
  user: { isLoggedIn: true, name: "John Doe" },
  items: [
    { name: "Apple", quantity: 3 },
    { name: "Banana", quantity: 5 },
    { name: "Orange", quantity: 2 },
  ],
};

const partials = {};

const engine = new TemplateEngine(path.join(__dirname, "views"));
const output = engine.parseTemplate(template, data, partials);
console.log("OUTPUT: ", output);

app.get("/", (req, res) => {
  const data = {};

  // Nạp layout và partials
  const layout = templateEngine.loadTemplate("layouts/main.html");
  const partials = {
    Header: templateEngine.loadTemplate("partials/header.html"),
    Navbar: templateEngine.loadTemplate("partials/navbar.html"),
    Footer: templateEngine.loadTemplate("partials/footer.html"),
  };

  // Render template
  const html = templateEngine.parseTemplate(layout, data, partials);

  // Trả về HTML
  res.send(html);
});

app.use((req, res, next) => {
  const error = new MyError(
    404,
    "Page Not Found",
    "The requested URL does not exist."
  );
  next(error);
});

app.use((err, req, res, next) => {
  if (err instanceof MyError) {
    const template = templateEngine.loadTemplate("layouts/error.html");
    const html = templateEngine.parseTemplate(template, {
      statusCode: err.statusCode,
      message: err.message,
      desc: err.desc,
    });
    res.status(err.statusCode).send(html);
  } else {
    const template = templateEngine.loadTemplate("layouts/error.html");
    const html = templateEngine.parseTemplate(template, {
      statusCode: 500,
      message: "Internal Server Error",
      desc: "Something went wrong on the server.",
    });
    res.status(500).send(html);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
