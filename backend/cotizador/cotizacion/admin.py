# En cotizacion/admin.py

from django.contrib import admin
from .models import Empresa, Cliente, Cotizacion, ItemCotizacion


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'email', 'telefono')


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'nombre_contacto', 'email', 'telefono')
    search_fields = ('empresa', 'nombre_contacto', 'email')
    list_filter = ('creado_en',)

class ItemCotizacionInline(admin.TabularInline):
    model = ItemCotizacion

    fields = ('descripcion', 'cantidad', 'precio_unitario', 'total')
    readonly_fields = ('total',) 
    extra = 1 

@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):

    inlines = [ItemCotizacionInline]

    list_display = ('numero', 'fecha', 'cliente', 'asunto', 'total', 'activa')
    
    list_filter = ('fecha', 'activa', 'cliente')

    search_fields = ('numero', 'cliente__nombre_contacto', 'cliente__empresa', 'asunto')
    

    readonly_fields = ('numero', 'subtotal', 'iva', 'total', 'creada_en', 'actualizada_en')