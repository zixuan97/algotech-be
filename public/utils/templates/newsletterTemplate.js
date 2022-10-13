const newsletterTemplate = (discountCode, emailBodyTitle, emailBody) => `
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Newsletter Template 1</title>
    <link
      href="https://fonts.googleapis.com/css?family=Poppins"
      rel="stylesheet"
    />
  </head>
  <body>
    <div
      style="
        width: 781px;
        margin: auto;
        height: 800px;
        
      "
    >
      <table style="width: 781px; border: 1px solid black; border-radius: 10px">
        <tr>
          <div
            style="background-color: #1f1646; height: 100px; text-align: center"
          >
            
            <img
              src=" https://i.ibb.co/km9Pq80/logo-brown-white-text.png"
              style="height: 150px; padding-top: 30px"
            />
           
          </div>
        </tr>
        <tr>
        <br />
      </tr>
        <tr>
          <br />
        </tr>
        <tr>
          <br />
        </tr>
        <tr>
          <br />
        </tr>

        <tr>
          <div style="text-align: center">
            <span
              style="
                font-family: Poppins;
                font-size: 32px;
                color: #1F1646;
              "
              ><b>${emailBodyTitle}</b>
            </span>
          </div>
        </tr>

        <tr>
          <br />
        </tr>
        <tr>
          <div
            style="
              text-align: center;
              height: 300px;
              padding-right: 50px;
              padding-left: 50px;
            "
          >
            <span style="font-family: Poppins; font-size: 16px;color: #1F1646;"
              >${emailBody}
            </span>
          </div>
        </tr>

        <tr>
          <div style="text-align: center">
            <span
              style="
                font-family: Poppins;
                font-size: 32px;
                color: #1F1646;
              "
              ><b>Code: </b>
            </span>
            <span
              style="
                font-family: Poppins;
                font-size: 32px;
                color: #96694c;
              "
              ><b><u>${discountCode}</u></b>
            </span>
          </div>
        </tr>
        <tr>
          <br />
        </tr>
        <tr>
          <div style="background-color: #1f1646; height: 100px"></div>
        </tr>
      </table>
    </div>
  </body>
</html>


`;
module.exports = newsletterTemplate;
