from django.urls import path
from .views import DocumentSummarizeView, DocumentAskView, DocumentDebugView

urlpatterns = [
    path('summarize/', DocumentSummarizeView.as_view(), name='document-summarize'),
    path('ask/', DocumentAskView.as_view(), name='document-ask'),
    path('debug/', DocumentDebugView.as_view(), name='document-debug'),
]
