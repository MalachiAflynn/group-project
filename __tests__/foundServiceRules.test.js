import { jest, test, expect, beforeEach } from "@jest/globals";

const create = jest.fn();
const findById = jest.fn();
const removeById = jest.fn();

jest.unstable_mockModule("../repositories/foundRepository.js", () => ({
  default: { create, findById, removeById },
}));

const { default: foundService } = await import("../services/foundService.js");

const validItem = {
  title: "Phone",
  category: "Electronics",
  location: "Library",
  contactName: "Sam",
  contactEmail: "sam@example.com",
};

const owner = { id: "user-a", username: "alice", role: "member" };
const otherMember = { id: "user-b", username: "bob", role: "member" };
const admin = { id: "user-c", username: "carol", role: "admin" };

// owner is an ObjectId in Mongo, so the fake item uses an object with toString like a real one
const itemOwnedBy = (userId) => ({ ...validItem, _id: "abc123", owner: { toString: () => userId } });

beforeEach(() => {
  create.mockReset();
  findById.mockReset();
  removeById.mockReset();
});

test.each(["title", "category", "location", "contactName", "contactEmail"])(
  "rejects a found item when %s is only spaces",
  async (field) => {
    const item = { ...validItem, [field]: "   " };

    await expect(foundService.addFoundItem(item, owner)).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining(field),
    });
    expect(create).not.toHaveBeenCalled();
  }
);

test("sets the owner from the logged-in user, not from the request body", async () => {
  create.mockImplementation(async (data) => data);

  await foundService.addFoundItem({ ...validItem, owner: otherMember.id }, owner);

  expect(create).toHaveBeenCalledWith(expect.objectContaining({ owner: owner.id }));
});

test("returns a 404 when deleting a found item that does not exist", async () => {
  findById.mockResolvedValue(null);

  await expect(foundService.removeFoundItem("missing-id", owner)).rejects.toMatchObject({
    status: 404,
  });
  expect(findById).toHaveBeenCalledWith("missing-id");
  expect(removeById).not.toHaveBeenCalled();
});

test("rejects a non-owner with a 403 and does not delete the item", async () => {
  findById.mockResolvedValue(itemOwnedBy(owner.id));

  await expect(foundService.removeFoundItem("abc123", otherMember)).rejects.toMatchObject({
    status: 403,
    message: "You can only delete found items you posted",
  });
  expect(removeById).not.toHaveBeenCalled();
});

test("lets the owner delete their own found item", async () => {
  const item = itemOwnedBy(owner.id);
  findById.mockResolvedValue(item);
  removeById.mockResolvedValue(item);

  await expect(foundService.removeFoundItem("abc123", owner)).resolves.toEqual(item);
  expect(removeById).toHaveBeenCalledWith("abc123");
});

test("lets an admin delete someone else's found item", async () => {
  const item = itemOwnedBy(owner.id);
  findById.mockResolvedValue(item);
  removeById.mockResolvedValue(item);

  await expect(foundService.removeFoundItem("abc123", admin)).resolves.toEqual(item);
  expect(removeById).toHaveBeenCalledWith("abc123");
});
