const { MercadoPagoConfig, Preference } = require("mercadopago");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
  });

  let items;
  try {
    ({ items } = JSON.parse(event.body));
    if (!Array.isArray(items) || items.length === 0) throw new Error();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Items inválidos" }) };
  }

  try {
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: items.map(i => ({
          id: i.id,
          title: i.title,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          currency_id: "CLP"
        })),
        back_urls: {
          success: `${process.env.URL}/carrito.html?pago=ok`,
          failure: `${process.env.URL}/carrito.html?pago=error`,
          pending: `${process.env.URL}/carrito.html?pago=pendiente`
        },
        auto_return: "approved",
        statement_descriptor: "Joyería Aravena"
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_point: response.init_point })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al crear preferencia", detail: err.message })
    };
  }
};
