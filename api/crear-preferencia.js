const { MercadoPagoConfig, Preference } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");
const productos = require("../js/products.js");

const productosPorId = new Map(productos.map(p => [String(p.id), p]));

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { items: itemsInput } = req.body || {};
  if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
    return res.status(400).json({ error: "Items inválidos" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: "Sesión inválida" });
  }
  const userId = userData.user.id;

  const itemsValidados = [];
  for (const it of itemsInput) {
    const p = productosPorId.get(String(it.id));
    if (!p) {
      return res.status(400).json({ error: `Producto inválido: ${it.id}` });
    }
    const qty = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 0));
    if (qty < 1) {
      return res.status(400).json({ error: `Cantidad inválida para ${p.nombre}` });
    }
    itemsValidados.push({
      id: String(p.id),
      nombre: p.nombre,
      cantidad: qty,
      precio: Number(p.precio),
      imagen: p.imagen || ""
    });
  }

  const subtotal = itemsValidados.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const comision = Math.round(subtotal * 0.05);
  const total = subtotal + comision;

  const { data: pedido, error: pedidoErr } = await supabase
    .from("pedidos")
    .insert({
      user_id: userId,
      items: itemsValidados,
      total,
      estado: "pendiente"
    })
    .select("id")
    .single();

  if (pedidoErr || !pedido) {
    console.error("[crear-preferencia] Error guardando pedido:", pedidoErr);
    return res.status(500).json({ error: "No se pudo crear el pedido" });
  }

  const mpItems = itemsValidados.map(i => ({
    id: i.id,
    title: i.nombre,
    quantity: i.cantidad,
    unit_price: i.precio,
    currency_id: "CLP"
  }));
  if (comision > 0) {
    mpItems.push({
      id: "comision-bancaria",
      title: "Comisión Bancaria impuesto",
      quantity: 1,
      unit_price: comision,
      currency_id: "CLP"
    });
  }

  const siteUrl   = process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : siteUrl;

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${siteUrl}/carrito.html?pago=ok`,
          failure: `${siteUrl}/carrito.html?pago=error`,
          pending: `${siteUrl}/carrito.html?pago=pendiente`
        },
        auto_return:          "approved",
        statement_descriptor: "Joyería Aravena",
        external_reference:   String(pedido.id),
        notification_url:     `${vercelUrl}/api/mp-webhook`
      }
    });

    return res.status(200).json({
      init_point: response.init_point,
      pedidoId: pedido.id
    });

  } catch (err) {
    console.error("[crear-preferencia] Error MP:", err.message);
    return res.status(500).json({ error: "Error al crear preferencia" });
  }
};
