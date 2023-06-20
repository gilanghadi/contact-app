const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

require("./utils/db");
const { Contact } = require("./model/contact");

const app = express();
const port = 3000;

// setup method overide
app.use(methodOverride("_method"));

// setup ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// halaman home
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
    title: "Halaman Home",
  });
});
// halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
});
// halaman contact
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Halaman Contact",
    contacts: contacts,
    msg: req.flash("msg"),
  });
});
// halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Contact",
    layout: "layouts/main-layout",
  });
});
// proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama Contact Sudah Digunakan");
      }
      return true;
    }),
    check("email", "Email Tidak Valid").isEmail(),
    check("nohp", "Nomor HP Tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Data Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (err) => {
        if (err) {
          throw new Error(err);
        }
        // kirimkan flash message
        req.flash("msg", "Data Contact Berhasil Ditambahkan");
        res.redirect("/contact");
      });
    }
  }
);

// delete contact
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama })
    .then((result) => {
      req.flash("msg", "Data Contact Berhasil Dihapus!");
      res.redirect("/contact");
    })
    .catch((err) => {
      throw new Error(err);
    });
});

// form ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    layout: "layouts/main-layout",
    contact: contact,
  });
});

// proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama Contact Sudah Digunakan");
      }
      return true;
    }),
    check("email", "Email Tidak Valid").isEmail(),
    check("nohp", "Nomor HP Tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Data Ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      )
        .then((result) => {
          // krimkan flash message
          req.flash("msg", "Data Contact Berhasil Diubah");
          res.redirect("/contact");
        })
        .catch((err) => {
          throw new Error(err);
        });
    }
  }
);

// halaman detail contact
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Halaman Detail Contact",
    contact: contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact App | Listening At http://localhost:${port}`);
});
