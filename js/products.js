const productos = [

  // ── COLLARES ──────────────────────────────────────────────────────────────
  {
    id: 1,
    nombre: "Lote Collares Plata",
    categoria: "collares",
    material: "plata",
    precio: 120000,
    imagen: "img/0c821da0-36cf-4db8-9a93-03506539f6cd.jpg",
    descripcion: "Lote de collares de plata italiana. Variedad de estilos: figaro, cubana, singapur, calabrote y más."
  },
  {
    id: 2,
    nombre: "Lote Collares Hombre",
    categoria: "collares",
    material: "plata",
    precio: 53900,
    imagen: "img/2c2a6b23-bceb-475e-9621-74791a98030c.jpg",
    descripcion: "Lote 7 collares de hombre + 1 rosario. Cadenas gruesas estilo figaro, cubana, marinera y más."
  },
  {
    id: 3,
    nombre: "Lote GoldFit Collares",
    categoria: "collares",
    material: "oro",
    precio: 38990,
    imagen: "img/2ffd5b0d-5981-4845-8a55-48f9b68565c2.jpg",
    descripcion: "Lote collares oro GoldFit con colgantes: flor, lazo, Mickey Mouse, llave y más diseños únicos."
  },
  {
    id: 4,
    nombre: "Lote Collares Oro Goldfield",
    categoria: "collares",
    material: "oro",
    precio: 37990,
    imagen: "img/3f272a20-56b7-4caa-979d-fb2aaab49e05.jpg",
    descripcion: "Lote collares oro goldfield italiano con colgantes rosados: mariposa, lazo, corazón y más."
  },
  {
    id: 5,
    nombre: "Lote Full Pink",
    categoria: "collares",
    material: "plata",
    precio: 38990,
    imagen: "img/7ff19d3a-f2d8-4a4b-84fd-fcbacc5573c3.jpg",
    descripcion: "Lote 6 collares full pink con colgantes: osito, trébol, corazón, mariposa y flor con zircones rosas."
  },
  {
    id: 6,
    nombre: "Lote Pink",
    categoria: "collares",
    material: "plata",
    precio: 22900,
    imagen: "img/4adeca66-ac55-468d-9472-26063dd7ccab.jpg",
    descripcion: "Lote 4 collares en tono rosa con colgantes de flor, mariposa y corazón con zircones."
  },
  {
    id: 7,
    nombre: "Lote Red",
    categoria: "collares",
    material: "plata",
    precio: 22900,
    imagen: "img/4e090810-ac4a-43ed-882c-4af7616b921a.jpg",
    descripcion: "Lote 6 collares en tono rojo con colgantes: trébol, corazón, ojo turco y van cleef."
  },
  {
    id: 8,
    nombre: "Lote Red Premium",
    categoria: "collares",
    material: "plata",
    precio: 21990,
    imagen: "img/6ca1e80e-491d-48ab-9929-4afbdc36c975.jpg",
    descripcion: "Lote 4 collares rojos premium con colgantes: trébol rojo, nudo de brujas, van cleef y mariposa."
  },
  {
    id: 9,
    nombre: "Lote Pink & Blue",
    categoria: "collares",
    material: "plata",
    precio: 20900,
    imagen: "img/5ba91c66-e9ed-4e06-8739-d0905247d9eb.jpg",
    descripcion: "Lote 7 collares en tonos rosa y azul con colgantes van cleef y corazones de zircones."
  },
  {
    id: 10,
    nombre: "Lote Ricky Ricon",
    categoria: "collares",
    material: "plata",
    precio: 33990,
    imagen: "img/7c9b037b-e86e-478f-8bda-69a922cce7fe.jpg",
    descripcion: "Lote 6 collares estilo Ricky Ricon con colgantes: mariposa verde, trébol, corazón y corona Rolex."
  },
  {
    id: 11,
    nombre: "Lote Nudo de Brujas Pink",
    categoria: "collares",
    material: "plata",
    precio: 21900,
    imagen: "img/0ad051dd-2eef-4aa9-a4ae-061266f7b381.jpg",
    descripcion: "Lote 6 collares Nudo de Brujas en rosa con zircones y piedras naturales. Diseño místico exclusivo."
  },
  {
    id: 12,
    nombre: "Lote Día de la Madre",
    categoria: "collares",
    material: "plata",
    precio: 22990,
    imagen: "img/0bd6aa72-90ad-4bcf-ab38-91758e56134f.jpg",
    descripcion: "Lote especial Día de la Madre. 4 collares con colgantes: osito, corazón y flor con zircones rosas."
  },
  {
    id: 13,
    nombre: "Lote 10 Collares Pink",
    categoria: "collares",
    material: "plata",
    precio: 38900,
    imagen: "img/5c3db5e4-6426-4714-9f87-f3c81384cf86.jpg",
    descripcion: "Lote 10 collares con colgantes variados en tono rosado. Presentados en exhibidor de madera incluido."
  },

  // ── PULSERAS ──────────────────────────────────────────────────────────────
  {
    id: 14,
    nombre: "Lote 30 Pulseras + Exhibidor",
    categoria: "pulseras",
    material: "plata",
    precio: 65990,
    imagen: "img/13ccff1a-2573-4001-85b0-c613f948afe8.jpg",
    descripcion: "Lote 30 pulseras variadas + exhibidor de regalo. Ideal para reventa. Diseños únicos y modernos."
  },
  {
    id: 15,
    nombre: "Mega Lote Pulseras + Exhibidor",
    categoria: "pulseras",
    material: "plata",
    precio: 69990,
    imagen: "img/8be661b1-cb30-41d1-b67d-c8cdb78a67e8.jpg",
    descripcion: "Gran lote pulseras variadas + exhibidor de regalo. Incluye tenis, cadenas, dijes y más diseños."
  },
  {
    id: 16,
    nombre: "Lote Pulseras",
    categoria: "pulseras",
    material: "plata",
    precio: 21990,
    imagen: "img/7e26e9c8-781c-4c42-8d3d-f9e3b79d3734.jpg",
    descripcion: "Lote 5 pulseras finas con tréboles y brillantes. Diseño elegante y delicado para uso diario."
  },
  {
    id: 17,
    nombre: "Pulseras Exclusivas",
    categoria: "pulseras",
    material: "plata",
    precio: 5000,
    imagen: "img/1E345D2F-4FC1-401C-92D9-12AC728ABB0E.jpg",
    descripcion: "Pulseras tenis de colores multicolor. Desde 2x $5.000 / 5x $10.000 / 10x $18.900 / 20x $32.900."
  },
  {
    id: 18,
    nombre: "Lote Pulseras Van Cleef",
    categoria: "pulseras",
    material: "plata",
    precio: 25900,
    imagen: "img/5a35aeaf-b819-44f9-864a-effa2f2e8d47.jpg",
    descripcion: "Lote pulseras estilo Van Cleef en colores fucsia, rosado, negro y blanco. Cadena con tréboles."
  },
  {
    id: 19,
    nombre: "Combi Pololos Oro Goldfit",
    categoria: "pulseras",
    material: "oro",
    precio: 19990,
    imagen: "img/4dd8e190-774b-44cf-901e-722e4509195b.jpg",
    descripcion: "Set de 2 pulseras para parejas en oro GoldFit italiano. Rosa y negro con trébol Van Cleef. + cajitas de regalo."
  },
  {
    id: 20,
    nombre: "Lote Conjuntos Van Cleef Pink",
    categoria: "pulseras",
    material: "plata",
    precio: 24990,
    imagen: "img/3fbdac16-5948-439f-a41c-c8465c8364ba.jpg",
    descripcion: "Lote conjunto Van Cleef pink: 3 pulseras + 5 pares de aritos. Diseño delicado en tono rosado."
  },
  {
    id: 21,
    nombre: "Pulseras Tenis",
    categoria: "pulseras",
    material: "plata",
    precio: 57990,
    imagen: "img/15E65BE2-47ED-450F-9010-F3EF38E85CB5.jpg",
    descripcion: "Lote pulseras tenis con piedras de colores y diseños variados. Presentados en exhibidor azul."
  },
  {
    id: 22,
    nombre: "Pulseras Multicolor",
    categoria: "pulseras",
    material: "plata",
    precio: 46900,
    imagen: "img/3B994FB2-D4C0-4ACB-863D-A09D19758F79.jpg",
    descripcion: "Lote pulseras tenis de colores: celeste, blanco, rojo, azul, rosa y más. Estilo tennis bracelet."
  },
  {
    id: 23,
    nombre: "Lote Pulseras Finas",
    categoria: "pulseras",
    material: "plata",
    precio: 3900,
    imagen: "img/4f596b51-dd57-4b14-aa82-c9c2d33427d2.jpg",
    descripcion: "Lote 4 pulseras cadena fina tipo singapur plateadas. Ideales para uso diario o regalo."
  },
  {
    id: 24,
    nombre: "5 Tobilleras",
    categoria: "pulseras",
    material: "plata",
    precio: 12900,
    imagen: "img/8cc954f7-a3a6-4de3-8f4b-ba3e0b922882.jpg",
    descripcion: "Lote 5 tobilleras con dijes y piedras de colores. Diseños variados para lucir en el tobillo."
  },

  // ── AROS ─────────────────────────────────────────────────────────────────
  {
    id: 25,
    nombre: "Lote Aritos",
    categoria: "aros",
    material: "plata",
    precio: 10000,
    imagen: "img/0c30f05a-410a-4cd8-998e-2046e05c2f8c.jpg",
    descripcion: "Lote aritos con zircones de colores: celeste, blanco, rosado, rojo y verde. Diseños variados."
  },
  {
    id: 26,
    nombre: "Lote Aritos Celestes",
    categoria: "aros",
    material: "plata",
    precio: 16900,
    imagen: "img/0cd72d6d-8390-4088-a363-61e6da1eb3aa.jpg",
    descripcion: "Lote 8 pares aritos en tono celeste y azul: trébol, triángulo, mariposa, corazón y oso."
  },
  {
    id: 27,
    nombre: "Super Lote Argollas",
    categoria: "aros",
    material: "plata",
    precio: 52900,
    imagen: "img/7d8c6bc4-d467-4be6-a04f-8f565755367f.jpg",
    descripcion: "Super lote +20 pares de argollas plateadas en distintos tamaños y diseños. Ideal para reventa."
  },
  {
    id: 28,
    nombre: "5 Par Argollas Oro 18K",
    categoria: "aros",
    material: "oro",
    precio: 32900,
    imagen: "img/3CF27708-7025-4E18-8667-32B94B7E49C4.jpg",
    descripcion: "5 pares de argollas en oro laminado 18K italiano: grandes, texturizadas, ojo turco, corazón y minimalista."
  },
  {
    id: 29,
    nombre: "Lote Argollas Oro Goldfit",
    categoria: "aros",
    material: "oro",
    precio: 32900,
    imagen: "img/7d604d26-5d00-4a02-b0a8-c565552749aa.jpg",
    descripcion: "5 pares de argollas en oro GoldFit italiano: grandes, con brillo, ojo, corazón y argolla pequeña."
  },
  {
    id: 30,
    nombre: "Aritos Italianos",
    categoria: "aros",
    material: "plata",
    precio: 19890,
    imagen: "img/7c5437c6-d07d-42b1-80c9-51f282232381.jpg",
    descripcion: "Aritos italianos finos tipo argolla delgada. Hechos en Italia, presentados en caja plástica."
  },

  // ── COLGANTES ─────────────────────────────────────────────────────────────
  {
    id: 31,
    nombre: "Lote Colgantes",
    categoria: "colgantes",
    material: "variado",
    precio: 39990,
    imagen: "img/08d0136b-ea86-4534-af03-43d5e983ef58.jpg",
    descripcion: "Lote +13 colgantes variados: Superman, Ferrari, Lamborghini, Jesucristo, Virgen, mariposa y más."
  },
  {
    id: 32,
    nombre: "Lote Colgantes Luxury",
    categoria: "colgantes",
    material: "plata",
    precio: 34900,
    imagen: "img/0f17a235-fcd6-48af-bfe2-5402b400dc4c.jpg",
    descripcion: "Lote 9 colgantes luxury rosa: osito, colibrí, corazón, flor, mariposa y trébol con zircones."
  },
  {
    id: 33,
    nombre: "Remate Colgantes 17x",
    categoria: "colgantes",
    material: "variado",
    precio: 10000,
    imagen: "img/3d61a4fe-a504-4eca-bdbd-f3a969e17d37.jpg",
    descripcion: "Remate 17 colgantes variados: trébol azul, mariposa, ojo turco, corazón, calavera y más. ¡Hasta agotar stock!"
  },
  {
    id: 34,
    nombre: "Lote Colgantes Pink",
    categoria: "colgantes",
    material: "plata",
    precio: 13900,
    imagen: "img/6FB3BA99-B299-4148-B47E-BFE2CA093FF9_ADB2AF68-0615-4357-B916-715F89040C94.jpg",
    descripcion: "Lote 6 colgantes rosas: flor, trébol Barbie, mariposa rosa, mariposa blanca y lazo con zircones."
  },

  // ── CONJUNTOS ────────────────────────────────────────────────────────────
  {
    id: 35,
    nombre: "Lote Conjuntos Plata Nacional SL 925",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 0,
    imagen: "img/0f34b29d-e760-4b8b-b2b3-e4aba61eb70d.jpg",
    descripcion: "Lote de conjuntos en Plata Nacional SL 925. Incluye collar + pulsera + aros a juego. Consultar disponibilidad y precio."
  },
  {
    id: 48,
    nombre: "Lote Conjuntos Plata Italiana",
    categoria: "conjuntos",
    material: "plata-italiana",
    precio: 0,
    imagen: "img/0f34b29d-e760-4b8b-b2b3-e4aba61eb70d.jpg",
    descripcion: "Lote de conjuntos en Plata Italiana de alta calidad. Incluye collar + pulsera + aros a juego. Consultar disponibilidad y precio."
  },
  {
    id: 49,
    nombre: "Lote Conjuntos Oro Gold Fit 18K",
    categoria: "conjuntos",
    material: "oro",
    precio: 0,
    imagen: "img/0f34b29d-e760-4b8b-b2b3-e4aba61eb70d.jpg",
    descripcion: "Lote de conjuntos en Oro Gold Fit 18K italiano. Incluye collar + pulsera + aros a juego. Consultar disponibilidad y precio."
  },

  // ── ANILLOS ───────────────────────────────────────────────────────────────
  {
    id: 36,
    nombre: "Lote Anillos",
    categoria: "anillos",
    material: "plata",
    precio: 20000,
    imagen: "img/02AA2CCE-EF2D-44EF-ADDA-6A759E156DB2.jpg",
    descripcion: "Lote 2 rollos de anillos surtidos con zircones blancos y de colores. Diseños variados plateados."
  },
  {
    id: 37,
    nombre: "Lote Anillos Premium",
    categoria: "anillos",
    material: "plata",
    precio: 64990,
    imagen: "img/3E191369-2F5F-4972-8E84-3BCA8E241692.jpg",
    descripcion: "Lote 7 anillos premium con zircones: solitario, marquesa, halo, twist y diseños exclusivos."
  },

  // ── EXHIBIDORES Y ACCESORIOS ──────────────────────────────────────────────
  {
    id: 38,
    nombre: "Exhibidor Mini Joyero",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 3000,
    imagen: "img/03E2357D-6181-4E68-8598-3F74418C5C60.jpg",
    descripcion: "Mini joyero portátil rosado con compartimentos para anillos, aretes y collares. $3.000 c/u | 2x$5.000."
  },
  {
    id: 39,
    nombre: "Exhibidor Maleta Mediana",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 12000,
    imagen: "img/3F191541-314B-43A1-A7CC-A727C03CCD9C.jpg",
    descripcion: "Maleta exhibidor mediana con interior rosado/rojo, divisiones para anillos, aretes y collares. $12.000 c/u | 2x$20.000."
  },
  {
    id: 40,
    nombre: "Exhibidor Conjuntos",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 15900,
    imagen: "img/5A3440C8-84C0-485F-AFC8-9F7F8FD9604C.jpg",
    descripcion: "Exhibidor para conjuntos de joyería en terciopelo rosa con tapa de vidrio. Perfecto para mostrar tus lotes."
  },
  {
    id: 41,
    nombre: "Exhibidor de Aros y Conjuntos",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/9EBBA6AE-9B95-47B0-920D-B4CE74011CF2.jpg",
    descripcion: "Panel exhibidor de aros y conjuntos con 5 hileras de ganchos. Ideal para tienda o feria. $5.000 c/u."
  },
  {
    id: 42,
    nombre: "Mini Joyero Nudo de Bruja",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 27990,
    imagen: "img/4f18eb27-3ecf-4fe7-a959-c3601000d209.jpg",
    descripcion: "Set mini joyero con colección Nudo de Bruja: 2 collares, 2 pulseras y 2 pares de aretes incluidos."
  },
  {
    id: 43,
    nombre: "Medidor de Anillos",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/6C217B0D-183D-44E7-A75E-C70A0DB2DB66.jpg",
    descripcion: "Medidor profesional de anillos en barra metálica. Con tallas del 52 al 76. $5.000 c/u."
  },
  {
    id: 44,
    nombre: "Paños de Pulir 12x",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/6DB22004-301F-4EB3-B7E7-E60600581D6F.jpg",
    descripcion: "Pack 12 paños de pulir alta calidad para joyería. Limpian plata y oro sin rayar. 12 paños x $5.000."
  },
  {
    id: 45,
    nombre: "Manga Exhibidor Mediana",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 7500,
    imagen: "img/7fd959c0-b31d-4f81-9773-8139a9aff462.jpg",
    descripcion: "Manga exhibidor mediana en terciopelo rojo para pulseras y collares. Con ganchos y compartimentos."
  },
  {
    id: 46,
    nombre: "Gramera Estilo Libro",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 12000,
    imagen: "img/5B5E75CE-C961-49D8-93B1-7DD22D873D77.jpg",
    descripcion: "Gramera digital estilo libro 500g. Pesa hasta 500g con precisión de 0.01g. $12.000 c/u | 2x$20.000."
  },
  {
    id: 47,
    nombre: "Cuello Exhibidor Terciopelo",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5900,
    imagen: "img/7C6F6F39-C66B-4C83-A3BC-E301A2E35C61.jpg",
    descripcion: "Cuello exhibidor de terciopelo 25cm en negro o rojo. Ideal para mostrar collares. $5.900 c/u | 2x$10.000."
  }

];
