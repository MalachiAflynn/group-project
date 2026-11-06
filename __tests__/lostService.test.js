import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const findAll = jest.fn();
const create = jest.fn();
const removeById = jest.fn();

jest.unstable_mockModule("../repositories/lostRepository.js", () => ({
  findAll,
  create,
  removeById,
}));

const { reportLostItem, removeLostItem } = await import(
  "../services/lostService.js"
);

const REQUIRED_FIELDS = ["title", "category", "location", "contactName", "contactEmail"];

const validBody = () => ({
  title: "Blue backpack",
  description: "Has a UMass patch",
  category: "Bags",
  location: "Du Bois Library",
  date: "2026-11-01",
  contactName: "Sam Minuteman",
  contactEmail: "sam@umass.edu",
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe("reportLostItem: required fields", () => {
  test.each(REQUIRED_FIELDS)("rejects with a 400 when %s is missing", async (field) => {
    const body = validBody();
    delete body[field];

    await expect(reportLostItem(body)).rejects.toMatchObject({
      status: 400,
      message: `Missing required field(s): ${field}`,
    });
    expect(create).not.toHaveBeenCalled();
  });

  test.each(REQUIRED_FIELDS)("rejects with a 400 when %s is an empty string", async (field) => {
    await expect(reportLostItem({ ...validBody(), [field]: "" })).rejects.toMatchObject({
      status: 400,
      message: `Missing required field(s): ${field}`,
    });
    expect(create).not.toHaveBeenCalled();
  });

  test("names every missing field in one error", async () => {
    await expect(
      reportLostItem({ ...validBody(), title: "", location: "" })
    ).rejects.toThrow("Missing required field(s): title, location");
    expect(create).not.toHaveBeenCalled();
  });

  test("rejects with a 400 listing all required fields when called with no body", async () => {
    await expect(reportLostItem()).rejects.toMatchObject({
      status: 400,
      message: `Missing required field(s): ${REQUIRED_FIELDS.join(", ")}`,
    });
    expect(create).not.toHaveBeenCalled();
  });
});

describe("removeLostItem", () => {
  test("rejects with a 404 when the repository finds nothing to delete", async () => {
    removeById.mockResolvedValue(null);

    await expect(removeLostItem("missing-id")).rejects.toMatchObject({
      status: 404,
      message: "Lost item not found",
    });
    expect(removeById).toHaveBeenCalledWith("missing-id");
  });
});