from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.db import transaction
from django.db import models
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Cotizacion, ItemCotizacion, Empresa
from .serializers import CotizacionSerializer, ItemCotizacionSerializer, EmpresaSerializer
from .pdf_generator import generar_pdf_cotizacion
import json


class CotizacionListCreateView(generics.ListCreateAPIView):
    """API para listar y crear cotizaciones"""
    queryset = Cotizacion.objects.filter(activa=True)
    serializer_class = CotizacionSerializer


class CotizacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API para obtener, actualizar y eliminar cotizaciones"""
    queryset = Cotizacion.objects.all()
    serializer_class = CotizacionSerializer


@api_view(['GET'])
def obtener_siguiente_numero(request):
    """Obtiene el siguiente número de cotización disponible"""
    ultimo_numero = Cotizacion.objects.aggregate(
        max_numero=models.Max('numero')
    )['max_numero']
    siguiente_numero = (ultimo_numero or 0) + 1
    
    return Response({'siguiente_numero': siguiente_numero})


@api_view(['POST'])
@transaction.atomic
def crear_cotizacion_completa(request):
    """Crea una cotización completa con sus items"""
    try:
        data = request.data

        # Asegurarse de que la empresa por defecto (ID=1) exista
        # O permitir que el frontend envíe el ID de la empresa si hay múltiples
        try:
            empresa_instance = Empresa.objects.get(pk=1)
        except Empresa.DoesNotExist:
            return Response(
                {'error': 'La empresa por defecto (ID=1) no existe. Por favor, asegúrese de que haya una empresa registrada con ID 1.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear la cotización
        cotizacion_data = {
            'cliente_nombre': data.get('cliente_nombre', ''),
            'cliente_empresa': data.get('cliente_empresa', ''),
            'cliente_email': data.get('cliente_email', ''),
            'cliente_telefono': data.get('cliente_telefono', ''),
            'asunto': data.get('asunto', 'Cotización de Servicios'), # Asegúrate que el frontend envíe 'asunto'
            'empresa': empresa_instance.id, # Asignar explícitamente la empresa
            'observaciones': data.get('observaciones', ''),
            'tiempo_entrega': data.get('tiempo_entrega', '1 Día, Esperando que la oferta sea de su aceptación'),
        }
        
        cotizacion_serializer = CotizacionSerializer(data=cotizacion_data)
        if cotizacion_serializer.is_valid():
            cotizacion = cotizacion_serializer.save()
            
            # Crear los items
            items_data = data.get('items', [])
            for item_data in items_data:
                item_data['cotizacion'] = cotizacion.id
                item_serializer = ItemCotizacionSerializer(data=item_data)
                if item_serializer.is_valid():
                    item_serializer.save()
                else:
                    # Al estar en una transacción, si hay un error aquí,
                    # la cotización creada al principio no se guardará.
                    return Response(
                        {'error': 'Error en los items', 'details': item_serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Recalcular totales
            cotizacion.calcular_totales()
            cotizacion.save()
            
            # Retornar la cotización completa
            cotizacion_completa = CotizacionSerializer(cotizacion)
            return Response(cotizacion_completa.data, status=status.HTTP_201_CREATED)
        
        else:
            return Response(cotizacion_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def generar_pdf(request, cotizacion_id):
    """Genera el PDF de una cotización"""
    try:
        cotizacion = get_object_or_404(Cotizacion, id=cotizacion_id)
        pdf_response = generar_pdf_cotizacion(cotizacion)
        return pdf_response
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def estadisticas(request):
    """Obtiene estadísticas básicas de las cotizaciones"""
    try:
        total_cotizaciones = Cotizacion.objects.filter(activa=True).count()
        cotizaciones_mes = Cotizacion.objects.filter(
            activa=True,
            fecha__month=timezone.now().month,
            fecha__year=timezone.now().year
        ).count()
        
        valor_total = Cotizacion.objects.filter(activa=True).aggregate(
            total=models.Sum('total')
        )['total'] or 0
        
        return Response({
            'total_cotizaciones': total_cotizaciones,
            'cotizaciones_mes': cotizaciones_mes,
            'valor_total': valor_total,
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
