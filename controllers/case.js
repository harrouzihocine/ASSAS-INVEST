const moment = require("moment");
const crypto = require("crypto");
const Case = require("../models/case");
const Pack = require("../models/pack");
const User = require("../models/user");

module.exports.caseList = async (req, res) => {
  const packs = await Pack.find({state:"مفعلة"});
  const caisses = await Case.find({}).populate(["user", "pack"]);
  const users = await User.find({ role: "مستثمر",approved:true });
  var ref_id = crypto.randomBytes(4).toString("hex").toUpperCase();
  const year = moment().format("YY");
  ref_id = ref_id + year;
  res.render("case/index", { packs,caisses, moment, users, ref_id });
};
module.exports.showUserMain = async (req, res) => {
  const { id } = req.params;
  const caisse = await Case.find({ user: id }).populate(["pack"]);

  res.render("case/main", { caisse, moment }); //fix global initamount
};
module.exports.profitsList = async (req, res) => {
  const caisses = await Case.find({}).populate(["user", "pack"]);
  res.render("case/profits/index", { caisses, moment });
};
module.exports.createCase = async (req, res) => {
  let { casee } = req.body;
  const packchosen = await Pack.findById(casee.pack);

  if (packchosen.unite === "شهر") {
    endDate = moment(casee.startDate)
      .add(packchosen.period, "months")
      .format("YYYY-MM-DD");
  } else if (packchosen.unite === "أسبوع") {
    endDate = moment(casee.startDate)
      .add(packchosen.period, "weeks")
      .format("YYYY-MM-DD");
  } else {
    endDate = moment(casee.startDate)
      .add(packchosen.period, "days")
      .format("YYYY-MM-DD");
  }

  const newCase = new Case({
    reference: casee.reference,
    user: casee.user,
    pack: casee.pack,
    initAmount: casee.initAmount,
    description: casee.description,
    startDate: casee.startDate,
    endDate: endDate,
    profit: 0,
  });

  await newCase.save();
  // add the case to the user cases list
  await User.findByIdAndUpdate(casee.user, { $push: { cases: newCase._id } });
  res.redirect("/case");
};
module.exports.createProfits = async (req, res) => {
  let { caisse } = req.body;
  await Case.findByIdAndUpdate(
    caisse.profitsId,
    {
      profit: caisse.amount,
      state: "منتهية",
    },
    { new: true }
  );
  res.redirect("/profits");
};
module.exports.showCreationForm = async (req, res) => {
  const packs = await Pack.find({state:"مفعلة"});
  const users = await User.find({ role: "مستثمر",approved: true});
  var ref_id = crypto.randomBytes(4).toString("hex").toUpperCase();
  const year = moment().format("YY");
  ref_id = ref_id + year;

  res.render("case/new", { packs, users, moment, ref_id });
};
module.exports.showUpdateForm = async (req, res) => {
  const { id } = req.params;
  const invest = await Case.findById(id).populate(["packname"]);
  const packs = await Pack.find({});
  if (!invest) {
    req.flash("error", "Cannot find that investment!");
    return res.redirect("/case");
  }
  res.render("case/edit", {
    invest,
    packs,
  });
};
module.exports.showCase = async (req, res) => {
  const { id } = req.params;
  const caisses = await Case.find({
    user: id,
    state: { $eq: "نشطة" },
  }).populate(["pack"]);
  res.render("case/show", { caisses, moment });
};
module.exports.showUserCases = async (req, res) => {
  const { id } = req.params;
  const caisses = await Case.find({ user: id })
    .populate(["pack"])
    .sort({ startDate: -1, state: 1 });
  res.render("case/indexuser", { caisses, moment });
};
module.exports.showUsersCase = async (req, res) => {
  // const users = await Case.find({}).populate({ path: "user" });
  const invests = await Case.find({}).populate(["user", "packname"]);
  // res.send(invests);

  res.render("case/usersInvest", { invests, moment });
};
module.exports.updateCase = async (req, res) => {
  const { id } = req.params;
  const { caisse } = req.body;

  await Case.findByIdAndUpdate(id, { ...caisse }, { new: true });
  req.flash("success", "تم التعديل بنجاح");
  res.redirect("back");
};

module.exports.deleteCase = async (req, res) => {
  const { id } = req.params;
  await Case.findByIdAndDelete(id);
  req.flash("success", "تم الحذف بنجاح");
  res.redirect("/case");
};
