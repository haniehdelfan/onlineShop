"use strict";
import { productsData } from "./products.js";

const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");

const productsDOM = document.querySelector(".products-center");
const clearCart = document.querySelector(".cart-item-clear");

let cart = [];
let buttonsDOM = [];
// get products
class Products {
  getProducts() {
    return productsData;
  }
}

// dispaly products :
class UI {
  displayProducts(products) {
    //لود کردن products.js دیتاهای
    let result = "";
    products.forEach((item) => {
      result += `<section class="product"> 
                     <div class="img-container">
                        <img class="product-img" src="${item.imageUrl}">
                    </div>
                    <div class="product-desc">
                        <p class="product-title"> ${item.title}</p>
                        <p class="product-price"> ${item.price}</p>
                    </div>
                    <button class="btn add-to-cart" data-id=${item.id}>
                    Add to cart</button>
                </section> `;
      productsDOM.innerHTML = result;
    });
  }
  getAddToCartBtns() {
    const addToCartBtn = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtn;
    // console.log(addToCartBtn);         (its gives us a node list)
    //converting node list to array:
    addToCartBtn.forEach((btn) => {
      //ایدی محصولاتی که توی سبد هستن رو نشون میده که به جای باتن سبد خرید موجود در سبد باشه
      const id = btn.dataset.id;
      // console.log(id);
      //check if is this product is in cart
      const isInCart = cart.find((p) => p.id === parseInt(id)); //product id ke migiri bebin ba kodom yeki az in id ha yekie
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        // console.log(event.target.dataset.id);
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //<get products from product:>
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        //add to cart :
        cart = [...cart, addedProduct];
        //save cart:
        Storage.saveCart(cart); //inja cart dare update mishe
        //update cart value
        this.setCartValue(cart);
        //add to cart item(sabad kharid)
        this.addCartItem(addedProduct); //boro chizi ke user dade ro toye DOM set kon
      });
    });
  }
  setCartValue(cart) {
    //1. cart items
    //2.cart total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity; //2+1=3
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `totalPrice : ${totalPrice} $`;
    cartItems.innerText = tempCartItems;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `                
    <img class="cart-item-img" src="${cartItem.imageUrl}"/>
    <div class="cart-item-desc">
      <h4>${cartItem.title}</h4>
      <h5>$ ${cartItem.price}</h5>
    </div>
    <div class="cart-item-controller">
       <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
         <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
     </div>
     <i class="fa-solid fa-trash-can" data-id=${cartItem.id}></i>`;
    cartContent.appendChild(div);
  }
  setUpApp() {
    //get cart from storage:
    cart = Storage.getCart() || [];
    //addCartItem and shows it in Modal:
    cart.forEach((cartItem) => {
      this.addCartItem(cartItem);
    });
    //setValues : price + item
    this.setCartValue(cart);
  }
  cartLogic() {
    //clear cart :
    clearCart.addEventListener("click", () => this.clearCart());
    //cart fanctionality
    cartContent.addEventListener("click", (event) => {
      // console.log(event.target);
      if (event.target.classList.contains("fa-chevron-up")) {
        console.log(event.target.dataset.id);
        const addQuantity = event.target;
        //get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        //update cart value
        this.setCartValue(cart);
        //save item
        Storage.saveCart(cart);
        //update cart item in UI
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
        //TRASH BUTTON
      } else if (event.target.classList.contains("fa-trash-can")) {
        const removeItem = event.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
        //DOWN BUTTON
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const substractedItem = cart.find((c) => c.id == subQuantity.dataset.id);
        //vaqti be yek resid meqdar manfi nashe va tage pedarbozorg del beshe
        if(substractedItem.quantity === 1){
          this.removeItem(substractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        substractedItem.quantity--;
        this.setCartValue(cart);
        //save item
        Storage.saveCart(cart);
        //update cart item in UI
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
  }
  clearCart() {
    //remove:
    cart.forEach((cItem) => this.removeItem(cItem.id));
    //remove cart content for children:
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    //while we're clearing the cart, close the modal!
    closeModalFunction();
  }
  removeItem(id) {
    //update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    // update total price and cart item:
    this.setCartValue(cart);
    //update storage:
    Storage.saveCart(cart);
    //get add to cart btns : "update text and disablity"
    this.getSingleButton(id);
  }
  getSingleButton(id) {
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "Add to cart";
    button.disabled = false;
  }
}

//storage
class Storage {
  static saveProducts(products) {
    //cuz of static we don need to new the class
    localStorage.setItem("products", JSON.stringify(products));
    //برو توی لوکال استوریج مرورگر و ست کن یک دیتا رو به نام پروداکتس --(ما نمیتونیم اری اف ابجکت رو توی اسنوریج ذخیره کنیم فقط استرینگ)
  }

  // یه دونه پروداکت رو از بین پروداکت ها میگیره و توی لوکال استوریج
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id)); //boro id ke behet dadamo add kon
  }

  //inja cart bere save beshe
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}
//موقعی که دام داره لود میشه اپ رو اجرا کن
document.addEventListener("DOMContentLoaded", () => {
  // console.log(loaded);
  const products = new Products(); //دیتاها رو از کلس پرودکتس میگیرم
  const productsData = products.getProducts(); //ریترن میکنه
  // console.log(productsData);
  //set up : get cart and set up
  const ui = new UI();
  ui.setUpApp();
  ui.displayProducts(productsData); //دیتا ها رو پاس میدم به دیس پلی
  Storage.saveProducts(productsData);
  ui.getAddToCartBtns();
  ui.cartLogic();
});

//cart items modal
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);

// nav bar
const navSide = document.querySelector(".fa-solid fa-bars");
navSide.addEventListener("click",)
