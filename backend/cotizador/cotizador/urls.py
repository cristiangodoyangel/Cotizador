from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

# --- AÑADE ESTAS IMPORTACIONES ---
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
# --- FIN DE IMPORTACIONES ---


urlpatterns = [
    path("", views.api_info, name='home'), 
    path("admin/", admin.site.urls),
    path("api/", include('cotizacion.urls')),

    # --- AÑADE ESTAS RUTAS PARA JWT ---
    # 1. Ruta para pedir un token (Login)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 2. Ruta para refrescar un token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # --- FIN DE RUTAS A AÑADIR ---
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



''' from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views  # <-- Importante, mantiene tu vista api_info

urlpatterns = [
    # 1. La raíz de tu API (ahora yajasatechnology.cl/api/)
    #    mostrará la vista de información.
    path("", views.api_info, name='home'), 
    
    # 2. El admin vivirá en yajasatechnology.cl/api/admin/
    path("admin/", admin.site.urls),
    
    # 3. Incluimos las URLs de la app 'cotizacion' directamente.
    #    (ej. yajasatechnology.cl/api/cotizaciones/)
    path("", include('cotizacion.urls')), # <--- CAMBIO CLAVE
]

# Servir archivos media
# (Esto no funciona con DEBUG=False, 
# debes configurar MEDIA_ROOT en cPanel como "Static File")
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)'''