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

export const updateSettings = async (data, type, apiUrl) => {
    try {
        const url = type === 'password'
            ? `${apiUrl}/api/v1/user/updatePassword`
            : `${apiUrl}/api/v1/user/updateMe`

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
        }
        if (type === 'photo') {
            return res.data.data.user.photo;
        }
    } catch (error) {
        showAlert('err', error.response.data.message);

    }
}