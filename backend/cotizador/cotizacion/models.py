from django.db import models

class Empresa(models.Model):
    nombre = models.CharField(max_length=255) # Yajasa Technology
    rut = models.CharField(max_length=20) # 77.182.974-0
    direccion = models.CharField(max_length=255) # Uribe 636 of 707, C. de Negocios, Antofagasta
    telefono = models.CharField(max_length=20) # +569-42920058
    email = models.EmailField() # Yajasa.technology@gmail.com

    def __str__(self):
        return self.nombre

class Cotizacion(models.Model):
    numero = models.AutoField(primary_key=True)
    fecha = models.DateField(auto_now_add=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='cotizaciones')

    # Información empresa solicitante
    cliente_nombre = models.CharField(max_length=255)
    cliente_empresa = models.CharField(max_length=255)
    cliente_email = models.EmailField()
    cliente_telefono = models.CharField(max_length=20)

    # Detalles de la cotización
    detalle = models.CharField(max_length=255)
    observaciones = models.TextField(blank=True)
    tiempo_entrega = models.CharField(max_length=100)

    # Totales
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    iva = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Control
    creada_en = models.DateTimeField(auto_now_add=True)
    actualizada_en = models.DateTimeField(auto_now=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"Cotización {self.numero} - {self.cliente_nombre}"
from django.core.validators import MinValueValidator
from decimal import Decimal


class Empresa(models.Model):
    nombre = models.CharField(max_length=200, default="Yajasa Technology")
    rut = models.CharField(max_length=20, default="77.182.974-0")
    direccion = models.TextField(default="Uribe 636 of 707, C. de Negocios, Antofagasta")
    telefono = models.CharField(max_length=20, default="+569-42920058")
    email = models.EmailField(default="Yajasa.technology@gmail.com")
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    
    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
    
    def __str__(self):
        return self.nombre


class Cotizacion(models.Model):
    
    numero = models.PositiveIntegerField(unique=True, editable=False)
    fecha = models.DateField(auto_now_add=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, default=1)
    
    # Información del cliente/destinatario
    cliente_nombre = models.CharField(max_length=200, blank=True)
    cliente_empresa = models.CharField(max_length=200, blank=True)
    cliente_email = models.EmailField(blank=True)
    cliente_telefono = models.CharField(max_length=20, blank=True)
    
    # Detalles de la cotización
    asunto = models.CharField(max_length=200, default="Cotización de Servicios")
    observaciones = models.TextField(blank=True)
    tiempo_entrega = models.CharField(
        max_length=200, 
        default="1 Día, Esperando que la oferta sea de su aceptación"
    )
    
    # Totales
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
        if not self.numero:
            ultimo_numero = Cotizacion.objects.aggregate(
                max_numero=models.Max('numero')
            )['max_numero']
            self.numero = (ultimo_numero or 0) + 1
        
        super().save(*args, **kwargs)
        
        if self.pk:
            self.calcular_totales()
            if self.subtotal != 0 or self.iva != 0 or self.total != 0:
                super().save(update_fields=['subtotal', 'iva', 'total'])
    
    def calcular_totales(self):
        
        if self.pk:
            items = self.items.all()
            self.subtotal = sum(item.total for item in items)
            self.iva = self.subtotal * Decimal('0.19')
            self.total = self.subtotal + self.iva
    
    def __str__(self):
        return f"Cotización #{self.numero} - {self.fecha}"


class ItemCotizacion(models.Model):
    """Modelo para los items/productos de cada cotización"""
    cotizacion = models.ForeignKey(
        Cotizacion, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    item_numero = models.PositiveIntegerField()
    cantidad = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    caracteristica = models.TextField()
    valor_unitario = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        editable=False
    )
    
    class Meta:
        ordering = ['item_numero']
        verbose_name = "Item de Cotización"
        verbose_name_plural = "Items de Cotización"
        unique_together = ['cotizacion', 'item_numero']
    
    def save(self, *args, **kwargs):
        # Calcular total del item
        self.total = Decimal(self.cantidad) * self.valor_unitario
        super().save(*args, **kwargs)
        
        # Actualizar totales de la cotización
        self.cotizacion.calcular_totales()
        self.cotizacion.save()
    
    def delete(self, *args, **kwargs):
        cotizacion = self.cotizacion
        super().delete(*args, **kwargs)
        # Actualizar totales después de eliminar
        cotizacion.calcular_totales()
        cotizacion.save()
    
    def __str__(self):
        return f"Item {self.item_numero} - {self.caracteristica[:50]}"
