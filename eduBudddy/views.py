from django.shortcuts import redirect,render
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
from django.http import JsonResponse

def HOME(request):
    return render(request,'main/index.html')


def DASHBOARD(request):
    return render(request, 'main/dashboard.html')


def QA(request):
    return render(request,'dashItems/qa.html')


def SM(request):
    return render(request,'dashItems/sm.html')


def QUIZ(request):
    return render(request,'dashItems/quiz.html')


def QUIZ_CHART(request):
    if request.method == 'POST':
        try:
            # Get data from the POST request
            correct = int(request.POST.get('correct', 0))
            total = int(request.POST.get('total', 0))
            incorrect = total - correct
            
            # Create figure and axis
            plt.figure(figsize=(8, 6))
            
            # Data for pie chart
            labels = ['Correct', 'Incorrect']
            sizes = [correct, incorrect]
            colors = ['#4CAF50', '#F44336']
            explode = (0.1, 0)  # explode the 1st slice (Correct)
            
            # Plot pie chart
            plt.pie(sizes, explode=explode, labels=labels, colors=colors,
                   autopct='%1.1f%%', shadow=True, startangle=140)
            plt.axis('equal')  # Equal aspect ratio ensures the pie is circular
            plt.title('Quiz Results Accuracy')
            
            # Save to a bytes buffer
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()
            
            # Encode bytes to Base64 string
            chart_data = base64.b64encode(image_png).decode('utf-8')
            
            # Return JSON response with chart data
            return JsonResponse({'chart_data': chart_data})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Only POST requests allowed'}, status=405)