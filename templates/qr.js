const templateQRRegistration = (request) => {
  return `<h3>Dear ${request.name},</h3>

<p>Congratulations! We are delighted to inform you that your registration for the "MS GLOW SPEK7A INDRALOKA" - The MS Glow's 7th Anniversary" event has been successfully completed.</p>

<h4>Event Details:</h4>

<div>
  <p>Event Name: MS GLOW SPEK7A INDRALOKA</p>
  <p>Date: 21 Desember 2023</p>
  <p>Time: 16:00 WIB</p>
  <p>Venue: Hotel Mulia Senayan Jakarta</p>
</div>

<p>Your commitment to joining us for this special occasion means a lot, and we are thrilled to have you as part of our celebration. Get ready for an enlightening experience filled with insightful discussions, exciting activities, and the chance to connect with fellow enthusiasts.</p>

<h4>QR Code for Check-In:</h4>
<p>Attached to this email, you will find a QR code specific to your registration. Please save this QR code on your mobile device or print a copy to expedite the check-in process on the day of the event.</p>

<p>Here is your QR</p>

<img src="${request.qr_link}" />

<div style="margin-bottom: 32px">
  <p>If you have any questions or require further assistance, please don't hesitate to reach out to our dedicated event support team at [Event Support Email/WA].</p>
  <p>Once again, thank you for being part of MS Glow's 7th-anniversary celebration. We look forward to seeing you at the event!</p>
</div>

<p>Best Regards,</p>
<p><strong>MS Glow</strong></p>
`;
};

module.exports = { templateQRRegistration };
