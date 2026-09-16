
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData);

    const {
      email,
      telephone,
      Amount,
      Currency,
      Reference,
      accepturl,
      declineurl,
      cancelurl,
    } = payload;

    const merchantId = process.env.MAXICASH_MERCHANT_ID;
    const merchantPassword = process.env.MAXICASH_MERCHANT_PASSWORD;
    const maxiCashApiUrl = process.env.MAXICASH_API_URL;

    if (!merchantId || !merchantPassword || !maxiCashApiUrl) {
      throw new Error('Les variables d\'environnement MaxiCash ne sont pas configurées côté serveur.');
    }

    // Créer une page HTML avec un formulaire qui se soumet automatiquement
    const htmlForm = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirection vers MaxiCash...</title>
        </head>
        <body onload="document.forms[0].submit()">
          <p>Vous allez être redirigé vers notre partenaire de paiement MaxiCash. Si la redirection ne fonctionne pas, veuillez cliquer sur le bouton ci-dessous.</p>
          <form action="${maxiCashApiUrl}" method="POST">
            <input type="hidden" name="PayType" value="MaxiCash" />
            <input type="hidden" name="Amount" value="${Amount}" />
            <input type="hidden" name="Currency" value="${Currency}" />
            <input type="hidden" name="MerchantID" value="${merchantId}" />
            <input type="hidden" name="MerchantPassword" value="${merchantPassword}" />
            <input type="hidden" name="Language" value="fr" />
            <input type="hidden" name="Reference" value="${Reference}" />
            <input type="hidden" name="email" value="${email}" />
            <input type="hidden" name="telephone" value="${telephone}" />
            <input type="hidden" name="accepturl" value="${accepturl}" />
            <input type="hidden" name="declineurl" value="${declineurl}" />
            <input type="hidden" name="cancelurl" value="${cancelurl}" />
            <button type="submit">Continuer vers le paiement</button>
          </form>
        </body>
      </html>
    `;

    return new NextResponse(htmlForm, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('API MaxiCash Redirect Error:', error);
    return NextResponse.json(
      { error: 'Une erreur interne est survenue lors de la préparation du paiement.' },
      { status: 500 }
    );
  }
}
