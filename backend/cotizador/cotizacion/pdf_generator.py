from django.http import HttpResponse
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from decimal import Decimal
import os
import io


def generar_pdf_cotizacion(cotizacion):
    """Genera el PDF de una cotización con formato personalizado"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="cotizacion_{cotizacion.numero}.pdf"'

    buffer = io.BytesIO()
    width, height = A4


    styles = getSampleStyleSheet()
    color_principal = colors.HexColor('#2E3B4E') 
    color_secundario = colors.HexColor('#4A90E2') 
    color_texto = colors.HexColor('#333333')
    color_gris_claro = colors.HexColor('#F5F5F5')

    styles.add(ParagraphStyle(name='Normal_Right', parent=styles['Normal'], alignment=TA_RIGHT, textColor=color_texto))
    styles.add(ParagraphStyle(name='Body_Right_Bold', parent=styles['Normal'], alignment=TA_RIGHT, fontName='Helvetica-Bold', textColor=color_texto))
    styles.add(ParagraphStyle(name='Titulo', parent=styles['h1'], alignment=TA_CENTER, textColor=color_principal, fontSize=20, spaceAfter=20))
    styles.add(ParagraphStyle(name='Subtitulo', parent=styles['h2'], textColor=color_principal, fontSize=12, spaceBefore=10, spaceAfter=5))
    styles.add(ParagraphStyle(name='Normal_Bold', parent=styles['Normal'], fontName='Helvetica-Bold', textColor=color_texto))

    story = []


    logo_path = os.path.join(settings.BASE_DIR, 'frontend', 'public', 'img', 'logo.png') 
    logo = Image(logo_path, width=2*inch, height=0.8*inch) if os.path.exists(logo_path) else Paragraph("Yajasa Technology", styles['h2'])
    logo.hAlign = 'LEFT'

    info_cotizacion_data = [
        [Paragraph('<b>COTIZACIÓN</b>', styles['Body_Right_Bold']), Paragraph(f"Nº {cotizacion.numero}", styles['Normal_Right'])],
        [Paragraph('<b>Fecha</b>', styles['Body_Right_Bold']), Paragraph(cotizacion.fecha.strftime("%d/%m/%Y"), styles['Normal_Right'])],
    ]
    info_cotizacion_table = Table(info_cotizacion_data, colWidths=[1.5*inch, 1.5*inch])
    info_cotizacion_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
    ]))

    header_table = Table([[logo, info_cotizacion_table]], colWidths=[width/2 - 50, width/2 - 50])
    header_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(header_table)
    story.append(Spacer(1, 0.4*inch))


    empresa_info = f"""
        <b>{cotizacion.empresa.nombre}</b><br/>
        RUT: {cotizacion.empresa.rut}<br/>
        {cotizacion.empresa.direccion}<br/>
        Fono: {cotizacion.empresa.telefono}<br/>
        Email: {cotizacion.empresa.email}
    """
    cliente_info = f"""
        <b>CLIENTE:</b><br/>
        <b>Empresa:</b> {cotizacion.cliente_empresa or 'N/A'}<br/>
        <b>Atención:</b> {cotizacion.cliente_nombre or 'N/A'}<br/>
        <b>Email:</b> {cotizacion.cliente_email or 'N/A'}<br/>
        <b>Teléfono:</b> {cotizacion.cliente_telefono or 'N/A'}
    """
    info_table_data = [[Paragraph(empresa_info, styles['Normal']), Paragraph(cliente_info, styles['Normal'])]]
    info_table = Table(info_table_data, colWidths=[width/2 - 50, width/2 - 50])
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))


    story.append(Paragraph(f"<b>Asunto:</b> {cotizacion.asunto}", styles['Normal_Bold']))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("<b>DETALLE DE LA COTIZACIÓN</b>", styles['Subtitulo']))
    items_data = [[
        Paragraph('<b>Ítem</b>', styles['Normal']),
        Paragraph('<b>Descripción</b>', styles['Normal']),
        Paragraph('<b>Cant.</b>', styles['Normal_Right']),
        Paragraph('<b>V. Unitario</b>', styles['Normal_Right']),
        Paragraph('<b>Total</b>', styles['Normal_Right'])
    ]]

    for item in cotizacion.items.all():
        items_data.append([
            Paragraph(str(item.item_numero), styles['Normal']),
            Paragraph(item.caracteristica, styles['Normal']),
            Paragraph(str(item.cantidad), styles['Normal_Right']),
            Paragraph(f"${item.valor_unitario:,.0f}".replace(',', '.'), styles['Normal_Right']),
            Paragraph(f"${item.total:,.0f}".replace(',', '.'), styles['Normal_Right'])
        ])

    items_table = Table(items_data, colWidths=[0.5*inch, 3.5*inch, 0.7*inch, 1.2*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), color_principal),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.grey),
        ('BOX', (0, 0), (-1, -1), 0.25, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, color_gris_claro]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 0.2*inch))


    totales_data = [
        ['', Paragraph('<b>Valor Neto Total</b>', styles['Body_Right_Bold']), Paragraph(f"${cotizacion.subtotal:,.0f}".replace(',', '.'), styles['Normal_Right'])],
        ['', Paragraph('<b>IVA (19%)</b>', styles['Body_Right_Bold']), Paragraph(f"${cotizacion.iva:,.0f}".replace(',', '.'), styles['Normal_Right'])],
        ['', Paragraph('<b>TOTAL</b>', styles['Body_Right_Bold']), Paragraph(f"<b>${cotizacion.total:,.0f}</b>".replace(',', '.'), styles['Normal_Right'])],
    ]
    totales_table = Table(totales_data, colWidths=[4.9*inch, 1.2*inch, 1.2*inch])
    totales_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEABOVE', (1, 2), (2, 2), 1, color_principal),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(totales_table)
    story.append(Spacer(1, 0.4*inch))


    if cotizacion.observaciones:
        story.append(Paragraph("<b>Observaciones</b>", styles['Subtitulo']))
        story.append(Paragraph(cotizacion.observaciones, styles['Normal']))
        story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Tiempo de Entrega</b>", styles['Subtitulo']))
    story.append(Paragraph(cotizacion.tiempo_entrega, styles['Normal']))
    story.append(Spacer(1, 0.4*inch))

    # --- Footer ---
    def draw_footer(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(color_principal)
        canvas.rect(0, 0, width, 0.5*inch, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica', 9)
        canvas.drawCentredString(width/2, 0.25*inch, f"{cotizacion.empresa.nombre} | {cotizacion.empresa.email} | {cotizacion.empresa.telefono}")
        canvas.restoreState()


    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)

    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    return response