from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

# ====================================================================
# MODELO 1: EMPRESA (Tu Empresa, ej: Yajasa Technology)
# ====================================================================
# Este es el modelo para TU empresa (el emisor).
# Tu modelo Cotizacion se refería a este con 'default=1'.
# Estos son los datos que "sembramos" (seeded) en la base de datos.
# ====================================================================
class Empresa(models.Model):
    nombre = models.CharField(max_length=255)
    rut = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Mi Empresa"
        verbose_name_plural = "Mi Empresa"

    def __str__(self):
        return self.nombre

# ====================================================================
# MODELO 2: CLIENTE (¡NUEVO!)
# ====================================================================
# Esta es la nueva tabla que soluciona tu problema.
# Almacenará a tus clientes de forma única.
# ====================================================================
class Cliente(models.Model):
    # Estos campos vienen de tu 'Cotizacion' original
    nombre_contacto = models.CharField(max_length=200) # Reemplaza a 'cliente_nombre'
    empresa = models.CharField(max_length=200, blank=True) # Reemplaza a 'cliente_empresa'
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True) # Reemplaza a 'cliente_email'
    telefono = models.CharField(max_length=20, blank=True) # Reemplaza a 'cliente_telefono'
    direccion = models.CharField(max_length=255, blank=True) # Reemplaza a 'cliente_direccion'
    
    creado_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['empresa', 'nombre_contacto']
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self):
        # Muestra el nombre de la empresa, o el nombre de contacto si no hay empresa
        return self.empresa or self.nombre_contacto

# ====================================================================
# MODELO 3: COTIZACION (Refactorizado)
# ====================================================================
# Este es tu modelo 'Cotizacion' original, pero "limpiado".
# Hemos eliminado todos los campos 'cliente_*' y los hemos
# reemplazado por una única conexión (ForeignKey) al modelo 'Cliente'.
# ====================================================================
class Cotizacion(models.Model):
    
    numero = models.PositiveIntegerField(unique=True, editable=False)
    fecha = models.DateField(auto_now_add=True)
    
    # Este es el ForeignKey a TU empresa (Yajasa, ID=1)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, default=1)
    
    # --- ¡ESTE ES EL GRAN CAMBIO! ---
    # Todos los campos 'cliente_*' se han ido y son reemplazados por esto.
    # 'on_delete=models.PROTECT' evita que borres un cliente si
    # todavía tiene cotizaciones asociadas.
    cliente = models.ForeignKey(
        Cliente, 
        on_delete=models.PROTECT, 
        related_name="cotizaciones",
        null=True,  # Le dice a la BASE DE DATOS que permita valores nulos
        blank=True  # Le dice a DJANGO (ej. el admin) que permita el campo vacío
    )
    
    # --- LOS CAMPOS 'cliente_*' HAN SIDO ELIMINADOS DE AQUÍ ---
    
    # Detalles de la cotización (Estos se quedan igual)
    asunto = models.CharField(max_length=200, default="Cotización de Servicios")
    observaciones = models.TextField(blank=True)
    tiempo_entrega = models.CharField(
        max_length=200, 
        default="1 Día, Esperando que la oferta sea de su aceptación"
    )
    
    # Totales (Estos se quedan igual)
    subtotal = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    iva = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    creada_en = models.DateTimeField(auto_now_add=True)
    actualizada_en = models.DateTimeField(auto_now=True)
    activa = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-numero']
        verbose_name = "Cotización"
        verbose_name_plural = "Cotizaciones"
    
    def save(self, *args, **kwargs):
        # Asigna el número de cotización si es nueva
        if not self.numero:
            ultimo_numero = Cotizacion.objects.aggregate(
                max_numero=models.Max('numero')
            )['max_numero']
            self.numero = (ultimo_numero or 0) + 1
        
        # Guarda la cotización (primera vez)
        super().save(*args, **kwargs)
        
        # Recalcula los totales basados en los items y vuelve a guardar
        # (Tu lógica original estaba bien, la mantenemos)
        if self.pk:
            self.calcular_totales()
            # Optimizamos tu lógica: solo guardamos si los totales cambiaron
            # para evitar un bucle infinito de guardado.
            Cotizacion.objects.filter(pk=self.pk).update(
                subtotal=self.subtotal,
                iva=self.iva,
                total=self.total
            )

    def calcular_totales(self):
        # Esta función depende de 'ItemCotizacion.related_name="items"'
        if self.pk:
            items = self.items.all()
            self.subtotal = sum(item.total for item in items) if items else Decimal('0.00')
            self.iva = self.subtotal * Decimal('0.19')
            self.total = self.subtotal + self.iva
    
    def __str__(self):
        # 'self.cliente' ahora es un objeto, por eso podemos usar str(self.cliente)
        return f"Cotización #{self.numero} - {str(self.cliente)}"

# ====================================================================
# MODELO 4: ITEMCOTIZACION (¡NUEVO!)
# ====================================================================
# Tu 'Cotizacion.calcular_totales' dependía de 'self.items.all()'.
# Este modelo crea esos "items".
# ====================================================================
class ItemCotizacion(models.Model):
    cotizacion = models.ForeignKey(
        Cotizacion, 
        on_delete=models.CASCADE, 
        related_name="items"  # <-- Esto permite usar 'self.items.all()'
    )
    descripcion = models.CharField(max_length=255, null=True, blank=True)
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        default=Decimal('0.00')
    )
    total = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        default=Decimal('0.00'),
        editable=False # Se calcula automáticamente
    )
    
    def save(self, *args, **kwargs):
        # Calcula el total de este item
        self.total = Decimal(self.cantidad) * self.precio_unitario
        super().save(*args, **kwargs)
        # NOTA: No llamamos a self.cotizacion.save() aquí
        # para evitar un bucle. La lógica de 'crear_cotizacion_completa'
        # debe ser la que llame a 'cotizacion.save()' al final.

    def __str__(self):
        return f"{self.cantidad} x {self.descripcion} (para Cotización #{self.cotizacion.numero})"