import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';

import { config } from '../config';

export const getDiffBetweenTwoDatesInMinutes = (
    startDate: string,
    endDate: string,
  ) => {
    try {
      const millisecondsToMinute = 60000; // 1000 * 60
  
      const startTimeInMill = new Date(startDate).getTime();
      const endTimeInMill = new Date(endDate).getTime();
      const diffInMillisec = endTimeInMill - startTimeInMill;
  
      return Math.round(diffInMillisec / millisecondsToMinute);
    } catch (err) {
      return 0;
    }
};

export const sendEmail = async (to, name, link) => {
    try {
      console.log(to, 'Email');
      let transporter = nodemailer.createTransport({
        host: `mail.basecoininvest.co`,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: config.email,
          pass: config.emailPassword,
        },
      });
  
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: config.email, // sender address
        to, // list of receivers
        subject: 'Expeditoe - Password Reset', // Subject line
        html: `<p>Hello <b>${name.split(' ')[0]}</b>,<br>
          <p>You requested for a password reset click the link below to reset your password<p>.<br>
          ${link}<br>
          <p>The link above is only valid for two hours <br>Please ignore this email if you did not request for a reset password</p>
        </p>`, // html body
      });
  
      console.log('Message sent: %s', info.messageId);
    } catch (err) {
      console.log(err);
    }
  };

export const handleErrorCatch = (err) => {
    if (
      err.status === HttpStatus.NOT_FOUND ||
      err.status === HttpStatus.BAD_REQUEST ||
      err.status === HttpStatus.UNAUTHORIZED
    ) {
      throw new HttpException(
        {
          status: err.status,
          error: err.response.error,
        },
        err.status,
      );
    }
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `An error occured with the message: ${err.message}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  };

  export const createHash = (name) => {
    return crypto.createHash('md5').update(name).digest('hex');
  };

  export const generateAuthToken = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name
        },
        config.secret,
    );

    return token;
  }
