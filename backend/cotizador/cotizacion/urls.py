from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


# En cotizacion/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # --- RUTAS DE CLIENTES ---
    # GET /api/clientes/
    path('clientes/', views.listar_clientes, name='lista-clientes'),
    
    # --- RUTAS DE COTIZACIONES ---
    # GET /api/cotizaciones/
    path('cotizaciones/', views.listar_cotizaciones, name='lista-cotizaciones'),
    
    # GET /api/cotizaciones/<pk>/
    path('cotizaciones/<int:pk>/', views.obtener_cotizacion, name='cotizacion-detail'),
    
    # DELETE /api/cotizaciones/<pk>/  (Cambié la ruta para que coincida con tu api.js)
    path('cotizaciones/<int:pk>/', views.eliminar_cotizacion, name='cotizacion-eliminar'),
    
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

'''# URLs específicas para la app cotizacion
urlpatterns = [
    # API REST endpoints
    path('cotizaciones/', views.CotizacionListCreateView.as_view(), name='cotizacion-list-create'),
    path('cotizaciones/<int:pk>/', views.CotizacionDetailView.as_view(), name='cotizacion-detail'),
    
    # Endpoints personalizados
    path('siguiente-numero/', views.obtener_siguiente_numero, name='siguiente-numero'),
    path('crear-completa/', views.crear_cotizacion_completa, name='crear-cotizacion-completa'),
    path('cotizaciones/<int:cotizacion_id>/pdf/', views.generar_pdf, name='generar-pdf'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
    path('clientes/', views.cliente_list, name='cliente-list'),
]'''