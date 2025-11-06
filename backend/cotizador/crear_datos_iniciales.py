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

    # --- INICIO DE LA MODIFICACIÓN: RESETEO DE DATOS ---
    # Se eliminan todas las cotizaciones y sus items para reiniciar el conteo.
    # La próxima cotización creada tendrá el número 1.
    print("\n⚠️  ADVERTENCIA: Se eliminarán todas las cotizaciones existentes.")
    items_eliminados, _ = ItemCotizacion.objects.all().delete()
    cotizaciones_eliminadas, _ = Cotizacion.objects.all().delete()
    print(f"🗑️  Se eliminaron {cotizaciones_eliminadas} cotizaciones y {items_eliminados} artículos.")
    print("✅  Sistema reseteado. El contador de cotizaciones comenzará en 1.")
    # --- FIN DE LA MODIFICACIÓN ---
    
    # --- INICIO DE LA CORRECCIÓN: RE-CREAR DATOS ESENCIALES ---
    # Volvemos a crear la empresa por defecto para que el sistema funcione.
    print("\n🌱 Creando datos iniciales necesarios...")
    empresa, created = Empresa.objects.get_or_create(
        id=1,
        defaults={
            'nombre': 'Yajasa Technology',
            'rut': '77.182.974-0',
            'direccion': 'Uribe 636 Of 707, Centro Negocios, Antofagasta',
            'telefono': '+56-9-42920058',
            'email': 'yajasa.technology@gmail.com'
        }
    )
    print(f"🏢 Empresa por defecto 'Yajasa Technology' {'creada' if created else 'ya existía'}.")
    # --- FIN DE LA CORRECCIÓN ---
    
if __name__ == '__main__':
    crear_datos_iniciales()