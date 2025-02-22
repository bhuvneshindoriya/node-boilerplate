const { uploadToS3 } = require('../middleware/upload');
const User = require('../models/userModel');

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Upload to S3
    const imageUrl = await uploadToS3(req.file);

    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        imageUrl,
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadProfileImage
}; 