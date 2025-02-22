import DatabaseService from './databaseService.js';
import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';

export default class UserService extends DatabaseService {
  constructor() {
    super(User);
  }

  async register(userData) {
    return this.transaction(async (session) => {
      const existingUser = await this.findOne({ email: userData.email });
      if (existingUser) {
        throw new ApiError(400, 'Email already registered');
      }
      return this.create(userData, { session });
    });
  }

  async login(email, password) {
    const user = await this.findOne({ email }, { select: '+password' });
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }
    return user;
  }

  async findByEmail(email, selectPassword = false) {
    return this.findOne(
      { email },
      { select: selectPassword ? '+password' : '' }
    );
  }

  async findByResetToken(resetPasswordToken) {
    return this.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
  }

}

export const userService = new UserService(); 