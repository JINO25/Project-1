/* eslint-disable */
import { login, signup, logout } from './login.js'
import { updateSettings } from './updateAccount.js';
import { reviewAndRating } from './review.js';
import { cancelBookingTour } from './cancelTour.js';

// Assuming this code is running in a browser environment
const currentUrl = window.location.href;
// Extract the origin (protocol + hostname) from the current URL
const currentOrigin = new URL(currentUrl).origin;
// Combine the origin and API path to get the full API URL
const apiUrl = `${currentOrigin}`;

if (document.getElementById("sort")) {

    document.getElementById("sort").addEventListener("change", function () {
        const sortValue = this.value;
        const url = new URL(window.location.href);

        url.searchParams.set("sort", sortValue);

        window.location.href = url.toString();

    });

}
const formLogin = document.querySelector('.login-form');
const formSignUp = document.querySelector('.register-form');
const formForgotPwd = document.querySelector('.forgot-password-page');
const resetPassword = document.querySelector('.reset-password-page');

if (formLogin || formSignUp) {
    document.addEventListener('DOMContentLoaded', function () {
        const messages = document.querySelectorAll('.message a');
        const registerForm = document.querySelector('.register-form');
        const loginForm = document.querySelector('.login-form');

        messages.forEach(function (message) {
            message.addEventListener('click', function (event) {
                event.preventDefault();
                //toggle will transform between tokens in the list
                registerForm.classList.toggle('hidden');
                loginForm.classList.toggle('hidden');
            });
        });
    });
}

if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email1').value;
        const password = document.getElementById('password1').value;
        login(email, password, apiUrl);
    });
}


if (formSignUp) {
    formSignUp.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const pwd = document.getElementById('password').value;
        const pwdCf = document.getElementById('passwordConfirm').value;

        signup(name, email, pwd, pwdCf, apiUrl);
    })
}

if (formForgotPwd) {
    document.getElementById('sendButton').addEventListener('click', async () => {
        const email = document.getElementById('emailForgot').value;
        if (email) {
            await axios({
                method: 'POST',
                url: `${apiUrl}/api/v1/user/forgotPassword`,
                data: {
                    email
                }
            });
            alert(`A password reset link has been sent to ${email}`);
        } else {
            alert('Please enter a valid email address.');
        }
    });
}

if (resetPassword) {
    document.getElementById('resetButton').addEventListener('click', async () => {
        const token = currentUrl.substring(currentUrl.lastIndexOf('/') + 1, currentUrl.length);
        const password = document.getElementById('newPassword').value;
        const passwordConfirm = document.getElementById('confirmPassword').value;

        if (password && passwordConfirm) {
            if (password === passwordConfirm) {
                await axios({
                    method: 'PATCH',
                    url: `${apiUrl}/api/v1/user/resetPassword/${token}`,
                    data: {
                        password,
                        passwordConfirm
                    }
                });
                alert('Your password has been successfully reset!');
            } else {
                alert('Passwords do not match. Please try again.');
            }
        } else {
            alert('Please fill out both fields.');
        }
    });
}

const logoutBtn = document.querySelector('.user_board-item.item-logout');

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}


const setting = document.querySelector('.setting');
const booking = document.querySelector('.booking');
const billing = document.querySelector('.billing');

if (setting || booking || billing) {

    const viewContentSetting = document.querySelector('.user-view__content.setting');
    const viewContentBooking = document.querySelector('.user-view__content.booking');

    setting.addEventListener('click', () => {
        viewContentBooking.classList.add('inactive');
        viewContentSetting.classList.remove('inactive');
    })

    booking.addEventListener('click', () => {
        viewContentSetting.classList.add('inactive');
        viewContentBooking.classList.remove('inactive');
    })
}

//changes user's password or user's information
const userPasswordForm = document.querySelector('.form-user-password');

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password', apiUrl);
        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}

// get the changes of user's data
const userDataForm = document.querySelector('.form-user-data');

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        const email = document.getElementById('email_google');

        if (email) {
            form.append('name', document.getElementById('name').value);
            form.append('phone', document.getElementById('phone').value);
        } else {
            form.append('name', document.getElementById('name').value);
            form.append('phone', document.getElementById('phone').value);
            form.append('photo', document.getElementById('photo').files[0]);
        }

        updateSettings(form, 'data', apiUrl);
    });
}
//review of users
const reviewForm = document.querySelector('.user-review .star-rating')

if (reviewForm) {
    //get stars from users
    const ratingStars = [...document.querySelectorAll('.rating__star')];
    let stars = 0;
    ratingStars.forEach((star) => {
        star.addEventListener('click', () => {
            stars = ratingStars.indexOf(star) + 1;
        });
    });
    if (stars == 0) stars++;

    //get review from users
    reviewForm.addEventListener('submit', async e => {
        e.preventDefault();
        const user = reviewForm.dataset.user;
        const tour = reviewForm.dataset.tour;
        const review = document.querySelector('.form-review').value;
        await reviewAndRating(user, tour, review, stars, apiUrl);
    });
}

const form = document.getElementById('searchForm');

if (form) {

    document.addEventListener('DOMContentLoaded', function () {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const minRangeInput = document.getElementById('minRange');
        const maxRangeInput = document.getElementById('maxRange');
        const destinationInput = document.getElementById('destination');
        const checkInDateInput = document.getElementById('date');
        const btn = document.querySelector('.btn');

        minPriceInput.addEventListener('input', function () {
            minRangeInput.value = this.value;
        });

        maxPriceInput.addEventListener('input', function () {
            maxRangeInput.value = this.value;
        });

        minRangeInput.addEventListener('input', function () {
            minPriceInput.value = this.value;
        });

        maxRangeInput.addEventListener('input', function () {
            maxPriceInput.value = this.value;
        });

        btn.addEventListener('click', function (e) {
            e.preventDefault();

            const destination = destinationInput.value;
            const checkInDate = checkInDateInput.value;
            const date = new Date(checkInDate).toLocaleDateString('en-GB');
            const minPrice = minPriceInput.value;
            const maxPrice = maxPriceInput.value;

            console.log({
                destination,
                date,
                minPrice,
                maxPrice,
            });

            const baseUrl = window.location.origin;
            const newUrl = `${baseUrl}/search?destination=${encodeURIComponent(destination)}&dateFrom=${checkInDate}&minPrice=${minPrice}&maxPrice=${maxPrice}`;

            location.replace(newUrl);
        });
    });
}

const bookingOfUser = document.querySelector('.user-view__content.booking');
if (bookingOfUser) {
    const btn = [...document.querySelectorAll('.btn-cancelTour')];
    btn.forEach((el) => {
        el.addEventListener('click', async (e) => {
            if (confirm('Bạn muốn huỷ tour!') == true) {
                try {
                    const rs = await cancelBookingTour(apiUrl, e.target.dataset.id);

                    if (rs.data.status === 'success') {
                        location.reload();
                    } else if (rs.data.status === 'fail') {
                        alert('Huỷ tour chỉ áp dụng trước khi tour bắt đầu 4 ngày. Mong quý khách thông cảm😥');
                    }
                } catch (error) {
                    alert('Đã có lỗi xảy ra khi huỷ tour. Vui lòng thử lại sau.');
                }
            }
        })
    })
}

//get the change of user's profile(photo)
if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
        const form = new FormData();
        form.append('photo', document.getElementById('photo').files[0]);
        if (newImage) {
            document
                .querySelector('.nav__user img')
                .setAttribute('src', `/img/users/${newImage}`);
            document
                .querySelector('.form__user-photo')
                .setAttribute('src', `/img/users/${newImage}`);
        }
    });
}

