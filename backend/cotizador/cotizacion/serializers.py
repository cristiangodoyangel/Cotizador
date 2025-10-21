from rest_framework import serializers
from .models import Cotizacion, ItemCotizacion, Empresa


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'


class ItemCotizacionSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = ItemCotizacion
        fields = '__all__'


class CotizacionSerializer(serializers.ModelSerializer):
    items = ItemCotizacionSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    iva = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    numero = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cotizacion
        fields = '__all__'


class CotizacionCompletaSerializer(serializers.ModelSerializer):
    """Serializer para crear cotizaciones completas con items"""
    items = ItemCotizacionSerializer(many=True, write_only=True)
    
    class Meta:
        model = Cotizacion
        fields = '__all__'
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        cotizacion = Cotizacion.objects.create(**validated_data)
        
        for item_data in items_data:
            ItemCotizacion.objects.create(cotizacion=cotizacion, **item_data)
        
        return cotizacion