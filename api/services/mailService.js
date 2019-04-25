import * as nodemailer from 'nodemailer';
import config from '../../config';
const mg = require('nodemailer-mailgun-transport');
const transporter = nodemailer.createTransport(config.service.nodemailer);

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.service.sendgrid.apiKey);

const mailService = mailOptions => {
  return new Promise((resolve, reject) => {
    sgMail.send(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

export {mailService};
