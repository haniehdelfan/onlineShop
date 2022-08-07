"use strict";
import { productsData } from "./products.js";


// const cartBtn = document.querySelector(".cart-btn");
// const cartModal = document.querySelector(".cart");
// const backDrop = document.querySelector(".backdrop");
// const closeModal = document.querySelector(".cart-item-confirm");

const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
// const cartContent = document.querySelector(".cart-content");

const productsDOM = document.querySelector(".products-center");

let cart = [];
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
    const addToCartBtn = document.querySelectorAll(".add-to-cart");
    // console.log(addToCartBtn);         (its gives us a node list)
    //converting node list to array:
    const Buttons = [...addToCartBtn];
    // console.log(Buttons);
    Buttons.forEach((btn) => {
      //ایدی محصولاتی که توی سبد هستن رو نشون میده که به جای باتن سبد خرید موجود در سبد باشه
      const id = btn.dataset.id;
      // console.log(id);
      //check if is this product is in cart
      const isInCart = cart.find((p) => p.id === id); //product id ke migiri bebin ba kodom yeki az in id ha yekie
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        // console.log(event.target.dataset.id);
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //<get products from product:>
        const addedProduct = Storage.getProduct(id);
        //add to cart :
        cart = [...cart, { ...addedProduct, quantity: 1 }];
        //save cart:
        Storage.saveCart(cart); //inja cart dare update mishe
        //update cart value
        this.setCartValue(cart);
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
    cartTotal.innerText = `totalPrice : ${totalPrice.toFixed(2)} $`;
    cartItems.innerText = tempCartItems;
  }
}

//storage
class Storage {
  static saveProducts(products) {
    //cuz of static we don need to new the class
    localStorage.setItem("products", JSON.stringify(products));
    //برو توی لوکال استوریج مرورگر و ست کن یک دیتا رو به نام پروداکتس --(ما نمیتونیم اری اف ابجکت رو توی اسنوریج ذخیره کنیم فقط استرینگ)
  }
  /// یه دونه پروداکت رو از بین پروداکت ها میگیره و توی لوکال استوریج
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => {
      p.id === parseInt(id);
    }); //boro id ke behet dadamo add kon
  }

  static saveCart(
    cart //inja cart bere save beshe
  ) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  //موقعی که دام داره لود میشه اپ رو اجرا کن
  // console.log("loaded");
  const products = new Products(); //دیتاها رو از کلس پرودکتس میگیرم
  const productsData = products.getProducts(); //ریترن میکنه
  // console.log(productsData);
  const ui = new UI();
  ui.displayProducts(productsData); //دیتا ها رو پاس میدم به دیس پلی
  Storage.saveProducts(productsData);
  ui.getAddToCartBtns();
});

//cart items modal
// function showModalFunction() {
//   backDrop.style.display = "block";
//   cartModal.style.opacity = "1";
//   cartModal.style.top = "20%";
// }

// function closeModalFunction() {
//   backDrop.style.display = "none";
//   cartModal.style.opacity = "0";
//   cartModal.style.top = "-100%";
// }

// cartBtn.addEventListener("click", showModalFunction);
// closeModal.addEventListener("click", closeModalFunction);
// backDrop.addEventListener("click", closeModalFunction);
