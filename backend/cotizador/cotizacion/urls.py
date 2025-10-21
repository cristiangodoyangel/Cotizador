from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# URLs específicas para la app cotizacion
urlpatterns = [
    # API REST endpoints
    path('cotizaciones/', views.CotizacionListCreateView.as_view(), name='cotizacion-list-create'),
    path('cotizaciones/<int:pk>/', views.CotizacionDetailView.as_view(), name='cotizacion-detail'),
    
    # Endpoints personalizados
    path('siguiente-numero/', views.obtener_siguiente_numero, name='siguiente-numero'),
    path('crear-completa/', views.crear_cotizacion_completa, name='crear-cotizacion-completa'),
    path('cotizaciones/<int:cotizacion_id>/pdf/', views.generar_pdf, name='generar-pdf'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
]