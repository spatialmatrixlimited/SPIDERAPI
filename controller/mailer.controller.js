 
const nodemailer = require('nodemailer');
 
 //Send message to support
 module.exports = (email, title, body) => {
     // create reusable transporter object using the default SMTP transport
     let transporter = nodemailer.createTransport({
         host: 'smtp.gmail.com',
         port: 465,
         secure: true, // use SSL
         auth: {
            user: 'mypeerexchange@gmail.com',
            pass: 'PE.com2017@@'
         }
     });

     let mailOptions = {
         from: '"Asheori Mail Exchange" <mypeerexchange@gmail.com>', // sender address
         to: email, // list of receivers
         subject: title, // Subject line
         text: body, // plain text body
         html: body // html body
     };

     // send mail with defined transport object
     transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
             console.log(error);
             //return {success : false,message : error};

         }
         console.log('Message %s sent: %s', info.messageId, info.response);
         /*  var message = "Message: " + info.messageId + " Sent: " + info.response;
          res.json({success : true, message : message}); */
     });
 }