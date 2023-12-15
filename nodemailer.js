const nodemailer = require("nodemailer");
const { MAIL } = require('./config');

const mailService = {
  config: (index) => {
    const types = [
      {
        service: 'gmail',
        auth: {
          user: MAIL.USER,
          pass: MAIL.PASSWORD,
        }
      }
    ];
    return types[index];
  },

  sendMail: async (transporterConfig, mailConfig) => {
    console.log('info', 'Mail initialize');

    const transporter = nodemailer.createTransport(transporterConfig);
    console.log('info', 'Mail transporter connected');

    const info = await transporter.sendMail(mailConfig);
    console.log('info', 'Message sent successfully!', { info: nodemailer.getTestMessageUrl(info) });
  }
};

module.exports = mailService;
