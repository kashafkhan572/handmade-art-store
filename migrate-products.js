require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/product");
const products = require("./data/products.json");

async function migrateProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        for (const product of products) {
            await Product.updateOne(
                { id: product.id },
                {
                    $set: {
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        image: product.image
                    }
                },
                { upsert: true }
            );
        }

        console.log("Products migrated successfully.");

        await mongoose.disconnect();

    } catch (error) {
        console.error("Migration error:", error);
    }
}

migrateProducts();