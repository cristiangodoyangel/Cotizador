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
    """Genera el PDF de una cotización"""
    
    # Crear la respuesta HTTP
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="cotizacion_{cotizacion.numero}.pdf"'
    
    # Crear el documento PDF
    doc = SimpleDocTemplate(response, pagesize=A4)
    story = []
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Estilo personalizado para el título
    titulo_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#2E3B4E')
    )
    
    # Estilo para información de empresa
    empresa_style = ParagraphStyle(
        'EmpresaStyle',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_LEFT,
        spaceAfter=6
    )
    
    # Estilo para información del cliente
    cliente_style = ParagraphStyle(
        'ClienteStyle',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=8,
        leftIndent=20
    )
    
    # Encabezado con información de la empresa
    empresa_info = [
        [f"<b>{cotizacion.empresa.nombre}</b>"],
        [f"RUT: {cotizacion.empresa.rut}"],
        [f"Dirección: {cotizacion.empresa.direccion}"],
        [f"Teléfono: {cotizacion.empresa.telefono}"],
        [f"Email: {cotizacion.empresa.email}"]
    ]
    
    empresa_table = Table(empresa_info, colWidths=[6*inch])
    empresa_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(empresa_table)
    story.append(Spacer(1, 20))
    
    # Título de cotización
    titulo = Paragraph("COTIZACIÓN", titulo_style)
    story.append(titulo)
    
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