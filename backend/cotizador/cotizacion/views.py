# En cotizacion/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.db.models import Max # Necesario para 'siguiente_numero'
from django.http import HttpResponse # Necesario para 'generar_pdf'

# Importamos los nuevos modelos y serializers
from .models import Cotizacion, Cliente, ItemCotizacion
from .serializers import CotizacionSerializer, ClienteSerializer, EmpresaSerializer

# ====================================================================
# VISTAS DE CLIENTES
# (Se mantiene igual)
# ====================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_clientes(request):
    """
    Devuelve una lista de todos los clientes únicos.
    """
    try:
        clientes = Cliente.objects.all().order_by('empresa', 'nombre_contacto')
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================================
# VISTAS DE COTIZACIÓN (CRUD COMPLETO)
# ====================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_cotizaciones(request):
    """
    Devuelve una lista de todas las cotizaciones.
    (Se mantiene igual)
    """
    try:
        cotizaciones = Cotizacion.objects.select_related('cliente', 'empresa').all().order_by('-numero')
        serializer = CotizacionSerializer(cotizaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#
# --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
#
# Borramos 'obtener_cotizacion' y 'eliminar_cotizacion'
# y las reemplazamos por esta única función:
#

@api_view(['GET', 'DELETE']) 
@permission_classes([IsAuthenticated])
def cotizacion_detalle(request, pk):
    """
    Obtiene (GET) o Elimina (DELETE) una cotización específica.
    """
    try:
        # Usamos la lógica de tu 'obtener_cotizacion' original para la búsqueda
        cotizacion = get_object_or_404(
            Cotizacion.objects.select_related('cliente', 'empresa').prefetch_related('items'), 
            pk=pk
        )
    except Exception as e:
        return Response({"error": "Cotización no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    # --- Lógica de Métodos ---
    if request.method == 'GET':
        # Esta es la lógica de tu antigua 'obtener_cotizacion'
        serializer = CotizacionSerializer(cotizacion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        # Esta es la lógica de tu antigua 'eliminar_cotizacion'
        try:
            cotizacion.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            # Captura errores de borrado (ej. si está protegida por 'on_delete=models.PROTECT')
            return Response({"error": f"No se pudo eliminar la cotización: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#
# --- FIN DE LA CORRECCIÓN ---
#


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_cotizacion_completa(request):
    """
    Crea una nueva cotización, sus items, y el cliente si no existe.
    (Se mantiene igual, usando tu código original)
    """
    data = request.data
    
    try:
        cliente_data = {
            'nombre_contacto': data.get('cliente_nombre'),
            'empresa': data.get('cliente_empresa'),
            'email': data.get('cliente_email'),
            'telefono': data.get('cliente_telefono'),
            'direccion': data.get('cliente_direccion')
        }
        items_data = data.get('items', [])

        # Lógica "Get or Create" para el Cliente
        if not cliente_data['email']:
             cliente_obj = Cliente.objects.create(**cliente_data)
        else:
            cliente_obj, created = Cliente.objects.get_or_create(
                email=cliente_data['email'],
                defaults=cliente_data
            )
            if not created:
                Cliente.objects.filter(id=cliente_obj.id).update(**cliente_data)
                cliente_obj.refresh_from_db()

        # Creamos la Cotización
        cotizacion = Cotizacion.objects.create(
            cliente=cliente_obj,
            asunto=data.get('asunto'),
            observaciones=data.get('observaciones'),
            tiempo_entrega=data.get('tiempo_entrega')
        )

        # Creamos los Items
        for item_data in items_data:
            cantidad_item = item_data.get('cantidad', 0)
            precio_item = item_data.get('precio_unitario', 0)  
            ItemCotizacion.objects.create(
                cotizacion=cotizacion,
                descripcion=item_data.get('descripcion'),
                cantidad=cantidad_item,
                precio_unitario=Decimal(precio_item)
            )
            
        # Guardamos la cotización una última vez para disparar el recálculo de totales
        cotizacion.save()

        serializer = CotizacionSerializer(cotizacion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ====================================================================
# VISTAS DE UTILIDAD (PDF, Siguiente Número, etc.)
# (Se mantienen igual)
# ====================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_siguiente_numero(request):
    """
    Calcula y devuelve el siguiente número de cotización disponible.
    """
    try:
        ultimo_numero = Cotizacion.objects.aggregate(
            max_numero=Max('numero')
        )['max_numero']
        siguiente_numero = (ultimo_numero or 0) + 1
        return Response({'siguiente_numero': siguiente_numero}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generar_pdf(request, pk):
    """
    (LÓGICA DE PDF PENDIENTE)
    """
    return Response({"mensaje": f"PDF para cotización {pk} se generará aquí"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_estadisticas(request):
    """
    (LÓGICA DE ESTADÍSTICAS PENDIENTE)
    """
    total_cots = Cotizacion.objects.count()
    return Response({"total_cotizaciones": total_cots}, status=status.HTTP_200_OK)