/**

SEND AWS EMAIL USING process.env.SES_PROFILE
*/

import { SES, SharedIniFileCredentials } from 'aws-sdk';

const ses_profile = process.env.SES_PROFILE;
const credentials = new SharedIniFileCredentials({ profile: ses_profile });
const ses = new SES({ credentials: credentials, region: 'us-west-1' });

const send_invite = async (
  from: string,
  email: string,
  trip_name: string,
  inviteid: string,
  code: string
) => {
  const url = process.env.CLIENT_URL + '/verify/' + inviteid + '?code=' + code;

  const params = {
    Source: 'verify@compressibleflowcalculator.com',
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: `Invite from ${from} - ${trip_name}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
            <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                  }
                  .header {
                    text-align: center;
                    padding-bottom: 20px;
                  }
                  .header img {
                    max-width: 100px;
                  }
                  .content {
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 10px;
                  }
                  .footer {
                    text-align: center;
                    padding-top: 20px;
                    font-size: 12px;
                    color: #888;
                  }
                  .button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    font-size: 16px;
                    color: #fff;
                    background-color: #light-blue;
                    text-decoration: none;
                    border-radius: 5px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <img src="https://example.com/logo.png" alt="Logo">
                    <h2>You're Invited!</h2>
                  </div>
                  <div class="content">
                    <p>Hello,</p>
                    <p>You have been invited by <strong>${from}</strong> to join the trip <strong>${trip_name}</strong>.</p>
                    <p>This invite code will expire in 24 hours.</p>
                    <a href="${url}" class="button">Join Now</a>
                  </div>
                  <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Compressible Flow Calculator. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export { send_invite };
