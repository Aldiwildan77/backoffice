const templateWelcoming = (request) => {
  const seatNumber = request.seat_table || '-';
  return `<h3>Dear ${request.name},</h3>

<p>A warm welcome to you! We trust this email finds you in great spirits as we eagerly anticipate the "MS GLOW SPEK7A INDRALOKA - The 7th Anniversary" event. Your enthusiasm for being a part of this milestone celebration has not gone unnoticed, and we are delighted to have you with us.</p>
<p>We are thrilled to inform you that your check-in for the event has been completed. Your commitment adds an extra layer of excitement to our anniversary celebration.</p>
<p>Your presence is invaluable to us, and we want to ensure that your experience is nothing short of fantastic. To enhance your event participation, we have carefully assigned seating and your designated seat will offer you a prime view of all the activities planned for the day.</p>

<h3>Your Assigned Seat,</h3>
<h3>Seat Number: </h3>

<h1>${seatNumber}</h1>

<div style="margin-bottom: 32px">
  <p>We appreciate your involvement and enthusiasm in making this celebration memorable.</p>
  <p>If you have any questions or if there's anything we can assist you with, please don't hesitate to contact our dedicated event support team at [Event Support Email/WA].</p>
  <p>Once again, thank you for being a part of MS Glow's 7th-anniversary celebration. Hope you enjoy and can't wait to create wonderful memories together with you!</p>
</div>

<p>Best Regards,</p>
<p><strong>MS Glow</strong></p>`;
};

module.exports = { templateWelcoming };;
