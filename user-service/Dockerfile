FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY /user-service .

EXPOSE 1883

CMD ["python", "./user-service/main.py"]

