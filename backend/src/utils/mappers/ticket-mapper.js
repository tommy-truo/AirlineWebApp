// Written by Tommy Truong

export const mapTicket = (data) => {
    if (!data) return null;

    return {
        bookingID: data.booking_id ?? data.bookingID,
        passengerID: data.passenger_id ?? data.passengerID,
        flightInstanceID: data.flight_instance_id ?? data.flightInstanceID,
        seatID: data.seat_id ?? data.seatID,
        boardingGroupID: data.boarding_group_id ?? data.boardingGroupID,

        ticketPrice: data.ticket_price ?? data.ticketPrice,
        checkedIn: data.checked_in ?? data.checkedIn ?? false
    };
};