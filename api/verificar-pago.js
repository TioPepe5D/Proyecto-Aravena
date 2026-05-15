const { MercadoPagoConfig, Payment } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");

/**
 * Verifica el estado real de un pago en MercadoPago y actualiza Supabase.
 * Funciona para usuarios invitados (sin sesión) porque usa la SERVICE_KEY.
 *
 * Body: { pedidoId?: string, paymentId?: string }
 * Devuelve: { estado, pedidoId, paymentId }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { pedidoId, paymentId } = req.body || {};
  if (!pedidoId && !paymentId) {
    return res.status(400).json({ error: "Falta pedidoId o paymentId" });
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Configuración de pago incompleta" });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Obtener el pago: por id directo o buscando por external_reference
    let pago = null;
    if (paymentId) {
      const paymentApi = new Payment(client);
      pago = await paymentApi.get({ id: paymentId });
    } else {
      const resp = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(pedidoId)}&sort=date_created&criteria=desc`,
        { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
      );
      const data = await resp.json();
      pago = data?.results?.[0] || null;
    }

    if (!pago) {
      return res.status(200).json({ estado: "pendiente", pedidoId, paymentId: null, encontrado: false });
    }

    let estado;
    if (pago.status === "approved")                                  estado = "pagado";
    else if (pago.status === "rejected" || pago.status === "cancelled") estado = "fallido";
    else                                                              estado = "pendiente";

    const refId = pedidoId || pago.external_reference;
    if (!refId) {
      return res.status(400).json({ error: "Pago sin external_reference" });
    }

    const { error } = await supabase
      .from("pedidos")
      .update({ estado, mp_payment_id: String(pago.id) })
      .eq("id", refId);

    if (error) {
      console.error("[verificar-pago] Error Supabase:", error);
      return res.status(500).json({ error: "No se pudo actualizar el pedido" });
    }

    console.log("[verificar-pago] Pedido", refId, "→", estado, "| MP payment:", pago.id);
    return res.status(200).json({ estado, pedidoId: refId, paymentId: String(pago.id), encontrado: true });

  } catch (err) {
    console.error("[verificar-pago] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
