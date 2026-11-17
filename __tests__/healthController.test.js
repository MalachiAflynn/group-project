import { jest, describe, test, expect } from "@jest/globals";
import { getHealth } from "../controllers/healthController.js";

const fakeRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

describe("GET /health", () => {
  test("responds 200 with { status: 'ok' }", () => {
    const res = fakeRes();
    getHealth({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "ok" });
  });

  test("works with no session or logged-in user", () => {
    const res = fakeRes();
    getHealth({ session: undefined }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "ok" });
  });
});
