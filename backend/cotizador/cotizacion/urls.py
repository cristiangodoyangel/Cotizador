# En ~/Cotizador/backend/cotizador/cotizacion/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # --- RUTAS DE CLIENTES ---
    # GET /api/clientes/
    path('clientes/', views.listar_clientes, name='lista-clientes'),
    
    # --- RUTAS DE COTIZACIONES ---
    # GET /api/cotizaciones/
    path('cotizaciones/', views.listar_cotizaciones, name='lista-cotizaciones'),
    
    # --- ¡AQUÍ ESTÁ LA CORRECCIÓN DEL 'ELIMINAR'! ---
    # Esta única línea reemplaza a 'obtener_cotizacion' y 'eliminar_cotizacion'.
    # Apunta a la nueva vista 'cotizacion_detalle' que maneja GET y DELETE.
    path('cotizaciones/<int:pk>/', views.cotizacion_detalle, name='cotizacion-detalle'),
    
    
    # GET /api/cotizaciones/<pk>/pdf/
    path('cotizaciones/<int:pk>/pdf/', views.generar_pdf, name='cotizacion-pdf'),

    # --- RUTAS DE LÓGICA ---
    # POST /api/crear-completa/
    path('crear-completa/', views.crear_cotizacion_completa, name='crear-cotizacion-completa'),
    
    # GET /api/siguiente-numero/
    path('siguiente-numero/', views.obtener_siguiente_numero, name='siguiente-numero'),

    # GET /api/estadisticas/
    path('estadisticas/', views.obtener_estadisticas, name='estadisticas'),
]