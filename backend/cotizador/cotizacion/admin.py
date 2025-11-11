# En cotizacion/admin.py

from django.contrib import admin
from .models import Empresa, Cliente, Cotizacion, ItemCotizacion

# 1. (Opcional) Registra el modelo de tu Empresa (Yajasa)
@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'email', 'telefono')

# 2. (¡NUEVO!) Registra el nuevo modelo Cliente
@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'nombre_contacto', 'email', 'telefono')
    search_fields = ('empresa', 'nombre_contacto', 'email')
    list_filter = ('creado_en',)

# 3. (CORREGIDO) Define los 'items' para que aparezcan DENTRO de la cotización
#    Esto es mucho más útil para el admin.
class ItemCotizacionInline(admin.TabularInline):
    model = ItemCotizacion
    # Usamos los nombres de campo correctos del modelo
    fields = ('descripcion', 'cantidad', 'precio_unitario', 'total')
    readonly_fields = ('total',) # El total se calcula solo
    extra = 1 # Empieza con 1 línea de item vacía

# 4. (CORREGIDO) Registra el modelo Cotizacion
@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    # Muestra los 'items' dentro de la página de detalle de la cotización
    inlines = [ItemCotizacionInline]

    # ¡list_display CORREGIDO!
    # 'cliente' es el nuevo campo ForeignKey
    list_display = ('numero', 'fecha', 'cliente', 'asunto', 'total', 'activa')
    
    list_filter = ('fecha', 'activa', 'cliente')
    
    # ¡search_fields CORREGIDO!
    # Buscamos usando la relación ForeignKey (ej: 'cliente__empresa')
    search_fields = ('numero', 'cliente__nombre_contacto', 'cliente__empresa', 'asunto')
    
    # Hacemos que los campos de total sean de solo lectura,
    # ya que se calculan automáticamente
    readonly_fields = ('numero', 'subtotal', 'iva', 'total', 'creada_en', 'actualizada_en')