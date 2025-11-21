from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


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

class Cliente(models.Model):
   
    nombre_contacto = models.CharField(max_length=200) 
    empresa = models.CharField(max_length=200, blank=True) 
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True) 
    telefono = models.CharField(max_length=20, blank=True) 
    direccion = models.CharField(max_length=255, blank=True) 
    
    creado_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['empresa', 'nombre_contacto']
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self):

        return self.empresa or self.nombre_contacto


class Cotizacion(models.Model):
    
    numero = models.PositiveIntegerField(unique=True, editable=False)
    fecha = models.DateField(auto_now_add=True)
    

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, default=1)

    cliente = models.ForeignKey(
        Cliente, 
        on_delete=models.PROTECT, 
        related_name="cotizaciones",
        null=True,  
        blank=True  
    )

    asunto = models.CharField(max_length=200, default="Cotización de Servicios")
    observaciones = models.TextField(blank=True)
    tiempo_entrega = models.CharField(
        max_length=200, 
        default="1 Día, Esperando que la oferta sea de su aceptación"
    )
    

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

            Cotizacion.objects.filter(pk=self.pk).update(
                subtotal=self.subtotal,
                iva=self.iva,
                total=self.total
            )

    def calcular_totales(self):

        if self.pk:
            items = self.items.all()
            self.subtotal = sum(item.total for item in items) if items else Decimal('0.00')
            self.iva = self.subtotal * Decimal('0.19')
            self.total = self.subtotal + self.iva
    
    def __str__(self):

        return f"Cotización #{self.numero} - {str(self.cliente)}"


class ItemCotizacion(models.Model):
    cotizacion = models.ForeignKey(
        Cotizacion, 
        on_delete=models.CASCADE, 
        related_name="items" 
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
        editable=False 
    )
    
    def save(self, *args, **kwargs):

        self.total = Decimal(self.cantidad) * self.precio_unitario
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.cantidad} x {self.descripcion} (para Cotización #{self.cotizacion.numero})"