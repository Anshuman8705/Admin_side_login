import json
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from converter.services.parser import parse_835_to_mir
from converter.services.validator import EDI835Validator

def index(request):
    """Render main web application interface."""
    return render(request, 'converter/index.html')

@csrf_exempt
def api_convert(request):
    """
    API Endpoint: Convert EDI 835 text or uploaded file to MIR format.
    Runs 100% Python backend parsing.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed.'}, status=405)

    edi_text = ""
    file_obj = request.FILES.get('edi_file')
    if file_obj:
        try:
            edi_text = file_obj.read().decode('utf-8', errors='ignore')
        except Exception as e:
            return JsonResponse({'error': f'Failed to read uploaded file: {str(e)}'}, status=400)
    else:
        if request.content_type == 'application/json':
            try:
                body = json.loads(request.body.decode('utf-8'))
                edi_text = body.get('edi_text', '')
            except Exception:
                edi_text = ''
        else:
            edi_text = request.POST.get('edi_text', '')

    edi_text = edi_text.strip()
    if not edi_text:
        return JsonResponse({'error': 'Please provide EDI 835 text or upload a file.'}, status=400)

    try:
        res = parse_835_to_mir(edi_text)
        return JsonResponse({
            'success': True,
            'text': res['text'],
            'claims_count': res['claims_count'],
            'services_count': res['services_count'],
            'records_count': res['records_count']
        })
    except Exception as err:
        return JsonResponse({'error': f'Failed to convert EDI file: {str(err)}'}, status=400)

@csrf_exempt
def api_validate(request):
    """
    API Endpoint: Validate EDI 835 files using Local X12/835 Engine.
    100% internal local validation - zero external network calls.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed.'}, status=405)

    edi_text = ""
    file_obj = request.FILES.get('edi_file')
    if file_obj:
        try:
            edi_text = file_obj.read().decode('utf-8', errors='ignore')
        except Exception as e:
            return JsonResponse({'error': f'Failed to read uploaded file: {str(e)}'}, status=400)
    else:
        if request.content_type == 'application/json':
            try:
                body = json.loads(request.body.decode('utf-8'))
                edi_text = body.get('edi_text', '')
            except Exception:
                edi_text = ''
        else:
            edi_text = request.POST.get('edi_text', '')

    edi_text = edi_text.strip()
    if not edi_text:
        return JsonResponse({'error': 'Please provide EDI content to validate.'}, status=400)

    try:
        validator = EDI835Validator()
        report = validator.validate(edi_text)
        
        # Standardize report schema for frontend compatibility
        report['is_valid'] = report.get('valid', report.get('is_valid', True))
        report['claims_found'] = report.get('claims', report.get('claims_found', 0))
        
        return JsonResponse({
            'success': True,
            'report': report
        })
    except Exception as err:
        return JsonResponse({'error': f'Local validation error: {str(err)}'}, status=500)

@csrf_exempt
def download_mir(request):
    """
    Endpoint to trigger `.mir` file download.
    """
    if request.method == 'POST':
        mir_content = request.POST.get('mir_content', '')
        file_name = request.POST.get('file_name', 'output.mir')
    else:
        mir_content = request.GET.get('mir_content', '')
        file_name = request.GET.get('file_name', 'output.mir')

    if not file_name.endswith('.mir'):
        file_name += '.mir'

    response = HttpResponse(mir_content, content_type='text/plain')
    response['Content-Disposition'] = f'attachment; filename="{file_name}"'
    return response
