# En cotizacion/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal

# ¡Importamos los nuevos modelos y serializers!
from .models import Cotizacion, Cliente, ItemCotizacion
from .serializers import CotizacionSerializer, ClienteSerializer

# ====================================================================
# VISTA PARA LISTAR CLIENTES (¡ARREGLADA!)
# ====================================================================
# Esta vista ahora lee de la tabla 'Cliente' y soluciona el bug
# que mostraba cotizaciones en lugar de clientes.
# ====================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_clientes(request):
    try:
        clientes = Cliente.objects.all().order_by('empresa')
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================================
# VISTA PARA LISTAR COTIZACIONES (ACTUALIZADA)
# ====================================================================
# Esta vista ahora usa el 'CotizacionSerializer' actualizado,
# por lo que cada cotización incluirá el objeto 'cliente' anidado.
# ====================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_cotizaciones(request):
    try:
        cotizaciones = Cotizacion.objects.all().order_by('-numero')
        serializer = CotizacionSerializer(cotizaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================================
# VISTA PARA CREAR COTIZACIÓN (¡LÓGICA ACTUALIZADA!)
# ====================================================================
# Esta es la lógica más importante.
# 1. Recibe el JSON grande del frontend.
# 2. Separa los datos del cliente, los items, y la cotización.
# 3. Busca si el cliente ya existe (por email).
# 4. Si no existe, lo CREA.
# 5. Crea la Cotización y la enlaza con el cliente.
# 6. Crea los Items y los enlaza con la cotización.
# 7. Guarda y recalcula los totales.
# ====================================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_cotizacion_completa(request):
    data = request.data
    
    try:
        # 1. Extraemos los datos del cliente y los items del JSON
        # (Asumimos que el frontend envía los campos de cliente 
        # con el prefijo 'cliente_' y los items en una lista 'items')
        
        cliente_data = {
            'nombre_contacto': data.get('cliente_nombre'),
            'empresa': data.get('cliente_empresa'),
            'email': data.get('cliente_email'),
            'telefono': data.get('cliente_telefono'),
            'direccion': data.get('cliente_direccion')
        }
        
        items_data = data.get('items', []) # Esperamos una lista de items

        # 2. Lógica "Get or Create" (Obtener o Crear) para el Cliente
        # Si el email existe, usamos ese cliente. Si no, creamos uno nuevo.
        # 'defaults' se usa para rellenar el resto de campos si el cliente es nuevo.
        cliente_obj, created = Cliente.objects.get_or_create(
            email=cliente_data['email'],
            defaults=cliente_data
        )

        # 3. Creamos la Cotización (sin los campos de cliente)
        cotizacion = Cotizacion.objects.create(
            cliente=cliente_obj, # ¡Enlazamos al cliente!
            asunto=data.get('asunto'),
            observaciones=data.get('observaciones'),
            tiempo_entrega=data.get('tiempo_entrega')
            # El 'numero' se asigna automáticamente con save()
            # La 'empresa' (Yajasa) se asigna por 'default=1'
        )

        # 4. Creamos los Items y los enlazamos a la cotización
        for item_data in items_data:
            ItemCotizacion.objects.create(
                cotizacion=cotizacion,
                descripcion=item_data.get('descripcion'),
                cantidad=item_data.get('cantidad'),
                precio_unitario=Decimal(item_data.get('precio_unitario'))
                # El 'total' del item se calcula automáticamente con save()
            )
            
        # 5. Guardamos la cotización una última vez.
        # Esto dispara el 'calcular_totales()' que suma los items
        # y guarda el subtotal, iva y total.
        cotizacion.save()

        # 6. Devolvemos la cotización completa
        serializer = CotizacionSerializer(cotizacion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Si algo falla, devolvemos el error
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# (Aquí irían tus otras vistas: obtenerCotizacion, eliminarCotizacion, etc.)