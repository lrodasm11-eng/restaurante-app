// Configuración de IndexedDB con Dexie
const db = new Dexie('RestauranteDB');
db.version(1).stores({
  ventas: '++id, plato, bebida, extras, total, fecha'
});

// Precios
const preciosPlatos = {
  "Tacos de Asada": 6.50,
  "Hamburguesa Doble": 7.50,
  "Burrito Supremo": 8.00,
  "Pizza Personal": 7.00
};

const preciosBebidas = {
  "pequena": 1.00,
  "mediana": 1.75,
  "grande": 2.50
};

const preciosExtras = {
  "Extra Queso": 1.50,
  "Guacamole": 2.00,
  "Papas Fritas": 2.50,
  "Helado Chocolate": 1.80
};

// Evento Submit del Formulario
document.getElementById('formPedido').addEventListener('submit', async function(e) {
  e.preventDefault();

  const plato = document.getElementById('plato').value;
  const bebida = document.querySelector('input[name="bebida"]:checked').value;
  
  // Capturar extras marcados
  const extrasSeleccionados = [];
  let totalExtras = 0;

  if (document.getElementById('extraQueso').checked) {
    extrasSeleccionados.push("Extra Queso");
    totalExtras += preciosExtras["Extra Queso"];
  }
  if (document.getElementById('extraGuacamole').checked) {
    extrasSeleccionados.push("Guacamole");
    totalExtras += preciosExtras["Guacamole"];
  }
  if (document.getElementById('extraPapas').checked) {
    extrasSeleccionados.push("Papas Fritas");
    totalExtras += preciosExtras["Papas Fritas"];
  }
  if (document.getElementById('extraHelado').checked) {
    extrasSeleccionados.push("Helado Chocolate");
    totalExtras += preciosExtras["Helado Chocolate"];
  }

  // Cálculos
  const precioPlato = preciosPlatos[plato] || 0;
  const precioBebida = preciosBebidas[bebida] || 0;
  const total = precioPlato + precioBebida + totalExtras;
  const fechaAhora = new Date().toLocaleString();

  // Guardar en IndexedDB
  await db.ventas.add({
    plato: plato,
    bebida: bebida,
    extras: extrasSeleccionados.length > 0 ? extrasSeleccionados.join(', ') : 'Ninguno',
    total: total,
    fecha: fechaAhora
  });

  // Mostrar Recibo
  const recibo = document.getElementById('reciboRespuesta');
  recibo.style.display = 'block';
  recibo.innerHTML = `
    <strong>🧾 DETALLE DE TU PEDIDO:</strong><br>
    • 🍲 ${plato}: $${precioPlato.toFixed(2)}<br>
    • 🥤 Bebida (${bebida}): $${precioBebida.toFixed(2)}<br>
    • ➕ Extras: ${extrasSeleccionados.length > 0 ? extrasSeleccionados.join(', ') : 'Ninguno'} ($${totalExtras.toFixed(2)})<br>
    <hr style="border: 0; border-top: 1px dashed #ffa502; margin: 8px 0;">
    <strong>💰 TOTAL A PAGAR: $${total.toFixed(2)}</strong>
  `;
});

// Ver Historial
document.getElementById('btnHistorial').addEventListener('click', async function() {
  const historialDiv = document.getElementById('tablaHistorial');
  const todasLasVentas = await db.ventas.toArray();

  if (todasLasVentas.length === 0) {
    historialDiv.style.display = 'block';
    historialDiv.innerHTML = '<p style="text-align:center;">No hay ventas registradas aún.</p>';
    return;
  }

  let cajaTotal = 0;
  let htmlHistorial = '';

  todasLasVentas.forEach(v => {
    cajaTotal += v.total;
    htmlHistorial += `
      <div class="item-pedido">
        <strong>Pedido #${v.id}</strong> — 📅 ${v.fecha}<br>
        🍲 <strong>Plato:</strong> ${v.plato} | 🥤 <strong>Bebida:</strong> ${v.bebida}<br>
        🍟 <strong>Extras:</strong> ${v.extras}<br>
        💵 <strong>Subtotal:</strong> $${v.total.toFixed(2)}
      </div>
    `;
  });

  historialDiv.style.display = 'block';
  historialDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; color: #2ed573; text-align: center;">
      💰 Caja Total: $${cajaTotal.toFixed(2)}
    </div>
    ${htmlHistorial}
  `;
});

// Limpiar Base de Datos
document.getElementById('btnLimpiar').addEventListener('click', async function() {
  if (confirm('¿Estás seguro de que deseas borrar todo el historial de ventas?')) {
    await db.ventas.clear();
    document.getElementById('tablaHistorial').style.display = 'none';
    document.getElementById('reciboRespuesta').style.display = 'none';
    alert('¡Base de datos limpiada con éxito!');
  }
});
