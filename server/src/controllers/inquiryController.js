const Inquiry = require("../models/Inquiry");
const Client = require("../models/Client");
const { ApiError } = require("../utils/apiError");

async function getInquiries(req, res) {
  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  const inquiries = await Inquiry.find(query)
    .sort({ createdAt: -1 })
    .populate("clientId", "name firstName lastName email phone");

  res.json({ inquiries });
}

async function createInquiry(req, res) {
  const inquiry = await Inquiry.create(req.body);
  res.status(201).json({ inquiry });
}

async function updateInquiry(req, res) {
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!inquiry) {
    throw new ApiError(404, "That inquiry could not be found.");
  }

  res.json({ inquiry });
}

async function convertInquiryToClient(req, res) {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    throw new ApiError(404, "That inquiry could not be found.");
  }

  const [firstName = "", ...lastNameParts] = inquiry.name.split(" ");
  const client = await Client.findOneAndUpdate(
    inquiry.email ? { email: inquiry.email } : { phone: inquiry.phone },
    {
      $set: {
        name: inquiry.name,
        firstName,
        lastName: lastNameParts.join(" "),
        email: inquiry.email || undefined,
        phone: inquiry.phone || "",
        notes: inquiry.message,
        internalNotes: inquiry.privateNote,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  inquiry.clientId = client._id;
  inquiry.status = "booked";
  await inquiry.save();

  res.json({ inquiry, client });
}

module.exports = {
  convertInquiryToClient,
  createInquiry,
  getInquiries,
  updateInquiry,
};
