import { jest, test, expect } from "@jest/globals";

const mockAdd = jest.fn();
jest.unstable_mockModule("../repositories/foundRepository.js", () => ({
  default: { create: mockAdd },
}));
const { default: svc } = await import("../services/foundService.js");
test("rejects a found item without a title", async () => {
  const item = {
    category: "Electronics",
    location: "Library",
    contactName: "mari",
    contactEmail: "mari@example.com",
  };
  await expect(svc.addFoundItem(item)).rejects.toMatchObject({
    status: 400,
  });
  expect(mockAdd).not.toHaveBeenCalled();
});

test("adds valid found item", async () => {
  mockAdd.mockReset();
  const item = {
    title: "Phone",
    category: "Electronics",
    location: "Library",
    contactName: "name",
    contactEmail: "name@example.com",
  };
  const svd = { ...item, _id: "123" };
  mockAdd.mockResolvedValue(svd);
  const rst = await svc.addFoundItem(item);
  expect(mockAdd).toHaveBeenCalledTimes(1);
  expect(mockAdd).toHaveBeenCalledWith(
    expect.objectContaining(item)
  );
  expect(rst).toEqual(svd);
});

test.each([
  { key: "category", name: "a category" },
  { key: "location", name: "a location" },
  { key: "contactName", name: "a contact name" },
  { key: "contactEmail", name: "a contact email" },
])("rejects a found item without $name", async ({ key }) => {
  mockAdd.mockClear();
  const item = {
    title: "Phone",
    category: "Electronics",
    location: "Library",
    contactName: "name",
    contactEmail: "name@example.com",
  };
  delete item[key];
  await expect(svc.addFoundItem(item)).rejects.toMatchObject({ status: 400 });
  expect(mockAdd).not.toHaveBeenCalled();
});
test("adds a date if missing", async () => {
  mockAdd.mockReset();
  const item = {
    title: "Phone",
    category: "Electronics",
    location: "Library",
    contactName: "Alex",
    contactEmail: "alex@example.com",
  };

  mockAdd.mockImplementation(async (data) => data);
  const svd = await svc.addFoundItem(item);
  expect(svd.date).toBeInstanceOf(Date);
  expect(mockAdd).toHaveBeenCalledTimes(1);
});