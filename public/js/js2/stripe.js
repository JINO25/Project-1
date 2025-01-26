/* eslint-disable */
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

export const bookTour = async (guestUserData, quantity, tourId, methodPayment, date, apiUrl) => {

    if (methodPayment === 'Tiền mặt') {
        if (guestUserData) {
            const guestUser = {
                guestName: guestUserData.name,
                guestEmail: guestUserData.email,
                guestPhone: guestUserData.phone,
                guestAddress: guestUserData.address,
                quantity: quantity,
                methodPayment,
                date
            };
            let rs = await axios.post(`${apiUrl}/api/v1/booking/create-checkout-cash-guest/?tourId=${tourId}&data=${encodeURIComponent(JSON.stringify(guestUser))}`);

            if (rs.data.status == 'success') {
                // console.log('success')
                window.location.assign('/success/cash')
            }
        } else {
            let rs = await axios.post(`${apiUrl}/api/v1/booking/create-checkout-cash/?tourId=${tourId}&quantity=${quantity}&date=${date}`);

            if (rs.data.status == 'success') {
                window.location.assign('/success/cash')
            }
        }
    } else {
        const stripe = Stripe('pk_test_oKhSR5nslBRnBZpjO6KuzZeX');
        try {
            if (guestUserData) {
                const guestUser = {
                    tourId: tourId,
                    guestName: guestUserData.name,
                    guestEmail: guestUserData.email,
                    guestPhone: guestUserData.phone,
                    guestAddress: guestUserData.address,
                    quantity: quantity,
                    methodPayment,
                    date
                }
                const session = await axios.post(`${apiUrl}/api/v1/booking/create-checkout-session-guest`, guestUser);

                await stripe.redirectToCheckout({
                    sessionId: session.data.session.id
                });
            } else {
                const session = await axios.post(
                    `${apiUrl}/api/v1/booking/create-checkout-session/${tourId}`, { quantity, date }
                );

                await stripe.redirectToCheckout({
                    sessionId: session.data.session.id
                });
            }
        } catch (err) {
            showAlert(err.message);
        }
    }

};


