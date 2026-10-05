require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./models/order");
const CustomOrder = require("./models/customOrder");
const User = require("./models/user");
const Product = require("./models/product");
const bcrypt = require("bcryptjs");
const express = require("express");
const path = require ("path");
const products = require("./data/products.json");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.set("trust proxy", 1);

if (!process.env.NETLIFY) {
    app.use(express.static(path.join(__dirname, "public")));
}
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { secure: "auto", httpOnly: true, sameSite: "lax" }
}));

app.get("/", (req, res) => {
    res.render ("index");
});

app.get("/shop", async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });

        res.render("shop", {
            products: products
        });

    } catch (error) {
        console.error("Error loading products:", error);
        res.status(500).send("Could not load products.");
    }
});

app.get("/product/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        const product = await Product.findOne({ id: productId });

        if (!product) {
            return res.status(404).send("Product not found.");
        }

        res.render("product", {
            product: product
        });

    } catch (error) {
        console.error("Error loading product:", error);
        res.status(500).send("Could not load product.");
    }
});

app.get("/cart", (req, res) => {
    res.render("cart");
});
app.get("/checkout", (req, res) => {
    res.render("checkout");
});
app.get("/order-success", (req, res) => {
    res.render("order-success");
});
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);
            return res.status(500).send("Could not log out.");
        }

        res.redirect("/");
    });
});
app.get("/admin", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "admin") {
        return res.status(403).send("Access denied.");
    }

    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        const customOrders = await CustomOrder.find().sort({ createdAt: -1 });

        res.render("admin", {
            userName: req.session.userName,
            orders: orders,
            customOrders: customOrders
        });

    } catch (error) {
        console.error("Error loading admin panel:", error);
        res.status(500).send("Could not load admin panel.");
    }
});


app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({
            success: true,
            message: "Account created successfully!"
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Could not create account."
        });
    }
});

app.post("/api/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.json({
                success: false,
                message: "Invalid email or password."
            });
        }

        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userRole = user.role;

        res.json({
            success: true,
            message: "Login successful!"
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Could not log in."
        });
    }
});
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });

        res.json(products);

    } catch (error) {
        console.error("Error loading products:", error);

        res.status(500).json({
            success: false,
            message: "Could not load products."
        });
    }
});

app.post("/api/products", async (req, res) => {
    try {
        const lastProduct = await Product.findOne().sort({ id: -1 });

        const newId = lastProduct ? lastProduct.id + 1 : 1;

        const product = new Product({
            id: newId,
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            image: req.body.image,
            description: req.body.description
        });

        await product.save();

        res.json({
            success: true,
            message: "Product added successfully!"
        });

    } catch (error) {
        console.error("Error adding product:", error);

        res.status(500).json({
            success: false,
            message: "Could not add product."
        });
    }
});

app.delete("/api/products/:id", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "admin") {
    return res.status(403).json({
        success: false,
        message: "Access denied."
    });
}
    try {
        const productId = parseInt(req.params.id);

        const deletedProduct = await Product.findOneAndDelete({
            id: productId
        });

        if (!deletedProduct) {
            return res.json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully!"
        });

    } catch (error) {
        console.error("Error deleting product:", error);

        res.status(500).json({
            success: false,
            message: "Could not delete product."
        });
    }
});

app.put("/api/products/:id", async (req, res) => {

    if (!req.session.userId || req.session.userRole !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied."
        });
    }

    try {
        const productId = parseInt(req.params.id);

        const updatedProduct = await Product.findOneAndUpdate(
            { id: productId },
            {
                name: req.body.name,
                price: req.body.price
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully!"
        });

    } catch (error) {
        console.error("Error updating product:", error);

        res.status(500).json({
            success: false,
            message: "Could not update product."
        });
    }
});

app.get("/custom-order", (req, res) => {
    res.render("custom-order");
});
app.post("/api/orders", async (req, res) => {
    try {
        const order = new Order(req.body);

        await order.save();

        console.log("Order saved to MongoDB:", order);

        res.json({
            success: true,
            message: "Order received successfully!"
        });

    } catch (error) {
        console.error("Error saving order:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save order."
        });
    }
});
app.post("/api/custom-orders", async (req, res) => {
    try {
        const customOrder = new CustomOrder(req.body);

        await customOrder.save();

        console.log("Custom order saved to MongoDB:", customOrder);

        res.json({
            success: true,
            message: "Custom order request received successfully!"
        });

    } catch (error) {
        console.error("Error saving custom order:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save custom order."
        });
    }
});

let mongoConnectionPromise;

function connectToDatabase() {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve();
    }

    if (!mongoConnectionPromise) {
        mongoConnectionPromise = mongoose.connect(process.env.MONGODB_URI)
            .catch((error) => {
                mongoConnectionPromise = null;
                throw error;
            });
    }

    return mongoConnectionPromise;
}

module.exports = { app, connectToDatabase };

if (require.main === module) {
    connectToDatabase()
        .then(() => {
            console.log("MongoDB connected successfully");
            app.listen(PORT, () => {
                console.log("Server running at http://localhost:" + PORT);
            });
        })
        .catch((error) => {
            console.error("MongoDB connection error:", error);
            process.exitCode = 1;
        });
}
