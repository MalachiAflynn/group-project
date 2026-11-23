// Used by the Lost and Found services after they load an item, before changing it.
// user is req.session.user ({ id, username, role }); item.owner is the poster's User id.
export function isOwnerOrAdmin(user, item) {
  if (user.role === "admin") {
    return true;
  }
  return item.owner != null && item.owner.toString() === user.id;
}
