const csvToJson   = require("csvtojson/v2");
const fs          = require('fs');
const nodemailer  = require('nodemailer');
const config      = require('./config.json');
const transporter = nodemailer.createTransport(config);

const sendMail = (options) => {
  return new Promise((resolve, reject) => {
    console.log(`Sending ${options.to}`);
    transporter.sendMail(options, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(`Message sent to ${options.to}`)
      }
    });
  })
}

(function () {
  const csv_path = process.argv[2];
  const template_path = process.argv[3];
  const failed = [];

  if (!csv_path || !template_path) {
    console.error("usage: node index.js ./list.csv ./template.html\n");
    return;
  }

  csvToJson().fromFile(csv_path).then(async (people) => {
    const template = fs.readFileSync(template_path, 'utf8');

    for (const person of people) {
      const content = template.replace('hacker', person.first_name);

      const options = {
        from: config.auth.user,
        to: person.email,
        subject: 'BoilerMake Exec Team Recruitment',
        html: content
      };

      try {
        await sendMail(options);
      } catch (err) {
        failed.push(options.to)
        console.log(err);
      }
    }
    if(failed.length) {
      console.log('failed: ' + failed);
    }
  })
}());
