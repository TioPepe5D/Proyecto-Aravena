const { MercadoPagoConfig, Payment } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  // MercadoPago valida la URL con GET al registrar el webhook
  if (req.method === "GET") {
    return res.status(200).send("OK");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body || {};
    console.log("[Webhook MP] Notificación:", JSON.stringify(body));

    // Solo procesar eventos de pago
    const tipo = body.type || body.topic;
    if (tipo !== "payment") {
      return res.status(200).send("OK");
    }

    const paymentId = body.data?.id || body.id;
    if (!paymentId) return res.status(200).send("OK");

    // Obtener detalles del pago desde MP
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentApi = new Payment(client);
    const pago = await paymentApi.get({ id: paymentId });

    const mpStatus = pago.status;
    const pedidoId = pago.external_reference;

    console.log("[Webhook MP] Status:", mpStatus, "| PedidoId:", pedidoId);

    if (!pedidoId) return res.status(200).send("OK");

    // Mapear estado MP → nuestro sistema
    let estado;
    if (mpStatus === "approved")                                    estado = "pagado";
    else if (mpStatus === "rejected" || mpStatus === "cancelled")   estado = "fallido";
    else                                                            estado = "pendiente";

    // Actualizar Supabase con la service role key (solo en servidor)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error } = await supabase
      .from("pedidos")
      .update({ estado, mp_payment_id: String(paymentId) })
      .eq("id", pedidoId);

    if (error) console.error("[Webhook MP] Error Supabase:", error);
    else       console.log("[Webhook MP] Pedido", pedidoId, "→", estado);

    return res.status(200).send("OK");

  } catch (err) {
    // Siempre 200 → MP no reintenta
    console.error("[Webhook MP] Error:", err.message);
    return res.status(200).send("OK");
  }
};
