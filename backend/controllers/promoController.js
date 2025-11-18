const PromoCode = require("../models/PromoCode");

// Get all promo codes
exports.getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      promoCodes,
    });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promo codes",
    });
  }
};

// Create promo code
exports.createPromoCode = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, usageLimit, minOrderAmount } = req.body;
    
    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit || null,
      minOrderAmount: minOrderAmount || 0,
      active: true,
    });

    await promoCode.save();

    res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      promoCode,
    });
  } catch (error) {
    console.error("Error creating promo code:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Promo code already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating promo code",
    });
  }
};

// Update promo code
exports.updatePromoCode = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, usageLimit, minOrderAmount, active } = req.body;
    
    const promoCode = await PromoCode.findById(req.params.id);
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    if (code) promoCode.code = code.toUpperCase();
    if (discountType) promoCode.discountType = discountType;
    if (discountValue !== undefined) promoCode.discountValue = discountValue;
    if (expiryDate) promoCode.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;
    if (minOrderAmount !== undefined) promoCode.minOrderAmount = minOrderAmount;
    if (active !== undefined) promoCode.active = active;

    await promoCode.save();

    res.json({
      success: true,
      message: "Promo code updated successfully",
      promoCode,
    });
  } catch (error) {
    console.error("Error updating promo code:", error);
    res.status(500).json({
      success: false,
      message: "Error updating promo code",
    });
  }
};

// Delete promo code
exports.deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    await PromoCode.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting promo code",
    });
  }
};

