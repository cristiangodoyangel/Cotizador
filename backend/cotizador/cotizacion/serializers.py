

from rest_framework import serializers
from .models import Cotizacion, Cliente, ItemCotizacion, Empresa

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['nombre', 'rut', 'direccion', 'telefono', 'email']


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente

        fields = ['id', 'nombre_contacto', 'empresa', 'email', 'telefono', 'direccion']


class ItemCotizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCotizacion
        exclude = ['cotizacion']


class CotizacionSerializer(serializers.ModelSerializer):

    cliente = ClienteSerializer(read_only=True)
    

    items = ItemCotizacionSerializer(many=True, read_only=True)

    empresa = EmpresaSerializer(read_only=True)

    class Meta:
        model = Cotizacion

        fields = [
            'id', 'numero', 'fecha', 'cliente', 'empresa', 'asunto', 
            'observaciones', 'tiempo_entrega', 'subtotal', 'iva', 'total', 
            'items', 'creada_en'
        ]