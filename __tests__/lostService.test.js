import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const findAll = jest.fn();
const findById = jest.fn();
const create = jest.fn();
const removeById = jest.fn();

jest.unstable_mockModule("../repositories/lostRepository.js", () => ({
  findAll,
  findById,
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

const owner = { id: "user-a", username: "alice", role: "member" };
const otherMember = { id: "user-b", username: "bob", role: "member" };
const admin = { id: "user-c", username: "carol", role: "admin" };

// owner is an ObjectId in Mongo, so the fake item uses an object with toString like a real one
const itemOwnedBy = (userId) => ({
  _id: "item-1",
  title: "Blue backpack",
  owner: { toString: () => userId },
});

describe("reportLostItem: owner", () => {
  test("sets the owner from the logged-in user, not from the request body", async () => {
    create.mockResolvedValue({});

    await reportLostItem({ ...validBody(), owner: otherMember.id }, owner);

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ owner: owner.id }));
  });
});

describe("removeLostItem", () => {
  test("rejects with a 404 when the item does not exist", async () => {
    findById.mockResolvedValue(null);

    await expect(removeLostItem("missing-id", owner)).rejects.toMatchObject({
      status: 404,
      message: "Lost item not found",
    });
    expect(findById).toHaveBeenCalledWith("missing-id");
    expect(removeById).not.toHaveBeenCalled();
  });

  test("rejects a non-owner with a 403 and does not delete the item", async () => {
    findById.mockResolvedValue(itemOwnedBy(owner.id));

    await expect(removeLostItem("item-1", otherMember)).rejects.toMatchObject({
      status: 403,
      message: "You can only delete lost items you posted",
    });
    expect(removeById).not.toHaveBeenCalled();
  });

  test("rejects a member with a 403 when the item has no owner", async () => {
    findById.mockResolvedValue({ _id: "item-1", title: "Old item" });

    await expect(removeLostItem("item-1", otherMember)).rejects.toMatchObject({ status: 403 });
    expect(removeById).not.toHaveBeenCalled();
  });

  test("lets the owner delete their own item", async () => {
    const item = itemOwnedBy(owner.id);
    findById.mockResolvedValue(item);
    removeById.mockResolvedValue(item);

    await expect(removeLostItem("item-1", owner)).resolves.toBe(item);
    expect(removeById).toHaveBeenCalledWith("item-1");
  });

  test("lets an admin delete someone else's item", async () => {
    const item = itemOwnedBy(owner.id);
    findById.mockResolvedValue(item);
    removeById.mockResolvedValue(item);

    await expect(removeLostItem("item-1", admin)).resolves.toBe(item);
    expect(removeById).toHaveBeenCalledWith("item-1");
  });
});