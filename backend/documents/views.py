import io
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from careers.llm_service import LLMService


def extract_text_from_file(file) -> str:
    """Extract plain text from uploaded PDF, DOCX, or TXT file"""
    name = file.name.lower()
    content = file.read()

    if name.endswith('.txt'):
        return content.decode('utf-8', errors='ignore')

    if name.endswith('.pdf'):
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            return '\n'.join(page.extract_text() or '' for page in reader.pages)
        except Exception as e:
            raise ValueError(f"Could not read PDF: {e}")

    if name.endswith('.docx'):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            return '\n'.join(p.text for p in doc.paragraphs)
        except Exception as e:
            raise ValueError(f"Could not read DOCX: {e}")

    raise ValueError("Unsupported file type. Please upload PDF, DOCX, or TXT.")


class DocumentSummarizeView(views.APIView):
    """Summarize an uploaded document using LLM"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        mode = request.data.get('mode', 'summary')  # summary | keyTerms | studyGuide

        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            text = extract_text_from_file(file)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if not text.strip():
            return Response({'error': 'Could not extract text from file'}, status=status.HTTP_400_BAD_REQUEST)

        llm = LLMService()
        result = llm.summarize_document(text, mode)

        return Response({'result': result, 'mode': mode})


class DocumentAskView(views.APIView):
    """Answer questions about an uploaded document"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        question = request.data.get('question', '').strip()
        history = request.data.get('history', [])
        file = request.FILES.get('file')
        raw_text = request.data.get('text', '')

        if file:
            try:
                text = extract_text_from_file(file)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        elif raw_text:
            text = raw_text
        else:
            return Response({'error': 'No file or text provided'}, status=status.HTTP_400_BAD_REQUEST)

        if not question:
            return Response({'error': 'Question is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse history if it came as a JSON string (multipart form)
        if isinstance(history, str):
            import json
            try:
                history = json.loads(history)
            except Exception:
                history = []

        llm = LLMService()
        answer = llm.ask_document(text, question, history)

        return Response({'answer': answer})
