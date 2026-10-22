// ==========================================
// 1. CONFIGURACIÓN DE LA BASE DE DATOS (IndexedDB)
// ==========================================
const db = new Dexie("RestauranteDB");

db.version(1).stores({
  pedidos: '++id, plato, bebida, extras, total, fecha'
});

// ==========================================
// 2. EVENTO DEL FORMULARIO
// ==========================================
document.getElementById('formularioRestaurante').addEventListener('submit', async function(event) {
  event.preventDefault();

  const PRECIOS = {
    pizza: 12.00,
    hamburguesa: 7.50,
    tacos: 8.50,
    pasta: 9.00,
    pequena: 1.00,
    mediana: 1.50,
    grande: 2.00,
    papas: 2.50,
    helado: 1.80,
    postre: 3.00
  };

  let cuentaDetalle = "<strong>🧾 DETALLE DE TU PEDIDO:</strong><br><hr>";
  let total = 0;

  // Capturar Plato
  const platoSelect = document.getElementById('platoPrincipal');
  const plato = platoSelect.value;
  const nombrePlato = platoSelect.options[platoSelect.selectedIndex].text.split("—")[0].trim();
  total += PRECIOS[plato];
  cuentaDetalle += `• ${nombrePlato}: $${PRECIOS[plato].toFixed(2)}<br>`;

  // Capturar Bebida
  const bebidaSeleccionada = document.querySelector('input[name="tamanoBebida"]:checked').value;
  total += PRECIOS[bebidaSeleccionada];
  cuentaDetalle += `• Bebida (${bebidaSeleccionada}): $${PRECIOS[bebidaSeleccionada].toFixed(2)}<br>`;

  // Capturar Extras
  const quierePapas = document.getElementById('extraPapas').checked;
  const quiereHelado = document.getElementById('extraHelado').checked;
  const quierePostre = document.getElementById('extraPostre').checked;
  let listaExtras = [];

  if (quierePapas) {
    total += PRECIOS.papas;
    listaExtras.push("Papas Fritas");
    cuentaDetalle += `• Extra Papas Fritas: $${PRECIOS.papas.toFixed(2)}<br>`;
  }
  if (quiereHelado) {
    total += PRECIOS.helado;
    listaExtras.push("Helado");
    cuentaDetalle += `• Extra Helado: $${PRECIOS.helado.toFixed(2)}<br>`;
  }
  if (quierePostre) {
    total += PRECIOS.postre;
    listaExtras.push("Pastel Chocolate");
    cuentaDetalle += `• Extra Pastel: $${PRECIOS.postre.toFixed(2)}<br>`;
  }

  cuentaDetalle += `<hr><strong>💰 TOTAL A PAGAR: $${total.toFixed(2)}</strong>`;

  // Mostrar el recibo en pantalla
  const areaRecibo = document.getElementById('reciboRespuesta');
  areaRecibo.innerHTML = cuentaDetalle;
  areaRecibo.style.display = "block";

  // Guardar en la Base de Datos (IndexedDB)
  try {
    await db.pedidos.add({
      plato: nombrePlato,
      bebida: bebidaSeleccionada,
      extras: listaExtras.join(", ") || "Ninguno",
      total: total,
      fecha: new Date().toLocaleString()
    });
    console.log("¡Pedido guardado con éxito!");
  } catch (error) {
    console.error("Error al guardar en la base de datos: ", error);
  }
});

// ==========================================
// 3. FUNCIONALIDAD DE ADMINISTRACIÓN (IndexedDB)
// ==========================================
async function actualizarHistorialPantalla() {
  const divHistorial = document.getElementById('tablaHistorial');
  const todosLosPedidos = await db.pedidos.toArray();

  if (todosLosPedidos.length === 0) {
    divHistorial.innerHTML = "<p style='text-align:center; color:#6c757d;'>No hay pedidos registrados todavía.</p>";
    return;
  }

  let htmlContenido = "";
  let gananciasTotales = 0;

  todosLosPedidos.forEach(function(pedido) {
    gananciasTotales += pedido.total;
    htmlContenido += `
      <div class="item-pedido">
        <strong>Pedido #${pedido.id}</strong> — 📅 ${pedido.fecha}<br>
        🍲 Plato: ${pedido.plato} | 🥤 Bebida: ${pedido.bebida}<br>
        🍟 Extras: ${pedido.extras}<br>
        💵 Subtotal: <strong>$${pedido.total.toFixed(2)}</strong>
      </div>
    `;
  });

  htmlContenido = `<strong>💰 Caja Total: $${gananciasTotales.toFixed(2)}</strong><br><hr>` + htmlContenido;
  divHistorial.innerHTML = htmlContenido;
}

// Botón: Mostrar / Ocultar Historial
document.getElementById('btnVerHistorial').addEventListener('click', async function() {
  const divHistorial = document.getElementById('tablaHistorial');
  if (divHistorial.style.display === "none" || divHistorial.style.display === "") {
    await actualizarHistorialPantalla();
    divHistorial.style.display = "block";
  } else {
    divHistorial.style.display = "none";
  }
});

// Botón: Vaciar toda la Base de Datos
document.getElementById('btnBorrarHistorial').addEventListener('click', async function() {
  const confirmar = confirm("⚠ ¿Estás seguro de que deseas eliminar TODOS los pedidos del historial?");
  if (confirmar) {
    await db.pedidos.clear();
    alert("Base de datos vaciada con éxito.");
    actualizarHistorialPantalla();
  }
});