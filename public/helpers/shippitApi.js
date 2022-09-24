const axios = require('axios');

const getToken = async (req) => {
  const path = 'https://app.shippit.com/api/ui/v1/auth/jwt.json';
  const options = {
    headers: {
      'Cookie': '_shippit_session=U2xIcDFxODVRTGFwZzFxUVNKN2YwTXEydjlsY0k4ZmhpQlBsbjBXR290c3p1VDZqb1k2VHkyZEVhc05DdDZOcG9ybnV1UnJQdGZwdXZvYk5DSmM1Qmp2eTlqSy9FN2JwN1phclppYW5IbFJHSThFbUszT1hjNWtEQ0NZKy9jTi90Vk1ialFTSkN5c2xKV2ZrUTRnVnVURGhhZVVkeW92NSs4aFgzT3ByK3AwSEl4OHhNSXFyREV4Y1U2by9OMVYyeldNbHRhdW50Y2ZST0xCR2JMRGtMcjNyRklsemRPSTkwcFprSlY3QzBSSkpVM0grNDZIREI4c3JxRmk5U1FYMC0tRmo3MEZqZ3NUZVEyUWJxRFowTjFFQT09--557d5a45fe91b9202ce5c9d92fa5a9d62fb57c9b; ahoy_visit=3ec2a2ee-69d3-4713-a843-4583dc17b04f; ahoy_visitor=dd475851-e4be-49d5-a609-45ddbbaa5cd0; shippit_fingerprint=51234568928ef8f38582; shippit_jwt=eyJhbGciOiJSUzUxMiJ9.eyJpc3MiOiJhcHAuc2hpcHBpdC5jb20iLCJzdWIiOiIyMTAyMjVmMy01ODk4LTRjMzctODNhNS1jODgyNzMzOTk4Y2IiLCJleHAiOjE2NjM4NjM0MDcsInVzZXIiOiIyMTAyMjVmMy01ODk4LTRjMzctODNhNS1jODgyNzMzOTk4Y2IiLCJlbWFpbCI6Im1lcnlsc2Vvd3dAZ21haWwuY29tIiwicm9sZXMiOlsibWVyY2hhbnQiXSwidmVyc2lvbiI6InYwLjEuMSJ9.WsZmBrFCt2kfFXWPaZ5WiIsujTqeZEpat-o24ivYllh7WFMn6wV3jGmoS8eaeZWGeNVvoDrzZMnQ22nadFL51nH-V8yIdbE7WCfE6vUBJ5EAU7O5MfyhT6vSCD9g-OEo_6XhNrc8T7KNJ_jXssSJXJtI3SNMg9YyI-L4D_vT5ihwitrNpvNlK5Rswr_9SqrnChBsp_jUuZFINpx0sQNu19JiDvCPIE1gHUo-qTRwDgtENF-FR1UI6lKHOZrMi64cDKBMkd0xGwhB4wStCjBO3gDph7Vsf3FV3t8rTJt5ngCk6-3m0bxBNvulzN--K9cCuaW20kSWLcdsZax9gT-4LQ'  
    },
  };
  return await axios
    .get(path, options)
    .then((res) => {
      const response = res.data;
      return response.token;
    })
    .catch((err) => { 
      console.log(err);
    });
};

exports.getToken = getToken;