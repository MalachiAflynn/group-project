import asyncHandler from "../middleware/asyncHandler.js";
import * as authService from "../services/authService.js";

export const showSignup = asyncHandler(async (req, res) => {
    res.render("signup", { title: "Sign Up | UMass Lost & Found", error: null });
});

export const showLogin = asyncHandler(async (req, res) => {
    res.render("login", { title: "Login | UMass Lost & Found", error: null });
});

export const signup = asyncHandler(async (req, res, next) => {
    let user;

    try {
        user = await authService.signUp(req.body);
    } catch (err) {
        if (err.status) {
            return res.status(err.status).render("signup", { title: "Sign Up | UMass Lost & Found", error: err.message });
        }
        throw err;
    }

    req.session.regenerate((regenErr) => {
        if (regenErr) return next(regenErr);
        req.session.user = user;
        res.redirect("/lost");
    });
});

export const login = asyncHandler(async (req, res, next) => {
    let user;

    try {
        user = await authService.login(req.body);
    } catch (err) {
        if (err.status) {
            return res.status(err.status).render("login", { title: "Login | UMass Lost & Found", error: err.message });
        }
        throw err;
    }

    req.session.regenerate((regenErr) => {
        if (regenErr) return next(regenErr);
        req.session.user = user;
        res.redirect("/lost");
    });
});

export const logout = (req, res, next) => {
    req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
};
