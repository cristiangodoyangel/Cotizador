# En cotizacion/serializers.py

from rest_framework import serializers
from .models import Cotizacion, Cliente, ItemCotizacion, Empresa

# Serializer para TU empresa (Yajasa)
class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['nombre', 'rut', 'direccion', 'telefono', 'email']

# Serializer para el CLIENTE
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        # Lista de campos del modelo Cliente que queremos mostrar
        fields = ['id', 'nombre_contacto', 'empresa', 'email', 'telefono', 'direccion']

# Serializer para los ITEMS (artículos) de una cotización
class ItemCotizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCotizacion
        # Excluimos 'cotizacion' porque se anidará automáticamente
        exclude = ['cotizacion']

# Serializer para la COTIZACIÓN
class CotizacionSerializer(serializers.ModelSerializer):
    # --- ¡Magia de Anidación! ---
    # 1. Le decimos que 'cliente' debe usar el ClienteSerializer
    #    para mostrar los datos completos del cliente, no solo el ID.
    cliente = ClienteSerializer(read_only=True)
    
    # 2. Le decimos que 'items' debe usar el ItemCotizacionSerializer
    #    'many=True' significa que es una lista de items.
    items = ItemCotizacionSerializer(many=True, read_only=True)
    
    # 3. (Opcional) Mostramos los datos de TU empresa (Yajasa)
    empresa = EmpresaSerializer(read_only=True)

    class Meta:
        model = Cotizacion
        # Lista de todos los campos que queremos mostrar
        fields = [
            'id', 'numero', 'fecha', 'cliente', 'empresa', 'asunto', 
            'observaciones', 'tiempo_entrega', 'subtotal', 'iva', 'total', 
            'items', 'creada_en'
        ]