export class ApiResponse {
  static json(res, data, statusCode = 200) {
    return res.status(statusCode).json(data);
  }
}
