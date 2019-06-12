
  var asset = require('../config/assets');
  var mailjet = require ('node-mailjet')
  .connect(asset.MJPKSMTP, asset.MJSKSMTP);

  var mailJet = (recepient, title, template)=>{
    var request = mailjet
        .post("send")
        .request({
            "FromEmail":"female.hire@wuntlist.com",
            "FromName":"MetroData Insight",
            "Subject": title,
            "Text-part":"Important notification from MetroData Insight",
            "Html-part":template,
            "Recipients":[
                    {
                            "Email": recepient
                    },{
                            "Email": 'kolagrey@gmail.com'
                    }
            ]
        }).then((data)=>{
          //console.log(data.body.Sent);
        }).catch((e)=>{
          console.log(e);
        });
  }

  exports.mailJet = mailJet;
