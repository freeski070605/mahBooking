const starterServiceDefinitions = [
  ["Skin Consultation", "Consultations", 35, "fixed", 30],
  ["Custom Facial", "Facials", 85, "starting_at", 60],
  ["Deep Cleansing Facial", "Facials", 95, "starting_at", 75],
  ["Hydrating Facial", "Facials", 90, "starting_at", 60],
  ["Acne Facial", "Facials", 95, "starting_at", 60],
  ["Back Facial", "Facials", 100, "starting_at", 60],
  ["Brow Wax", "Waxing", 20, "fixed", 20],
  ["Lip Wax", "Waxing", 12, "fixed", 15],
  ["Chin Wax", "Waxing", 15, "fixed", 15],
  ["Underarm Wax", "Waxing", 30, "fixed", 25],
  ["Brow Tint", "Brows & Lashes", 25, "fixed", 25],
  ["Lash Lift", "Brows & Lashes", 75, "starting_at", 60],
  ["Dermaplaning Add-On", "Add-Ons", 35, "fixed", 20],
  ["Jelly Mask Add-On", "Add-Ons", 20, "fixed", 15],
  ["LED Therapy Add-On", "Add-Ons", 25, "fixed", 20],
  ["High Frequency Add-On", "Add-Ons", 20, "fixed", 15],
];

function buildStarterServices() {
  return starterServiceDefinitions.map(
    ([name, category, price, priceType, durationMinutes], index) => ({
      name,
      category,
      price,
      priceType,
      durationMinutes,
      bufferMinutes: category === "Add-Ons" ? 0 : 15,
      shortDescription:
        "Starter example service. Edit the details, pricing, and instructions before launch.",
      fullDescription:
        "This is editable placeholder copy for an esthetician service. Use the admin dashboard to tailor the description to the final service menu.",
      imageUrl: `https://placehold.co/900x1200/f7ede7/372d2a?text=${encodeURIComponent(
        name,
      )}`,
      imagePublicId: "",
      requiresDeposit: false,
      depositAmount: 0,
      prepInstructions:
        "Add preparation instructions for this service before accepting bookings.",
      aftercareInstructions:
        "Add aftercare instructions for this service before accepting bookings.",
      contraindications:
        "Add contraindications, warnings, retinol guidance, product allergy notes, or consultation requirements.",
      consultationRequired: name.includes("Consultation"),
      isActive: true,
      isPublished: true,
      displayOrder: index + 1,
      featured: index > 0 && index < 4,
    }),
  );
}

module.exports = { buildStarterServices };
