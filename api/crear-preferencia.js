const { MercadoPagoConfig, Preference } = require("mercadopago");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { items, pedidoId } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items inválidos" });
  }

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
  });

  const siteUrl   = process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : siteUrl;

  try {
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: items.map(i => ({
          id:         i.id,
          title:      i.title,
          quantity:   Number(i.quantity),
          unit_price: Number(i.unit_price),
          currency_id: "CLP"
        })),
        back_urls: {
          success: `${siteUrl}/carrito.html?pago=ok`,
          failure: `${siteUrl}/carrito.html?pago=error`,
          pending: `${siteUrl}/carrito.html?pago=pendiente`
        },
        auto_return:          "approved",
        statement_descriptor: "Joyería Aravena",
        external_reference:   pedidoId || "",
        notification_url:     `${vercelUrl}/api/mp-webhook`
      }
    });

    return res.status(200).json({ init_point: response.init_point });

  } catch (err) {
    console.error("[crear-preferencia] Error:", err.message);
    return res.status(500).json({ error: "Error al crear preferencia", detail: err.message });
  }
};
