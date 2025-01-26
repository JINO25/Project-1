/* eslint-disable */

const buttons = document.querySelectorAll('.collapsible');

buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const inner = btn.parentElement.querySelector('.inner');
        if (inner) {
            inner.classList.toggle('inactive');
        }
    });
});


const ratingStars = [...document.getElementsByClassName("rating__star")];

function executeRating(stars) {
    const starClassActive = "rating__star fa fa-star checked";
    const starClassInactive = "rating__star fa fa-star";
    const starsLength = stars.length;
    let i;
    stars.map((star) => {
        star.onclick = () => {
            i = stars.indexOf(star);

            if (star.className === starClassInactive) {
                for (i; i >= 0; --i) stars[i].className = starClassActive;
            } else {
                for (i; i < starsLength; ++i) stars[i].className = starClassInactive;
            }
        };
    });
}
executeRating(ratingStars);


document.addEventListener('DOMContentLoaded', function () {
    const quantityElement = document.querySelector('.box-order .time .quantity b');

    if (!quantityElement) return;

    const tourQuantity = quantityElement.textContent.trim();

    if (tourQuantity === 0) {
        const addToCartLink = document.querySelector('.add-to-cart');

        if (addToCartLink) {
            addToCartLink.classList.add('disabled-link');
            addToCartLink.innerHTML = '<i class="fa-solid fa-cart-shopping"></i>Hết chỗ';
            addToCartLink.setAttribute('href', 'javascript:void(0)');
        }
    }
});


