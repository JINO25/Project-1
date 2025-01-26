/* eslint-disable */
import { bookTour } from './stripe.js';

const buttons = document.querySelectorAll('.collapse-checkbox .collapse-checkbox--content');
const checkboxes = document.querySelectorAll('.collapse-checkbox input[type="checkbox"]');

// Assuming this code is running in a browser environment
const currentUrl = window.location.href;
// Extract the origin (protocol + hostname) from the current URL
const currentOrigin = new URL(currentUrl).origin;
// Combine the origin and API path to get the full API URL
const apiUrl = `${currentOrigin}`;

function toggleCollapse(clickedCheckbox) {
    checkboxes.forEach((checkbox) => {
        // The closest() method starts at the element itself, then the anchestors(parent, grandparent, ...) until a match is found.
        const collapsible = checkbox.closest('.collapse-checkbox').querySelector('.collapsible');

        if (checkbox !== clickedCheckbox) {
            checkbox.checked = false;
            collapsible.classList.add('inactive');
        }
    });

    const currentCollapsible = clickedCheckbox.closest('.collapse-checkbox').querySelector('.collapsible');

    (clickedCheckbox.checked) ? currentCollapsible.classList.remove('inactive') : currentCollapsible.classList.add('inactive');
}

checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
        toggleCollapse(event.target);
    });
});



buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const check = btn.querySelector('input[type="checkbox"]');
        check.checked = true;
        toggleCollapse(check);
    });
});


function createDiv(name, amount, numericPrice) {
    switch (name) {
        case 'youngChildren':
            name = 'Trẻ nhỏ';
            numericPrice = 0;
            break;
        case 'children':
            name = 'Trẻ em';
            break;
        case 'infants':
            name = 'Em bé';
            numericPrice = 0;
            break;
        default:
            break;
    }

    return `
                <div class="left">${name}</div>
                <div class="right">
                    <div class="amount">${amount}</div>
                    <div class="price">X ${numericPrice.toLocaleString()} đ</div>
                </div>
            `;
}

function totalPrice(input) {
    let total = 0;
    input.forEach(e => {
        if (e.id != 'youngChildren' && e.id != 'infants') {
            total += parseInt(e.value);
        }
    })
    return total;
}

const dateButtons = document.querySelectorAll('.date-option');
const selectedDateInput = document.getElementById('selectedDate');
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.querySelector('.contact__user-information .name');
    const emailInput = document.querySelector('.contact__user-information .email');
    const phoneInput = document.querySelector('.contact__user-information .phone');
    const bookButton = document.querySelector('.btn-book');
    const contact = document.querySelector('.contact__user-information');


    let check = false;
    let checkDate = false;

    // Function to check if all required fields are filled
    function checkFormInputs() {
        if (!contact.classList.contains('logged-in')) {
            if (nameInput.value.trim() !== '' && emailInput.value.trim() !== '' && phoneInput.value.trim() !== '' && check === true && checkDate === true) {
                // Enable the button and change text
                bookButton.classList.remove('disabled');
                bookButton.removeAttribute('disabled');
                bookButton.textContent = 'Đặt ngay';
            } else {
                // Disable the button and reset text
                bookButton.classList.add('disabled');
                bookButton.setAttribute('disabled', true);
                bookButton.textContent = 'Nhập thông tin để đặt tour';
            }
        } else {
            if (check === true && checkDate === true) {
                // Enable the button and change text
                bookButton.classList.remove('disabled');
                bookButton.removeAttribute('disabled');
                bookButton.textContent = 'Đặt ngay';
            } else {
                // Disable the button and reset text
                bookButton.classList.add('disabled');
                bookButton.setAttribute('disabled', true);
                bookButton.textContent = 'Nhập thông tin để đặt tour';
            }
        }
    }

    if (!contact.classList.contains('logged-in')) {

        nameInput.addEventListener('input', checkFormInputs);
        emailInput.addEventListener('input', checkFormInputs);
        phoneInput.addEventListener('input', checkFormInputs);

    }

    checkFormInputs();

    buttons.forEach(e => {
        e.addEventListener('click', () => {
            check = true;
            checkFormInputs();
        })
    });

    checkboxes.forEach(e => {
        e.addEventListener('change', () => {
            check = true;
            checkFormInputs();
        })
    });

    dateButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Xóa selected class từ tất cả các nút
            dateButtons.forEach(btn => btn.classList.remove('selected'));

            // Thêm selected class vào nút được chọn
            this.classList.add('selected');

            // Cập nhật giá trị cho input hidden
            selectedDateInput.value = this.dataset.date;
            checkDate = true
            checkFormInputs();
        });
    });

});


function checkQuantity(input) {
    let total = 0;
    input.forEach(e => {
        total += parseInt(e.value);
    })

    if (total >= remainingQuantity)
        return false;
    return true;
}

const renderToast = () => {
    const toast = document.querySelector('.toast');
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

const remainingQuantity = document.querySelector('.number_quantity').textContent.trim();
// Update the quantity and price when the buttons are clicked
document.querySelectorAll('.quantity-button').forEach(button => {
    button.addEventListener('click', async function () {
        const inputField = this.closest('.quantity').querySelector('input');
        let currentValue = parseInt(inputField.value);
        const unitPrice = document.querySelector('.card__body--header .price').textContent;
        // Remove non - numeric characters(except for digits) using a regular expression
        const numericPrice = parseInt(unitPrice.replace(/[,.đ\s]/g, ''), 10);

        if (this.classList.contains('quantity-remove')) {
            if (currentValue > inputField.min) {
                inputField.value = currentValue - 1;
            }
        }

        else if (this.classList.contains('quantity-add') && inputField.value < remainingQuantity) {
            let check = checkQuantity(document.querySelectorAll('.page-order-booking__body--left .quantity input'))

            if (!check) {
                renderToast();
            } else {
                inputField.value = currentValue + 1;
            }
        }

        let newQuantity = parseInt(inputField.value);
        //render div element
        let div = document.querySelector('.page-order-booking__body--right .card .card__body');
        let newDiv = document.querySelector(`.row.${inputField.id}`);

        if (!newDiv) {
            newQuantity = parseInt(inputField.value)
            newDiv = document.createElement('div');
            newDiv.className = `row ${inputField.id}`;
            newDiv.innerHTML = createDiv(inputField.id, newQuantity, numericPrice);
            div.appendChild(newDiv);
        } else {
            // newQuantity = parseInt(inputField.value);
            let amountElement = newDiv.querySelector('.amount');
            amountElement.textContent = newQuantity;
        }

        // removes the div which has the value =0
        if (inputField.value == 0) {
            div.removeChild(newDiv);
        }


        const total = document.querySelector('.page-order-booking__body--right .card__footer .row .right');
        let totalQuantity = await totalPrice(document.querySelectorAll('.page-order-booking__body--left .quantity input'));

        let price = numericPrice * totalQuantity;
        // format number with commas

        total.textContent = `${price.toLocaleString()} đ`;
    });
});

// just get the user information when user not login
const getUserInformation = () => {
    let user;
    const contact = document.querySelector('.contact__user-information');
    if (!contact.classList.contains('logged-in')) {
        const name = contact.querySelector('.name').value;
        const email = contact.querySelector('.email').value;
        const phone = contact.querySelector('.phone').value;
        const address = contact.querySelector('.address').value;
        return user = { name, email, phone, address };
    }
}

const getPaymentMethod = () => {
    let method = null;
    buttons.forEach(e => {
        if (e.classList.contains('active')) {
            method = e.querySelector('p').textContent;
        }
    });

    checkboxes.forEach(e => {
        if (e.checked) {
            method = e.closest('.collapse-checkbox--content').querySelector('.collapse-checkbox--content__title p').textContent;
        }
    });

    return method;
}

const bookingTour = document.querySelector('.btn-book');
bookingTour.addEventListener('click', async e => {
    e.preventDefault();
    let totalQuantity = await totalPrice(document.querySelectorAll('.page-order-booking__body--left .quantity input'));
    let methodPayment = getPaymentMethod();
    console.log(selectedDateInput.value)

    e.target.textContent = 'Đang xử lý...';
    const tourId = bookingTour.dataset.id;
    bookTour(getUserInformation(), totalQuantity, tourId, methodPayment, selectedDateInput.value, apiUrl);
});

