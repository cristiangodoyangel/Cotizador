from django.http import JsonResponse
from django.shortcuts import render
from cotizacion.models import Cotizacion, ItemCotizacion, Empresa


def home(request):
    """Vista principal que muestra información del sistema"""
    context = {
        'total_cotizaciones': Cotizacion.objects.filter(activa=True).count(),
        'total_items': ItemCotizacion.objects.count(),
        'empresa': Empresa.objects.first(),
    }
    return render(request, 'home.html', context)


def api_info(request):
    """Información sobre las APIs disponibles"""
    endpoints = {
        'admin': '/admin/',
        'apis': {
            'cotizaciones': '/api/cotizaciones/',
            'siguiente_numero': '/api/siguiente-numero/',
            'crear_completa': '/api/crear-completa/',
            'estadisticas': '/api/estadisticas/',
            'generar_pdf': '/api/cotizaciones/{id}/pdf/',
        },
        'documentacion': {
            'descripcion': 'Sistema de cotizaciones para Yajasa Technology',
            'version': '1.0.0',
        }
    }
    return JsonResponse(endpoints, json_dumps_params={'indent': 2})