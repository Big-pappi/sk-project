"""
WSGI config for sokoni project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sokoni.settings')
application = get_wsgi_application()
