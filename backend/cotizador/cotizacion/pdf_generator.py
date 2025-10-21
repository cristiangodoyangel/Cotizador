from django.http import HttpResponse
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from decimal import Decimal
import os
from datetime import datetime


def generar_pdf_cotizacion(cotizacion):
    """Genera el PDF de una cotización con formato personalizado"""
    from reportlab.pdfgen import canvas as canvas_module
    from reportlab.lib.utils import ImageReader
    import io

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="cotizacion_{cotizacion.numero}.pdf"'

    buffer = io.BytesIO()
    c = canvas_module.Canvas(buffer, pagesize=A4)
    width, height = A4


    # --- Imagen superior (top.png) ---
    top_img_path = os.path.join(settings.BASE_DIR, 'frontend', 'public', 'img', 'top.png')
    if os.path.exists(top_img_path):
        # La imagen se dibuja pegada al margen superior (y=altura-imagen)
        c.drawImage(top_img_path, 0, height-80, width=width, height=80, mask='auto', preserveAspectRatio=True)

    # --- Logo ---
    logo_path = os.path.join(settings.BASE_DIR, 'frontend', 'public', 'img', 'logo.png')
    if os.path.exists(logo_path):
        c.drawImage(logo_path, width-170, height-90, width=120, height=50, mask='auto', preserveAspectRatio=True)

    # --- Tabla de empresa ---
    empresa_data = [
        ["Fecha:", cotizacion.fecha.strftime("%d/%m/%Y")],
        ["Empresa:", cotizacion.empresa.nombre],
        ["Rut:", cotizacion.empresa.rut],
        ["Dirección:", cotizacion.empresa.direccion],
        ["Fono:", cotizacion.empresa.telefono],
        ["Email:", cotizacion.empresa.email],
    ]
    from reportlab.platypus import Table, TableStyle
    empresa_table = Table(empresa_data, colWidths=[1.5*inch, 3.5*inch])
    empresa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.grey),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    story = []
    styles = getSampleStyleSheet()
    story.append(Spacer(1, 20))
    story.append(empresa_table)
    story.append(Spacer(1, 10))

    # --- Título COTIZACIÓN ---
    titulo_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=16, alignment=TA_CENTER, textColor=colors.HexColor('#2E3B4E'), spaceAfter=10)
    story.append(Paragraph('<b>COTIZACIÓN</b>', titulo_style))
    story.append(Spacer(1, 5))

    # --- Señores y atención ---
    story.append(Paragraph('<b>Señores:</b>', styles['Normal']))
    story.append(Paragraph('<b>Atención:</b>', styles['Normal']))
    story.append(Spacer(1, 5))

    # --- Mensaje principal ---
    story.append(Paragraph('TENEMOS EL AGRADO DE ENVIAR NUESTRA COTIZACIÓN SEGÚN DETALLE:', styles['Normal']))
    story.append(Spacer(1, 10))

    # --- Tabla de ítems ---
    items_data = [["Ítem", "Cantidad", "Característica"]]
    for item in cotizacion.items.all():
        items_data.append([
            str(item.item_numero),
            str(item.cantidad),
            item.caracteristica
        ])
    items_table = Table(items_data, colWidths=[0.8*inch, 1*inch, 4.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E3B4E')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 10))

    # --- Totales ---
    totales_data = [
        ["", "Valor Neto Total", f"${cotizacion.subtotal:,.0f}".replace(',', '.')],
        ["", "IVA (19%)", f"${cotizacion.iva:,.0f}".replace(',', '.')],
        ["", "Total", f"${cotizacion.total:,.0f}".replace(',', '.')],
    ]
    totales_table = Table(totales_data, colWidths=[0.8*inch, 2.2*inch, 3*inch])
    totales_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (1, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('LINEABOVE', (1, 2), (2, 2), 1, colors.black),
    ]))
    story.append(totales_table)
    story.append(Spacer(1, 10))

    # --- Tiempo de entrega ---
    story.append(Paragraph(f"<b>Tiempo de Entrega de Servicio</b> {cotizacion.tiempo_entrega}", styles['Normal']))
    story.append(Spacer(1, 10))

    # --- Firma ---
    firma_style = ParagraphStyle('Firma', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10, spaceBefore=20)
    story.append(Spacer(1, 30))
    story.append(Paragraph('<u>Yajasa Technology</u>', firma_style))
    story.append(Paragraph('77.182.974-0', firma_style))
    story.append(Spacer(1, 10))

    # --- Nota ---
    nota_style = ParagraphStyle('Nota', parent=styles['Normal'], fontSize=9, spaceBefore=10)
    story.append(Paragraph('<b>NOTA:</b> La fecha de ejecución del servicio se coordinará con el Cliente.', nota_style))

    # --- Footer azul con datos de contacto ---
    def draw_footer(canvas, doc):
        canvas.saveState()
        canvas.setFillColorRGB(0.13, 0.22, 0.38)
        canvas.rect(0, 0, width, 40, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica', 9)
        canvas.drawString(40, 20, f"+56 9 4292 0058    yajasa.technology@gmail.com")
        canvas.restoreState()

    # --- Construir PDF ---
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=120, bottomMargin=60)
    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)

    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    return response
    
    # Información de la cotización
    fecha_formateada = cotizacion.fecha.strftime("%d/%m/%Y")
    
    info_cotizacion = [
        ["Fecha:", fecha_formateada],
        ["Cotización N°:", str(cotizacion.numero)],
        ["Asunto:", cotizacion.asunto]
    ]
    
    if cotizacion.cliente_nombre or cotizacion.cliente_empresa:
        story.append(Paragraph("<b>Señores:</b>", styles['Normal']))
        story.append(Paragraph("<b>Atención:</b>", styles['Normal']))
        
        if cotizacion.cliente_empresa:
            story.append(Paragraph(f"Empresa: {cotizacion.cliente_empresa}", cliente_style))
        if cotizacion.cliente_nombre:
            story.append(Paragraph(f"Contacto: {cotizacion.cliente_nombre}", cliente_style))
        
        story.append(Spacer(1, 10))
    
    story.append(Paragraph("<b>TENEMOS EL AGRADO DE ENVIAR NUESTRA COTIZACIÓN SEGÚN DETALLE:</b>", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Tabla de información de cotización
    info_table = Table(info_cotizacion, colWidths=[1.5*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # Tabla de items
    items_data = [["Item", "Cantidad", "Característica", "Valor Neto Total"]]
    
    for item in cotizacion.items.all():
        items_data.append([
            str(item.item_numero),
            str(item.cantidad),
            item.caracteristica,
            f"${item.total:,.0f}".replace(',', '.')
        ])
    
    items_table = Table(items_data, colWidths=[0.8*inch, 1*inch, 3.5*inch, 1.5*inch])
    items_table.setStyle(TableStyle([
        # Encabezado
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        
        # Contenido
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Item
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),  # Cantidad
        ('ALIGN', (2, 1), (2, -1), 'LEFT'),    # Característica
        ('ALIGN', (3, 1), (3, -1), 'RIGHT'),   # Valor
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        
        # Bordes
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(items_table)
    story.append(Spacer(1, 30))
    
    # Totales
    totales_data = [
        ["Subtotal:", f"${cotizacion.subtotal:,.0f}".replace(',', '.')],
        ["IVA (19%):", f"${cotizacion.iva:,.0f}".replace(',', '.')],
        ["Total:", f"${cotizacion.total:,.0f}".replace(',', '.')]
    ]
    
    totales_table = Table(totales_data, colWidths=[4*inch, 1.5*inch])
    totales_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        # Línea superior para el total
        ('LINEABOVE', (0, 2), (-1, 2), 1, colors.black),
    ]))
    
    story.append(totales_table)
    story.append(Spacer(1, 30))
    
    # Tiempo de entrega
    story.append(Paragraph(f"<b>Tiempo de Entrega:</b> {cotizacion.tiempo_entrega}", styles['Normal']))
    story.append(Spacer(1, 40))
    
    # Observaciones si existen
    if cotizacion.observaciones:
        story.append(Paragraph(f"<b>Observaciones:</b>", styles['Normal']))
        story.append(Paragraph(cotizacion.observaciones, styles['Normal']))
        story.append(Spacer(1, 30))
    
    # Firma
    firma_data = [
        ["", ""],
        [f"<b>{cotizacion.empresa.nombre}</b>", ""],
        [cotizacion.empresa.rut, ""]
    ]
    
    firma_table = Table(firma_data, colWidths=[3*inch, 3*inch])
    firma_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (0, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (0, 0), (0, 0), 1, colors.black),
    ]))
    
    story.append(firma_table)
    story.append(Spacer(1, 30))
    
    # Nota final
    nota = Paragraph(
        "<b>NOTA:</b> La fecha de ejecución del servicio se coordinará con el Cliente.", 
        styles['Normal']
    )
    story.append(nota)
    
    # Generar el PDF
    doc.build(story)
    
    return response