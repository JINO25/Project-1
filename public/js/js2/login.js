/* eslint-disable */
// import axios from '/axios'
const abler = document.querySelector('.abler');
const ablerText = document.querySelector('.abler-text');

const alert = (status, message) => {
    if (status == 'success') {
        abler.style.backgroundColor = "green";
        abler.style.display = "block";
        ablerText.innerHTML = message;
    } else {
        abler.style.display = "block";
        ablerText.innerHTML = message;
    }
}

export const login = async (email, password, apiUrl) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${apiUrl}/api/v1/user/login`,
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {
            alert('success', 'Logged in successfully!');
            const lastPage = localStorage.getItem('lastPage');
            if (lastPage) {
                location.assign(lastPage); // Redirect to last visited page
                localStorage.removeItem('lastPage'); // Remove from storage after use
            } else {
                location.assign('/'); // Default to home page
            }
        }
    } catch (error) {
        if (error.response.status == 401) {
            alert('err', "Invalid email or password!");
        } else if (error.response.status == 400) {
            alert('err', 'Please provide email and password');
        } else {
            alert('err', 'An error occurred! Please try again!');
        }

    }
}

export const signup = async (name, email, password, passwordConfirm, apiUrl) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${apiUrl}/api/v1/user/signup`,
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        if (res.data.status === 'success') {
            alert('success', 'Sign up successfully!');
            window.setTimeout(() => {
                location.reload(true);
            }, 1500);
        }
    } catch (error) {
        alert('err', error.response.data.message);
    }
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: `/api/v1/user/logout`
        });

        if (res.data.status = 'success') {
            location.reload(true);
        }


    } catch (error) {
        console.log(error, 'Error logging out! Please try again.');
    }
}