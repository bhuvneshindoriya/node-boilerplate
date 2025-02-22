import { userService } from '../../../services/userService.js';
import User from '../../../models/userModel.js';
import ApiError from '../../../utils/ApiError.js';

// Mock the User model
jest.mock('../../../models/userModel.js');

describe('UserService', () => {
  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ ...userData, _id: 'some-id' });

      const result = await userService.register(userData);

      expect(result).toHaveProperty('_id');
      expect(result.email).toBe(userData.email);
      expect(User.create).toHaveBeenCalledWith(userData, expect.any(Object));
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ email: userData.email });

      await expect(userService.register(userData)).rejects.toThrow(ApiError);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        ...userData,
        _id: 'some-id',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await userService.login(userData.email, userData.password);

      expect(result).toEqual(mockUser);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(userData.password);
    });

    it('should throw error for invalid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(userService.login(userData.email, userData.password))
        .rejects
        .toThrow(ApiError);
    });
  });
}); 