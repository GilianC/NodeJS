import supertest from "supertest";
import app from "../index.js";
describe("Test the root path", () => {
  test("It should respond to the GET method", async () => {
    const response = await supertest(app).get("/");
  expect(response.statusCode).toBe(200);
  expect(response.text).toContain('Pseudo');
  });
});