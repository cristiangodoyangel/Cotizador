from django.contrib import admin
from .models import Empresa, Cotizacion, ItemCotizacion


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'email', 'telefono')
    search_fields = ('nombre', 'rut', 'email')


class ItemCotizacionInline(admin.TabularInline):
    model = ItemCotizacion
    extra = 1
    fields = ('item_numero', 'cantidad', 'caracteristica', 'valor_unitario', 'total')
    readonly_fields = ('total',)


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    list_display = (
        'numero', 'fecha', 'cliente_nombre', 'cliente_empresa', 
        'subtotal', 'total', 'activa'
    )
    list_filter = ('fecha', 'activa', 'empresa')
    search_fields = (
        'numero', 'cliente_nombre', 'cliente_empresa', 
        'cliente_email', 'asunto'
    )
    readonly_fields = ('numero', 'subtotal', 'iva', 'total', 'creada_en', 'actualizada_en')
    inlines = [ItemCotizacionInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero', 'fecha', 'empresa', 'asunto')
        }),
        ('Información del Cliente', {
            'fields': ('cliente_nombre', 'cliente_empresa', 'cliente_email', 'cliente_telefono')
        }),
        ('Detalles', {
            'fields': ('observaciones', 'tiempo_entrega')
        }),
        ('Totales', {
            'fields': ('subtotal', 'iva', 'total'),
            'classes': ('collapse',)
        }),
        ('Control', {
            'fields': ('activa', 'creada_en', 'actualizada_en'),
            'classes': ('collapse',)
        })
    )


@admin.register(ItemCotizacion)
class ItemCotizacionAdmin(admin.ModelAdmin):
    list_display = (
        'cotizacion', 'item_numero', 'cantidad', 
        'caracteristica', 'valor_unitario', 'total'
    )
    list_filter = ('cotizacion__fecha',)
    search_fields = ('caracteristica', 'cotizacion__numero')
    readonly_fields = ('total',)
