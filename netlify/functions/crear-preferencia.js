const { MercadoPagoConfig, Preference } = require("mercadopago");
const { createClient } = require("@supabase/supabase-js");
const productos = require("../../js/products.js");

const productosPorId = new Map(productos.map(p => [String(p.id), p]));

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let itemsInput;
  try {
    ({ items: itemsInput } = JSON.parse(event.body || "{}"));
    if (!Array.isArray(itemsInput) || itemsInput.length === 0) throw new Error();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Items inválidos" }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: "No autenticado" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { statusCode: 401, body: JSON.stringify({ error: "Sesión inválida" }) };
  }
  const userId = userData.user.id;

  const itemsValidados = [];
  for (const it of itemsInput) {
    const p = productosPorId.get(String(it.id));
    if (!p) {
      return { statusCode: 400, body: JSON.stringify({ error: `Producto inválido: ${it.id}` }) };
    }
    const qty = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 0));
    if (qty < 1) {
      return { statusCode: 400, body: JSON.stringify({ error: `Cantidad inválida para ${p.nombre}` }) };
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
    return { statusCode: 500, body: JSON.stringify({ error: "No se pudo crear el pedido" }) };
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

  const siteUrl    = process.env.SITE_URL || process.env.URL;
  const netlifyUrl = process.env.URL;

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
        auto_return: "approved",
        statement_descriptor: "Joyería Aravena",
        external_reference: String(pedido.id),
        notification_url: `${netlifyUrl}/.netlify/functions/mp-webhook`
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        init_point: response.init_point,
        pedidoId: pedido.id
      })
    };
  } catch (err) {
    console.error("[crear-preferencia] Error MP:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Error al crear preferencia" }) };
  }
};
