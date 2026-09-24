import autoTable from 'jspdf-autotable';

export function formatEuros(value) {
  return Number(value || 0).toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' });
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function renderCapcalera(doc, titol) {
  doc.setFontSize(18);
  doc.setTextColor(234, 88, 12);
  doc.text(titol, 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generat: ${new Date().toLocaleDateString('ca-ES')}`, 14, 24);
  return 34;
}

/**
 * Pinta la secció d'un projecte (info, cost, hores, materials) al document
 * a partir de la posició Y indicada. Retorna la nova posició Y.
 */
export function renderProjecteSeccio(doc, startY, data) {
  const { proyecto, carpetaNombre, horas, materiales, coste, isSuperuser, nombreUsuario, nombreMaterial, categoriaMaterial } = data;
  let y = startY;

  doc.setFontSize(15);
  doc.setTextColor(234, 88, 12);
  doc.text(proyecto.nombre, 14, y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  if (carpetaNombre) {
    doc.text(`Carpeta: ${carpetaNombre}`, 14, y);
    y += 5;
  }
  if (proyecto.lugar) {
    doc.text(`Lloc: ${proyecto.lugar}`, 14, y);
    y += 5;
  }
  doc.text(`Estat: ${proyecto.estado === 'en_curso' ? 'Actiu' : 'Finalitzat'}`, 14, y);
  y += 5;
  if (proyecto.descripcion) {
    const lines = doc.splitTextToSize(proyecto.descripcion, 180);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 1;
  }
  y += 3;

  if (isSuperuser && coste) {
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(14, y, 182, 15, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(`Mà d'obra: ${formatEuros(coste.coste_mano_obra)}`, 18, y + 6.5);
    doc.text(`Materials: ${formatEuros(coste.coste_materiales)}`, 18, y + 11.5);
    doc.setFontSize(12);
    doc.setTextColor(234, 88, 12);
    doc.text(`Total: ${formatEuros(coste.coste_total)}`, 135, y + 9.5);
    y += 21;
  }

  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text('Hores', 14, y);
  y += 3;

  const totalHoresNum = horas.reduce((sum, h) => sum + Number(h.horas || 0), 0);

  if (horas.length > 0) {
    const head = isSuperuser ? [['Data', 'Usuari', 'Hores', 'Comentari']] : [['Data', 'Hores', 'Comentari']];
    const body = horas.map(h => isSuperuser
      ? [formatDate(h.fecha), nombreUsuario(h.user_id), `${h.horas}h`, h.comentario || '-']
      : [formatDate(h.fecha), `${h.horas}h`, h.comentario || '-']);
    autoTable(doc, {
      startY: y + 2,
      head,
      body,
      headStyles: { fillColor: [234, 88, 12], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 5;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('Sense hores registrades', 14, y + 6);
    y += 12;
  }

  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(`Total hores: ${totalHoresNum.toFixed(2)}h`, 14, y);
  y += 10;

  if (y > 245) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text('Materials', 14, y);
  y += 3;

  if (materiales.length > 0) {
    autoTable(doc, {
      startY: y + 2,
      head: [['Material', 'Categoria', 'Quantitat', 'Preu unitari', 'Subtotal']],
      body: materiales.map(pm => [
        nombreMaterial(pm.material_id),
        categoriaMaterial(pm.material_id) || '-',
        pm.cantidad,
        formatEuros(pm.precio_unitario_aplicado),
        formatEuros(pm.cantidad * pm.precio_unitario_aplicado)
      ]),
      headStyles: { fillColor: [234, 88, 12], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 5;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('Sense materials afegits', 14, y + 6);
    y += 14;
  }

  return y;
}
