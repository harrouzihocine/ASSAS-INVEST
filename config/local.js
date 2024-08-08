let moment = require("moment");
const Case = require("../models/case");
const Courier = require("../models/courier");

module.exports.locals = async (req, res, next) => {
  async function UnreadMUser() {
    if (req.user) {
      let result;
      const undreadMessages = await Courier.findOne({ user: req.user.id }).then(
        function (documents) {
          if (documents != null) {
            result = documents.message.reduce((acc, message) => {
              if (!message.consultedByUser) return acc + 1;
              else return acc;
            }, 0);
          } else {
            result = 0;
          }
        }
      );

      return result;
    }
  }
  async function UnreadMAdmin() {
    if (req.user && req.user.role.includes("أدمين")) {
      let result = 0;
      let total;

      const undreadMessages = await Courier.find({}).then(function (documents) {
        if (documents.length > 0) {
          for (let i = 0; i < documents.length; i++) {
            total = documents[i].message.reduce((acc, message) => {
              if (!message.consultedByAdmin) return acc + 1;
              else return acc;
            }, 0);
            result = result + total;
          }
        } else {
          result = 0;
        }
      });

      return result;
    }
  }

  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.bgColor = "bg-dark";
  res.locals.textColor = "text-dark";
  res.locals.now = moment().format("YYYY");
  res.locals.announceProfits = await Case.countDocuments({
    state: "قيد الإنتظار",
  });
  // res.locals.announceProfits = async () => {
  //   const nbr = await Case.find({ state: "قيد الإنتظار" })
  //     .populate(["user", "pack"])
  //     .count();

  //   return nbr;
  // };

  res.locals.unreadUser = await UnreadMUser();
  res.locals.unreadAdmin = await UnreadMAdmin();
  res.locals.getNbrOfDays = (nbrDays) => {
    // console.log("nbrDays: ", nbrDays);
    return nbrDays > 1 ? nbrDays + " days" : nbrDays + " day";
  };
  res.locals.calculatePercentage = (date, period) => {
    return Math.round(
      Math.abs((moment(date).diff(moment(), "days") * 100) / period)
    );
  };
  next();
};
