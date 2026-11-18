export default function requireLogin(req, res, next) {
    if (req.session.user) {
        return next();
    }
    if (req.method === "GET") {
        return res.redirect("/login");
    }
    return res.status(401).json({ error: "You must be logged in" });
}