export function userInfo(user) {
    return { id: user._id.toString(), username: user.username, role: user.role }
}