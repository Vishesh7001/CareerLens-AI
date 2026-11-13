const User = require('../models/User');

/**
 * @desc    Get authenticated user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update authenticated user's profile (Full Name)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;

    // Check if email modification was attempted
    if (email && email.trim().toLowerCase() !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'Email address cannot be changed in this phase.',
      });
    }

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long.',
      });
    }

    const trimmedName = fullName.trim();
    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot exceed 100 characters.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.fullName = trimmedName;
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

