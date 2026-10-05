const addToCartBtn = document.getElementById("addToCartBtn");

if (addToCartBtn) {

    addToCartBtn.addEventListener("click", () => {

        const product = {
            id: parseInt(addToCartBtn.dataset.id),
            name: addToCartBtn.dataset.name,
            price: parseInt(addToCartBtn.dataset.price),
            image: addToCartBtn.dataset.image,
            category: ""
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            product.quantity = 1;
            cart.push(product);

        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert("Product added to cart!");

    });

}