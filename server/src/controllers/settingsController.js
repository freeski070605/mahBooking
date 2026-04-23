const { ensureBusinessSettings } = require("../lib/singletons");

async function getSettings(_req, res) {
  const settings = await ensureBusinessSettings();
  res.json({ settings });
}

async function updateSettings(req, res) {
  const settings = await ensureBusinessSettings();

  Object.assign(settings, req.body);
  await settings.save();

  res.json({ settings });
}

module.exports = { getSettings, updateSettings };
