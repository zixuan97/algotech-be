const { format } = require('date-fns');
const months = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12'
};
const billTemplate = () => `

<!DOCTYPE html>
<html>
<style>
* {
  margin: 0;
  padding: 0;
  text-indent: 0;
}
html {
  -webkit-print-color-adjust: exact;
}
.s1 {
  color: black;
  font-family: 'Lucida Sans Unicode', sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 10pt;
}
p {
  color: black;
  font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 10pt;
  margin: 0pt;
}
.s2 {
  color: black;
  font-family: 'Lucida Sans Unicode', sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 8pt;
}
.s3 {
  color: black;
  font-family: 'Lucida Sans Unicode', sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 16pt;
}
.s4 {
  color: black;
  font-family: 'Lucida Sans Unicode', sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 10pt;
}
.s5 {
  color: #0462c0;
  font-family: 'Lucida Sans Unicode', sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 10pt;
}
.s6 {
  color: black;
  font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 10pt;
}
h1 {
  color: #007dc4;
  font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: bold;
  text-decoration: none;
  font-size: 10pt;
}
.s7 {
  color: black;
  font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: bold;
  text-decoration: none;
  font-size: 10pt;
}
.s8 {
  color: black;
  font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 9pt;
}
.s9 {
  color: black;
  font-family: 'Lucida Sans Unicode', sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 9pt;
}
.s12 {
  color: #006fbf;
  font-family: 'Lucida Sans Unicode', sans-serif;
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  font-size: 8pt;
}
table,
tbody {
  vertical-align: top;
  overflow: visible;
}

</style>
    <head>
        <link href="./css/main.css" rel="stylesheet">
        <title>Document</title>
    </head>
    <body>
      
    <br>
    <div style="display:flex; justify-content: center;">
        <p style="text-indent: 0pt; text-align: left">
            <span>
                <table cellspacing="0" cellpadding="0" width="720px">
                    <tr>
                        <td colspan="2">
                        
                            <img width="230" height="61" src="https://i.ibb.co/qrcBf41/circleslogo.png">
                        </td>
                        <td colspan="1">
                            <p class="s1" style="
                              padding-top: 4pt;
                              padding-left: 59pt;
                              text-indent: 0pt;
                              text-align: right;
                            ">
                                TAX INVOICE
                            </p>
                            <p style="
                              padding-top: 3pt;
                              padding-left: 59pt;
                              text-indent: 0pt;
                              text-align: right;
                            ">
                               ${bill.orgDetails[0].name}
                            </p>
                            <p style="
                              padding-top: 5pt;
                              padding-left: 59pt;
                              text-indent: 0pt;
                              text-align: right;
                            ">
                               ${`${bill.orgDetails[0].billingAddress.blockNo} ${bill.orgDetails[0].billingAddress.streetName} ${bill.orgDetails[0].billingAddress.buildingName} #${bill.orgDetails[0].billingAddress.unitNo} S${bill.orgDetails[0].billingAddress.postalCode}`}
                            </p>
                        </td>
                    </tr>
                </table>
            </span>
        </p>
    </div>
    <span>
        <img width="100%" height="7" src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAHAxwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDaPSj+GiivyGB/JrGmg9KKK7oEsaOKSiiu2AhBSUUV2QIGjoaQ9KKK7YECDkUhoortgJiUmOaKK7YksQ9aaOpoortiSJRRRXdEga3WjtRRXZAkYetFFFdsCWIeopG60UV3QJYnemtRRXZAkSkbrRRXbAkD0prdKKK7YEsQ9KaRRRXZAlgelNoorugSwPSm0UV2wJEPSk/hoortgQxDR2oorsgJjKOtFFdsSGN70UUV2wENWkPWiiu2BAg5FIaKK61sJbiU00UUmdkBOtNPWiismdsANNPWiis2dsBD0pp60UVmzsgIelIetFFZM7oDT0NIaKKzZ2wEpp7UUVmzsgFNPQUUViztgJTTRRWbO6AlNNFFZs7ICU09aKKyZ2wCmnrRRUM7YCUh60UVkztgNpG60UVmztgJSEc0UVmztgNpDRRWTO2IlNaiis2dsBKQ9BRRWTO2A2m0UVkztgFNI4NFFQztgJSHvRRWTO2A2kPU0UVmztgJTTRRWbO2IlIetFFZM7YjaQ9aKKyZ2wEooorNnXE//9kA">
    </span>

    <div style="display:flex;justify-content: center;">
  
    <table  width="720px" style="border-collapse: collapse;">
      <tr >
        <td bgcolor="E6E5E5">
          <p class="s2" style="
            padding-left: 5pt;
            padding-top: 7pt;
            text-indent: 0pt;
            text-align: left;
          ">
        Company Name.
    </p>
    <p class="s3" style="
        padding-left: 5pt;
        padding-top: 1pt;
        padding-bottom: 2pt;
        text-indent: 0pt;
        text-align: left;
    ">
    ${bill.orgDetails[0].name}
    </p>
    <p class="s2" style=" text-indent: 0pt;  padding-left: 5pt;text-align: left">
        CUSTOMER ID: ${bill.orgDetails[0].uen}
    </p>
    <p class="s2" style=" text-indent: 0pt;  padding-left: 5pt;text-align: left">
       INVOICE NO: ${bill.billNo}
    </p>
        </td>
        <td width="250px" bgcolor="E6E5E5"><p class="s2" style="
          padding-top: 7pt;
          padding-left: 60pt;
          text-indent: 0pt;
          text-align: left;
        ">
          BILL DATE
      </p>
      <p class="s3" style="
          padding-top: 1pt;
          padding-left: 60pt;
          text-indent: 0pt;
          text-align: left;
        ">
          ${format(bill.billingDate, 'dd MMM yyyy')}
      </p>
      <p class="s2" style="padding-left: 60pt; text-indent: 0pt; text-align: left">
          BILLING PERIOD:
      </p>
      <p class="s2" style="padding-left: 60pt; text-indent: 0pt; text-align: left">
      
      ${format(
        new Date(new Date().getFullYear(), months[bill.billPeriod] - 1, 1),
        'dd MMM yyyy'
      )} - ${format(
  new Date(new Date().getFullYear(), months[bill.billPeriod], 0),
  'dd MMM yyyy'
)}
          
      </p>
      <p style="text-indent: 0pt; text-align: left">
          <br>
      </p></td>

        <td width="150px" style="background-color:#007dc4">
        <p style="
        padding-top: 7pt;
        text-indent: 0pt;
        text-align: right;
      ">
        <span style="
          color: white;
          font-family: 'Lucida Sans Unicode', sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          padding-right: 5pt;
          font-size: 8pt;
        ">NET BILL AMOUNT
        </span
      >
    </p> <p style="
    padding-top: 1pt;
    text-indent: 0pt;
    text-align: right;
  ">
    <span style="
      color:white;
      font-family: 'Lucida Sans Unicode', sans-serif;
      font-style: normal;
      font-weight: normal;
      text-decoration: none;
      padding-right: 5pt;
      font-size: 16pt;
    ">${`$ ${bill.amount.toFixed(2)}`}
    </span
  >
</p>
<p style="text-indent: 0pt; text-align: right">
    <span style="
      color: white;
      font-family: 'Lucida Sans Unicode', sans-serif;
      font-style: normal;
      font-weight: normal;
      text-decoration: none;
      font-size: 8pt;
      padding-right: 5pt;
    ">Includes GST of $${((bill.amount / 1.07) * 0.07).toFixed(2)}
    </span
  >
</p>
</td>
      </tr>
      <tr>
<td colspan="3" >
  <p class="s1" style="
  padding-top: 12pt;
  padding-bottom:7pt;
  text-indent: 0pt;
  text-align: left;
">
<b></b>
  
</p>
      <table style="border-collapse: collapse;
      border-bottom-style: solid;
      border-bottom-width: 1pt;
      border-bottom-color: #e6e5e5;" cellspacing="0">
         <tr style="height: 22pt">
          <td style="width: 450pt;border-right-style: solid;
          border-right-width: 1pt;
          border-right-color: #e6e5e5;" bgcolor="#E6E5E5" colspan="6">
              <p class="s4" style="
            padding-top: 6pt;
            padding-left: 5pt;
            text-indent: 0pt;
            text-align: left;
          " >
                  <b>Base Plan Subscription</b>
              </p>
          </td>
       
      </tr>
     
      
      <tr >
        <td style="width:300pt;
        border-left-style: solid;
        border-left-width: 1pt;
        border-left-color: #e6e5e5;
      " >
            <p class="s7" style="
          padding-top: 7pt;
          padding-left: 5pt;
          padding-bottom: 3pt;
          text-indent: 0pt;
          text-align: left;
        ">
       Description
        </p>
            </td>
         <td >
          <p class="s7" style="
          padding-top: 7pt;
          text-indent: 0pt;
          text-align: center;
        ">
               Quantity
            </p>
         </td>
         <td >
         <p class="s7" style="
         padding-top: 7pt;
         text-indent: 0pt;
         text-align: center;
       ">
              Unit Price($)
           </p>
        </td>
        <td >
        <p class="s7" style="
        padding-top: 7pt;
        padding-left:3pt;
        text-indent: 0pt;
        text-align: right;
        white-space: nowrap;
      ">
             Total w/o GST($)
          </p>
       </td>
       <td >
        <p class="s7" style="
        padding-top: 7pt;
        text-indent: 0pt;
        text-align: right;
      ">
             Tax Amount($)
          </p>
       </td>
       <td style="border-right-style: solid;
       border-right-width: 1pt;
       border-right-color: #e6e5e5;">
      
       <p class="s7" style="
       padding-top: 7pt;
       padding-right: 10pt;
       text-indent: 0pt;
       text-align: right;
       
     ">
            Nett Total($)
           
         </p>
        
      </td>
      </tr>
      ${bill.items
        .map((item) => {
          if (
            item.category === 'baseplan' ||
            item.category === 'free addon' ||
            item.category === 'addon'
          ) {
            return `
        <tr>
      <td style="
        width: 300pt;
        padding-top:2pt;
        padding-left:5pt;
        border-left-style: solid;
        border-left-width: 1pt;
        border-left-color: #e6e5e5;
        font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            font-size: 9pt;
      " >
      ${item.name}
      </td>
      <td style="width:50pt; padding-top:2pt;
      font-family: Arial, sans-serif;
          font-style: normal;
          font-weight: normal;
          font-size: 9pt;"colspan="1">
<p class="s4" style="
text-indent: 0pt;
text-align: center;
">
${item.quantity}
</p>
</td>
<td colspan="1" style="width:121pt;text-align: center;padding-top:2pt;
font-family: Arial, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 9pt;
       ">
<span  class="s4">${item.unitPrice.toFixed(2)}</span>
</td>
<td colspan="1" style="width:121pt;text-align: right;padding-top:2pt;
font-family: Arial, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 9pt;
       ">
<span  class="s4">${((item.unitPrice * item.quantity) / 1.07).toFixed(2)}</span>
</td>
<td colspan="1" style="width:121pt;text-align: right;padding-top:2pt;
font-family: Arial, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 9pt;
       ">
<span  class="s4">${(((item.unitPrice * item.quantity) / 1.07) * 0.07).toFixed(
              2
            )}</span>
</td>

<td colspan="1" style="width:121pt;text-align: right;
        border-right-style: solid;
        border-right-width: 1pt;
        border-right-color: #e6e5e5;">
<span style="padding-right: 10pt;" class="s4">${(
              item.unitPrice * item.quantity
            ).toFixed(2)}</span>
</td>
      
</tr>
        `;
          } else {
            return '';
          }
        })
        .join('\n')}

<tr>
  <td style="
  width: 300pt;
  padding-top:2pt;
  padding-left:5pt;
  border-left-style: solid;
  border-left-width: 1pt;
  border-left-color: #e6e5e5;
  font-family: Arial, sans-serif;
      font-style: normal;
      font-weight: normal;
      font-size: 9pt;
" >
  </td>
  <td style="width:50pt" colspan="1">



    <p class="s8" style="
padding-top: 5pt;
padding-left: 5pt;
text-indent: 0pt;
text-align: center;
">
    </p>
  </td>
  <td style="width:50pt" colspan="3">



    <p class="s8" style="
padding-top: 5pt;
padding-left: 5pt;
text-indent: 0pt;
text-align: center;
">
    </p>
  </td>
  <td colspan="1" style="width:121pt;text-align: right;padding-right: 7pt;
  border-right-style: solid;
  border-right-width: 1pt;
  border-right-color: #e6e5e5;
  padding-top:2pt;
  font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 9pt;
  ">
  </td>

</tr>
          
      </table >
  <br />
     ${
       bill.items.filter((x) => x.category === 'payg').length === 0
         ? ''
         : `<table style="border-collapse: collapse;
      border-bottom-style: solid;
      border-bottom-width: 1pt;
      border-bottom-color: #e6e5e5;" cellspacing="0">
      <tr style="height: 22pt">
        <td style="width: 450pt;border-right-style: solid;
          border-right-width: 1pt;
          border-right-color: #e6e5e5;" bgcolor="#E6E5E5" colspan="7">
          <p class="s4" style="
            padding-top: 6pt;
            padding-left: 5pt;
            text-indent: 0pt;
            text-align: left;
          " >
            <b>Additional Usages</b>
          </p>
        </td>
        <!--  <td colspan="2" style="
          width: 20pt;
          border-top-style: solid;
          border-top-width: 1pt;
          border-top-color: #e6e5e5;
         
        " bgcolor="#DDE9F5">
          <p class="s4" style="
            padding-top: 3pt;
            text-indent: 0pt;
            text-align: right;
          ">
            $${bill.amount.toFixed(2)}
          </p>
        </td> -->
      </tr>


      <tr >
        <td colspan=3 style="
        width: 200pt;
        border-left-style: solid;
        border-left-width: 1pt;
        border-left-color: #e6e5e5;
      " >
        <p class="s7" style="
          padding-top: 7pt;
          padding-left: 5pt;
          padding-bottom: 3pt;
          text-indent: 0pt;
          text-align: left;
        ">
          Description
        </p>
      </td>

      <td >
        <p class="s7" style="
         padding-top: 7pt;
         text-indent: 0pt;
         text-align: right;
       ">
          Price ($) <br />
        </p>
      </td>
      <td >
        <p class="s7" style="
        padding-top: 7pt;
        padding-left:3pt;
        text-indent: 0pt;
        text-align: right;
        white-space: nowrap;
      ">
          Total w/o GST ($)
        </p>
      </td>
      <td >
        <p class="s7" style="
        padding-top: 7pt;
        text-indent: 0pt;
        text-align: right;
      ">
          Tax Amount ($)
        </p>
      </td>
      <td style="border-right-style: solid;
       border-right-width: 1pt;
       border-right-color: #e6e5e5;">

        <p class="s7" style="
       padding-top: 7pt;
       padding-right: 10pt;
       text-indent: 0pt;
       text-align: right;
       
     ">
          Nett Total ($)

        </p>

      </td>
    </tr>
    ${bill.items
      .map((item) => {
        if (item.category === 'payg') {
          return `
          <tr>
        <td colspan=3 style="
          width: 250pt;
          padding-top:2pt;
          padding-left:5pt;
          border-left-style: solid;
          border-left-width: 1pt;
          border-left-color: #e6e5e5;
          font-family: Arial, sans-serif;
              font-style: normal;
              font-weight: normal;
              font-size: 9pt;
        " >
        ${item.name}
        </td>
       
        <td colspan="1" style="width:121pt;text-align: center;padding-top:2pt;
        font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            font-size: 9pt;
               ">
        <span  class="s4">${item.unitPrice.toFixed(2)}</span>
        </td>
        <td colspan="1" style="width:121pt;text-align: right;padding-top:2pt;
        font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            font-size: 9pt;
               ">
        <span  class="s4">${((item.unitPrice * item.quantity) / 1.07).toFixed(
          2
        )}</span>
        </td>
        <td colspan="1" style="width:121pt;text-align: right;padding-top:2pt;
        font-family: Arial, sans-serif;
            font-style: normal;
            font-weight: normal;
            font-size: 9pt;
               ">
        <span  class="s4">${(
          ((item.unitPrice * item.quantity) / 1.07) *
          0.07
        ).toFixed(2)}</span>
        </td>
        
        <td colspan="1" style="width:121pt;text-align: right;
                border-right-style: solid;
                border-right-width: 1pt;
                border-right-color: #e6e5e5;">
        <span style="padding-right: 10pt;" class="s4">${(
          item.unitPrice * item.quantity
        ).toFixed(2)}</span>
        </td>
  </tr>
          `;
        } else {
          return '';
        }
      })
      .join('\n')}
  
  <tr>
  <td style="
    width: 300pt;
    padding-top:2pt;
    padding-left:5pt;
    border-left-style: solid;
    border-left-width: 1pt;
    border-left-color: #e6e5e5;
    font-family: Arial, sans-serif;
        font-style: normal;
        font-weight: normal;
        font-size: 9pt;
  " >
  </td>
  <td style="width:50pt"colspan="1">
  
  
  
  <p class="s8" style="
  padding-top: 5pt;
  padding-left: 5pt;
  text-indent: 0pt;
  text-align: center;
  ">
  </p>
  </td>
  <td style="width:50pt"colspan="3">
  
  
  
  <p class="s8" style="
  padding-top: 5pt;
  padding-left: 5pt;
  text-indent: 0pt;
  text-align: center;
  ">
  </p>
  </td>
  <td colspan="2" style="width:121pt;text-align: right;padding-right: 7pt;
    border-right-style: solid;
    border-right-width: 1pt;
    border-right-color: #e6e5e5;
    padding-top:2pt;
    font-family: Arial, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 9pt;
    ">
  </td>
  
  </tr>
            
        </table>`
     }    
     
  ${
    bill.items.filter((x) => x.category === 'waiver').length === 0
      ? ''
      : `   
    <br/>
    <table style="border-collapse: collapse;
    border-bottom-style: solid;
    border-bottom-width: 1pt;
    border-bottom-color: #e6e5e5;" cellspacing="0">
       <tr style="height: 22pt">
        <td style="width: 450pt;border-right-style: solid;
        border-right-width: 1pt;
        border-right-color: #e6e5e5;" bgcolor="#E6E5E5" colspan="7">
            <p class="s4" style="
          padding-top: 6pt;
          padding-left: 5pt;
          padding-bottom: 2pt;
          text-indent: 0pt;
          text-align: left;
        " >
                <b>Discounts</b>
                <br/>*From Promocode/Referral/Waiver
            </p>
        </td>
    
    </tr>
   
    
    <tr >
      <td colspan=3 style="
      width: 200pt;
      border-left-style: solid;
      border-left-width: 1pt;
      border-left-color: #e6e5e5;
    " >
          <p class="s7" style="
        padding-top: 7pt;
        padding-left: 5pt;
        padding-bottom: 3pt;
        text-indent: 0pt;
        text-align: left;
      ">
     Description
      </p>
          </td>
          <td style="width:300pt">
          <p class="s7" style="
          padding-top: 7pt;
          text-indent: 0pt;
          text-align: right;
        ">
            </p>
         </td>
       <td >
       <p class="s7" style="
       padding-top: 7pt;
       text-indent: 0pt;
       text-align: right;
     ">
            Quantity <br/>
         </p>
      </td>
      <td >
      <p class="s7" style="
      padding-top: 7pt;
      text-indent: 0pt;
      text-align: right;
      white-space: nowrap;
    ">
           Amount ($)
        </p>
     </td>
     <td style="border-right-style: solid;
       border-right-width: 1pt;
       border-right-color: #e6e5e5;">
      <p class="s7" style="
      padding-top: 7pt;
      padding-right: 10pt;
      text-indent: 0pt;
      text-align: right;
    ">
           Nett Total ($)
        </p>
     </td>
    
    </tr>
    ${bill.items
      .map((item) => {
        if (item.category === 'waiver') {
          return `
      <tr>
    <td colspan=3 style="
      width: 250pt;
      padding-top:2pt;
      padding-left:5pt;
      border-left-style: solid;
      border-left-width: 1pt;
      border-left-color: #e6e5e5;
      font-family: Arial, sans-serif;
          font-style: normal;
          font-weight: normal;
          font-size: 9pt;
    " >
    ${item.name}
    </td>
    <td colspan="1" style="width:121pt;text-align: right;padding-top:2pt;
    font-family: Arial, sans-serif;
      font-style: normal;
      font-weight: normal;
      font-size: 9pt;
         ">
    <span  class="s4"></span>
    </td>
<td colspan="1" style="width:121pt;text-align: right;padding-top:2pt;
font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 9pt;
     ">
<span  class="s4">${item.quantity}</span>
</td>
<td colspan="1" style="width:121pt;text-align: right;padding-top:2pt;
font-family: Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 9pt;
     ">
<span  class="s4">${item.unitPrice.toFixed(2)}</span>
</td>
<td colspan="1" style="width:121pt;text-align: right;
      border-right-style: solid;
      border-right-width: 1pt;
      border-right-color: #e6e5e5;">
<span style="padding-right: 10pt;" class="s4">${(
            item.unitPrice * item.quantity
          ).toFixed(2)}</span>
</td>
    
</tr>
      `;
        } else {
          return '';
        }
      })
      .join('\n')}

<tr>
<td style="
width: 300pt;
padding-top:2pt;
padding-left:5pt;
border-left-style: solid;
border-left-width: 1pt;
border-left-color: #e6e5e5;
font-family: Arial, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 9pt;
" >
</td>
<td style="width:50pt"colspan="1">



<p class="s8" style="
padding-top: 5pt;
padding-left: 5pt;
text-indent: 0pt;
text-align: center;
">
</p>
</td>
<td style="width:50pt"colspan="3">



<p class="s8" style="
padding-top: 5pt;
padding-left: 5pt;
text-indent: 0pt;
text-align: center;
">
</p>
</td>
<td colspan="2" style="width:121pt;text-align: right;padding-right: 7pt;
border-right-style: solid;
border-right-width: 1pt;
border-right-color: #e6e5e5;
padding-top:2pt;
font-family: Arial, sans-serif;
font-style: normal;
font-weight: normal;
font-size: 9pt;
">
</td>

</tr>
        
    </table>
    `
  }
     
    <p style="text-indent: 0pt; padding-left: 5pt; padding-top: 5pt;text-align: left">
    
  </p>

      <p style="text-indent: 0pt; text-align: left">
        <br>
    </p>
    <p style="text-indent: 0pt; text-align: left">
        <br>
    </p>
    <p style="text-indent: 0pt; text-align: left">
        <br>
    </p>
    <p style="text-indent: 0pt; text-align: left">
        <br>
    </p>
    <p style="text-indent: 0pt; text-align: left">
        <br>
    </p>
    <p style="text-indent: 0pt; text-align: left">
        <br>
    </p>
    <p style="text-indent: 0pt; text-align: left">
    <br>
</p>

    <p style="text-indent: 0pt; text-align: left">
      <br>
  </p>
  <p style="text-indent: 0pt; text-align: left">
      <br>
  </p>
  <p style="text-indent: 0pt; text-align: left">
      <br>
  </p>
  <p style="text-indent: 0pt; text-align: left">
      <br>
  </p>
  <p style="text-indent: 0pt; text-align: left">
      <br>
  </p>
  <p style="text-indent: 0pt; text-align: left">
      <br>
  </p>
  <p style="text-indent: 0pt; text-align: left">
  <br>
</p>

  <p style="text-indent: 0pt; text-align: left">
    <br>
</p>
<p style="text-indent: 0pt; text-align: left">
    <br>
</p>
<p style="text-indent: 0pt; text-align: left">
    <br>
</p>
<p style="text-indent: 0pt; text-align: left">
    <br>
</p>
<p style="text-indent: 0pt; text-align: left">
    <br>
</p>
<p style="text-indent: 0pt; text-align: left">
    <br>
</p>
<table style="border-collapse: collapse; margin-right: auto;margin-left:0px" cellspacing="0">
        <tr style="height: 14pt">
         <td
           style="
             width: 300pt;
             border-top-style: solid;
             border-top-width: 1pt;
             border-left-style: solid;
             border-left-width: 1pt;
             border-bottom-style: solid;
            border-bottom-width: 1pt;
            border-right-style: solid;
            border-right-width: 1pt;
          "
        >
          <p
            class="s3"
            style="margin-left:4pt ;text-indent: 0pt; text-align: left; font-size: 9pt;"
          >
            Payment Details
          </p>
        </td>
      </tr>
      <tr style="height: 15pt">
        <td
          style="
            width: 300pt;
            border-top-style: solid;
            border-top-width: 1pt;
            border-left-style: solid;
            border-left-width: 1pt;
            border-bottom-style: solid;
            border-bottom-width: 1pt;
            border-right-style: solid;
            border-right-width: 1pt;
            
          "
        >
          <p
            class="s3"
            style=" text-indent: 0pt; text-align: left;font-size: 9pt;margin-left:4pt;padding-top:1pt"
          >
            1. You can make your payment via PayNow
          
            <a href=${url}>
            here
            </a> 
          </p>
        </td>
      </tr>
      <tr style="height: 94pt;">
        <td
            style="
              width: 300pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s3"
              style="margin-left:4pt;text-indent: 0pt; text-align: left;font-size: 9pt;padding-top:1pt"
            >
              2. Bank Transfer
            </p>
            <p
              class="s3"
              style="margin-left:4pt;text-indent: 0pt; text-align: left;font-size: 9pt;"
            >
              Bank name: DBS Bank
            </p>
            <p
              class="s3"
              style="
                padding-right: 71pt;
                text-indent: 0pt;
                text-align: left;
                font-size: 9pt;
                margin-left:4pt
              "
            >
              Beneficiary Name: Liberty Wireless Pte. Ltd. <br/>
              Account Number:
              00890335673
            </p>
            <p
              class="s3"
              style="
                padding-right: 144pt;
                text-indent: 0pt;
                text-align: left;
                font-size: 9pt;
                margin-left:4pt
              "
            >
              Swift Code: DBSSSGSGXXX 
            </p>
            <p
            class="s3"
            style="
              padding-right: 144pt;
              text-indent: 0pt;
              text-align: left;
              font-size: 9pt;
              margin-left:4pt
            "
          >Branch Code: 008
          </p>
            <p
              class="s3"
              style="
                text-indent: 0pt;
                line-height: 12pt;
                text-align: left;
                font-size: 9pt;
                margin-left:4pt
              "
            >
              Bank Code: 7171
            </p>
          </td>
        </tr>
        <tr style="height: 14pt">
          <td
            style="
              width: 300pt;
              border-top-style: solid;
              border-top-width: 1pt;
              border-left-style: solid;
              border-left-width: 1pt;
              border-bottom-style: solid;
              border-bottom-width: 1pt;
              border-right-style: solid;
              border-right-width: 1pt;
            "
          >
            <p
              class="s3"
              style=" text-indent: 0pt; text-align: left;font-size: 9pt; margin-left:4pt;padding-top:1pt"
            >
              3. Please include the invoice number in description for all payments
            </p>
          </td>
        </tr>
      </table>
      <p class="s4" style="text-indent: 0pt;text-align:left;padding-left:12pt;padding-top: 1pt; ">
        This is a computer-generated invoice. No signature is required.
      </p>


  </tr >
  </table
  >
  </span >
  </p >

    </td >
  </tr >
</table >
        
      
    
    </div >
   
  
</body >
</html >
  `;

module.exports = billTemplate;
