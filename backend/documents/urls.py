from django.urls import path
from .views import DocumentSummarizeView, DocumentAskView

urlpatterns = [
    path('summarize/', DocumentSummarizeView.as_view(), name='document-summarize'),
    path('ask/', DocumentAskView.as_view(), name='document-ask'),
]
