/* eslint-disable */
export const reviewAndRating = async (user, tour, review, rating, apiUrl) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `${apiUrl}/api/v1/review`,
            data: {
                user,
                tour,
                review,
                rating
            }
        });

        if (res.data.status == 'success') {
            window.setTimeout(() => {
                location.reload();
            }, 1000)
        }
    } catch (error) {
        console.log(error);
    }
}