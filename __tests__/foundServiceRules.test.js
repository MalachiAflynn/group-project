import { jest, test, expect, beforeEach } from "@jest/globals";

const create = jest.fn();
const removeById = jest.fn();

jest.unstable_mockModule("../repositories/foundRepository.js", () => ({
  default: { create, removeById },
}));

const { default: foundService } = await import("../services/foundService.js");

const validItem = {
  title: "Phone",
  category: "Electronics",
  location: "Library",
  contactName: "Sam",
  contactEmail: "sam@example.com",
};

beforeEach(() => {
  create.mockReset();
  removeById.mockReset();
});

test.each(["title", "category", "location", "contactName", "contactEmail"])(
  "rejects a found item when %s is only spaces",
  async (field) => {
    const item = { ...validItem, [field]: "   " };

    await expect(foundService.addFoundItem(item)).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining(field),
    });
    expect(create).not.toHaveBeenCalled();
  }
);

test("returns a 404 when deleting a found item that does not exist", async () => {
  removeById.mockResolvedValue(null);

  await expect(foundService.removeFoundItem("missing-id")).rejects.toMatchObject({
    status: 404,
  });
  expect(removeById).toHaveBeenCalledWith("missing-id");
});

test("returns the deleted item when it exists", async () => {
  const deleted = { ...validItem, _id: "abc123" };
  removeById.mockResolvedValue(deleted);

  await expect(foundService.removeFoundItem("abc123")).resolves.toEqual(deleted);
  expect(removeById).toHaveBeenCalledWith("abc123");
});
