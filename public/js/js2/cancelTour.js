/* eslint-disable */
export const cancelBookingTour = async (apiUrl, id) => {
    try {
        const rs = await axios.delete(`${apiUrl}/cancelTour?bookingId=${id}`);

        return rs;
    } catch (error) {
        return error.response;
    }
}