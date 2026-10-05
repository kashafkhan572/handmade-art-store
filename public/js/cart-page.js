const cartItemsContainer = document.getElementById("cartItems");
const cartTotalElement = document.getElementById("cartTotal");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCart() {

    cartItemsContainer.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <div class="text-center py-5">
                <h4>Your cart is empty</h4>
                <p class="text-muted">
                    Add some handmade creations to your cart.
                </p>
            </div>
        `;

        cartTotalElement.textContent = "0";
        return;
    }

    cart.forEach((product, index) => {

        const quantity = product.quantity || 1;

        total += product.price * quantity;

        cartItemsContainer.innerHTML += `
            <div class="card mb-3">
                <div class="row g-0 align-items-center">

               <div class="col-12 col-md-2 text-center">
                        <img
                            src="${product.image}"
                            class="img-fluid rounded-start"
                            alt="${product.name}">
                    </div>

                    <div class="col-md-5">
                        <div class="card-body">
                            <h5 class="card-title">
                                ${product.name}
                            </h5>

                            <p class="text-muted">
                                ${product.category || "Handmade Product"}
                            </p>

                            <strong>
                                Rs. ${product.price}
                            </strong>
                        </div>
                    </div>

                 <div class="col-12 col-md-3 text-center mb-3 mb-md-0">

                        <button
                            class="btn btn-outline-dark btn-sm"
                            onclick="decreaseQuantity(${index})">
                            −
                        </button>

                        <span class="mx-3">
                            ${quantity}
                        </span>

                        <button
                            class="btn btn-outline-dark btn-sm"
                            onclick="increaseQuantity(${index})">
                            +
                        </button>

                    </div>

                    <div class="col-md-2 text-center">

                        <button
                            class="btn btn-sm btn-outline-danger"
                            onclick="removeFromCart(${index})">
                            Remove
                        </button>

                    </div>

                </div>
            </div>
        `;
    });

    cartTotalElement.textContent = total;
}


function increaseQuantity(index) {

    cart[index].quantity = (cart[index].quantity || 1) + 1;

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


function decreaseQuantity(index) {

    cart[index].quantity = (cart[index].quantity || 1) - 1;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


function removeFromCart(index) {

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


displayCart();