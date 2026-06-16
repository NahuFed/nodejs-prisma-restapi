import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "../../../productos-app");

function sendPage(pagePath) {
    return (req, res) => {
        res.sendFile(path.join(frontendRoot, pagePath));
    };
}

router.get("/", sendPage("index.html"));
router.get("/login", sendPage("index.html"));
router.get("/register", sendPage("src/pages/register.html"));
router.get("/productos", sendPage("src/pages/productos.html"));
router.get("/users", sendPage("src/pages/users.html"));
router.get("/401", sendPage("401.html"));
router.get("/404", sendPage("404.html"));

router.get("/index.html", (req, res) => res.redirect("/"));
router.get("/login.html", (req, res) => res.redirect("/login"));
router.get("/register.html", (req, res) => res.redirect("/register"));
router.get("/productos.html", (req, res) => res.redirect("/productos"));
router.get("/users.html", (req, res) => res.redirect("/users"));
router.get("/401.html", (req, res) => res.redirect("/401"));
router.get("/404.html", (req, res) => res.redirect("/404"));
router.get("/src/pages/index.html", (req, res) => res.redirect("/"));
router.get("/src/pages/register.html", (req, res) => res.redirect("/register"));
router.get("/src/pages/productos.html", (req, res) => res.redirect("/productos"));
router.get("/src/pages/users.html", (req, res) => res.redirect("/users"));

router.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
        return next();
    }

    return res.redirect("/404");
});

export default router;