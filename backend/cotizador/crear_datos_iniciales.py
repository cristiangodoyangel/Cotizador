"""
Script para crear datos iniciales de la aplicación
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotizador.settings')
django.setup()

from cotizacion.models import Empresa, Cotizacion, ItemCotizacion
from decimal import Decimal

def crear_datos_iniciales():
    """Crea los datos iniciales para la aplicación"""
    
    # Crear la empresa por defecto
    empresa, created = Empresa.objects.get_or_create(
        pk=1,
        defaults={
            'nombre': 'Yajasa Technology',
            'rut': '77.182.974-0',
            'direccion': 'Uribe 636 of 707, C. de Negocios, Antofagasta',
            'telefono': '+569-42920058',
            'email': 'Yajasa.technology@gmail.com',
        }
    )
    
    if created:
        print(f"✅ Empresa creada: {empresa.nombre}")
    else:
        print(f"ℹ️ Empresa ya existe: {empresa.nombre}")
    
    # Crear una cotización de ejemplo
    if not Cotizacion.objects.exists():
        cotizacion = Cotizacion.objects.create(
            empresa=empresa,
            cliente_nombre="Juan Pérez",
            cliente_empresa="Empresa Ejemplo S.A.",
            cliente_email="juan@ejemplo.com",
            cliente_telefono="+569-12345678",
            asunto="Desarrollo de Sistema Web",
            observaciones="Cotización para el desarrollo de un sistema web personalizado.",
            tiempo_entrega="15 días hábiles, esperando que la oferta sea de su aceptación"
        )
        
        # Crear items de ejemplo
        ItemCotizacion.objects.create(
            cotizacion=cotizacion,
            item_numero=1,
            cantidad=1,
            caracteristica="Desarrollo Frontend con React/Astro - Diseño responsive y moderno",
            valor_unitario=Decimal('500000')
        )
        
        ItemCotizacion.objects.create(
            cotizacion=cotizacion,
            item_numero=2,
            cantidad=1,
            caracteristica="Desarrollo Backend con Django - API REST y panel administrativo",
            valor_unitario=Decimal('750000')
        )
        
        ItemCotizacion.objects.create(
            cotizacion=cotizacion,
            item_numero=3,
            cantidad=1,
            caracteristica="Base de datos MySQL - Configuración y optimización",
            valor_unitario=Decimal('150000')
        )
        
        # Recalcular totales
        cotizacion.calcular_totales()
        cotizacion.save()
        
        print(f"✅ Cotización de ejemplo creada: #{cotizacion.numero}")
        print(f"   Total: ${cotizacion.total:,.0f}".replace(',', '.'))
    else:
        print("ℹ️ Ya existen cotizaciones en el sistema")
    
    print("\n🎉 Datos iniciales creados correctamente!")
    print(f"👥 Empresa: {empresa.nombre}")
    print(f"📊 Cotizaciones: {Cotizacion.objects.count()}")
    print(f"📝 Items: {ItemCotizacion.objects.count()}")

if __name__ == '__main__':
    crear_datos_iniciales()