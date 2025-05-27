function getNewsletterHtml(unsubscribeUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to Guitar Shop</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          background-color: #ffffff;
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }
        h1 {
          color: #2d2d2d;
        }
        p {
          color: #555;
          line-height: 1.6;
        }
        .button-container{
          text-align: center;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 20px;
          background-color: #e63946;
          color: white !important;
          text-decoration: none;
          border-radius: 25px;
        }
        .button:hover {
          background-color: #ef4a58;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #aaa;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎸 Welcome to Guitar Shop!</h1>
        <p>Hey there,</p>
        <p>Thanks for subscribing to the Guitar Shop newsletter! We're thrilled to have you in our community of music lovers and gear heads.</p>
        <p>Expect occasional updates about new guitars, exclusive deals, and some handpicked tips to help you rock even harder. 🤘</p>

        <div class="button-container"><a href=${process.env.CLIENT_ORIGIN} class="button">Visit Guitar Shop</a></div>

        <div class="footer">
          If you didn't subscribe, you can <a href=${unsubscribeUrl}>unsubscribe here</a>.<br/>
          &copy; 2025 Guitar Shop. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = getNewsletterHtml;
