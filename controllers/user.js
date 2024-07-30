const User = require("../models/user");
const Country = require("../models/country");
const moment = require("moment");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendMail } = require("../utils/sendEmail");
// ======================== showLoginForm ==========================
module.exports.showUserForm = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("user/editProfile", { user });
};
// ================== showLoginForm =============================
module.exports.showLoginForm = async (req, res) => {
  res.render("user/login");
};
// ================== showUsers =============================
module.exports.showUsers = async (req, res) => {
  let users;
  if (!req.user.role.includes("سوبر أدمين")) {
    users = await User.find({ role: "مستثمر" });
  } else {
    users = await User.find({});
  }
  res.render("user/index", { users, moment });
};
// ================== showRegisterForm ============================
module.exports.showRegisterForm = async (req, res) => {
  const algeria = await Country.find({});
  const states = algeria[0].states;
  res.render("user/register", { states, moment });
};
//
// ==================== Register ==============================
module.exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstname,
      lastname,
      birthdate,
      phone,
      gender,
      address,
      role,
    } = req.body.user;
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      req.flash("error", "user already exist");
      res.redirect("register");
    } else {
      const user = new User({
        email: email.toLowerCase(),
        hash: password,
        firstname: firstname.toLowerCase(),
        lastname: lastname.toLowerCase(),
        birthdate: birthdate,
        phone: phone,
        gender: gender,
        address: address.toLowerCase(),
        role: role,
      });
      await user.save().then((usr, err) => {
        if (err) {
          req.flash("error", e.message);
          res.redirect("register");
        } else {
          req.flash("success", "تم الإضافة بنجاح");
          res.redirect("/user");
        }
      });
    }
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

// ================s==== Login ==============================
module.exports.login = async (req, res) => {
  req.flash("success", `مرحبا بك ${req.user.firstname}`);
  // update the recently logged in user
  await User.findByIdAndUpdate(
    { _id: req.user.id },
    { $push: { loggedIn: moment() } }
  );
  const redirectUrl = req.session.returnTo || "/";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};
// ======================= Logout ==============
module.exports.logout = (req, res) => {
  // logout requere a callback function and a get request to work
  req.logout(() => {
    req.flash("success", `نراك قريبا`);
    res.redirect("login");
  });
};
// ======================= Logout ==============
module.exports.logout = (req, res) => {
  // logout requere a callback function and a get request to work
  req.logout(() => {
    req.flash("success", `نراك قريبا`);
    res.redirect("login");
  });
};
// =============== updateUser ==============================
module.exports.updateUser = async (req, res) => {
  const { user, approved } = req.body;
  const id = req.query.id;
  // res.send(id)
  await User.findByIdAndUpdate(
    id,
    { ...user, approved: approved == "on" ? true : false },
    { new: true }
  );
  req.flash("success", "تم التعديل بنجاح");
  res.redirect("back");
};
// =============== deleteUser ==============================
module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findById(id)
    .populate("cases")
    .then(async (document) => {
      // check if the user has cases
      let hasCaises = false;
      if (document.cases.length > 0) {
        for (const caisse of document.cases) {
          if (moment(caisse.endDate).isAfter(moment())) {
            hasCaises = true;
            break;
          }
        }
        if (hasCaises) {
          req.flash("error", "لا يمكن الحذف المستثمر لديه باقة سارية");
        } else {
          await User.findByIdAndUpdate(document.id, { approved: false });
          req.flash("success", "تم الحذف بنجاح");
        }
      } else {
        document.deleteOne();
        req.flash("success", "تم الحذف بنجاح");
      }
      res.redirect("/user");
    });
};
// =============== showProfile ==============================
module.exports.showProfile = async (req, res) => {
  res.render("user/profile", { user: req.user, moment });
};
module.exports.showEmailSendingForm = async (req, res) => {
  res.render("user/sendEmailReset");
};
module.exports.sendEmail = async (req, res) => {
  const { email } = req.body;
  // generate a reset token for the user, save it to the database
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      {
        resetToken: {
          token: generateResetToken(),
          createdAt: moment(),
          expires: moment(moment().add(1, "d")),
        },
      },
      { new: true }
    );
    if (!user) {
      req.flash("error", "ليس هنالك حساب بهذا الإيمل");
      res.redirect("back");
    } else {
      sendMail(email, user.resetToken.token);
      req.flash("success", "تم ارسال  رابط تغيير كلمة المرور عبر الإيمل");
      res.redirect("/user/login");
    }
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("back");
  }
};
module.exports.showResetPasswordForm = async (req, res) => {
  const { token } = req.params;
  // Verify the token, update the user's password, and redirect
  await User.findOne({ "resetToken.token": token }).then(async (user) => {
    if (!user) {
      req.flash("error", "الرابط غير صالح");
      res.redirect("/user/login");
    } else {
      // check if the token has expired
      if (moment().isBefore(user.resetToken.expires)) {
        res.render("user/resetPassword", { email: user.email, token });
      } else {
        req.flash("error", "الرابط غير صالح");
        res.redirect("/user/login");
      }
    }
  });
};
module.exports.passwordReset = async (req, res) => {
  const { email, password } = req.body;
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  try {
    await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          hash: hash,
          salt: salt,
          resetToken: {},
        },
      }
    );
    req.flash("success", "تم تغيير كلمة المرور بنجاح");
    res.redirect("/user/login");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
};
module.exports.changePassword = async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(newPassword, salt);
  const user = await User.findById({ _id: req.user.id }).select("+salt +hash");

  try {
    if (user.verifyPassword(oldPassword, user.hash)) {
      await User.findByIdAndUpdate(
        { _id: req.user.id },
        { hash: hash, salt: salt }
      );
      req.flash("success", "تم تغيير كلمة المرور");
      res.redirect("/user/" + req.user.id + "/profile");
    }
  } catch (e) {
    console.error(e);
    req.flash("error", "كلمة المرور غير صحيحة");
    res.redirect("/user/" + req.user.id + "/profile");
  }
};
function generateResetToken() {
  return crypto.randomBytes(20).toString("hex");
}
