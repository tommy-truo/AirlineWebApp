import cron from "node-cron";
import * as BookingModel from "../models/booking-model.js";

const startExpireJob = () => {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    console.log(`[${new Date()}] Checking for expired bookings...`);

    try {
      // Fetch the bookings
      const bookingsToExpire = await BookingModel.getBookingsToExpire();

      if (bookingsToExpire.length === 0) {
        console.log("No bookings found to expire.");
        return;
      }

      console.log(`Found ${bookingsToExpire.length} bookings to expire.`);

      // Map through the IDs and update them
      await Promise.all(
        bookingsToExpire.map((booking) => 
          BookingModel.expireBooking(booking.booking_id)
            .then(() => console.log(`Expired Booking ID: ${booking.booking_id}`))
            .catch((err) => console.error(`Failed to expire ID ${booking.booking_id}:`, err))
        )
      );

      console.log("Expiration task completed successfully.");
    } catch (error) {
      console.error("Error in startExpireJob:", error);
    }
  });
};

export default startExpireJob;