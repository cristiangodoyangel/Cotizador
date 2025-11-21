from django.urls import path
from . import views

urlpatterns = [

    path('clientes/', views.listar_clientes, name='lista-clientes'),
    

    path('cotizaciones/', views.listar_cotizaciones, name='lista-cotizaciones'),
    

    path('cotizaciones/<int:pk>/', views.cotizacion_detalle, name='cotizacion-detalle'),
    
    

    path('cotizaciones/<int:pk>/pdf/', views.generar_pdf, name='cotizacion-pdf'),

    path('crear-completa/', views.crear_cotizacion_completa, name='crear-cotizacion-completa'),

    path('siguiente-numero/', views.obtener_siguiente_numero, name='siguiente-numero'),


    path('estadisticas/', views.obtener_estadisticas, name='estadisticas'),
]