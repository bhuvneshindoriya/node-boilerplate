export default class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }

  static success(data, message) {
    return new ApiResponse(200, data, message);
  }

  static created(data, message) {
    return new ApiResponse(201, data, message);
  }

  static notFound(message = 'Not found') {
    return new ApiResponse(404, null, message);
  }
} 