FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt /app/
COPY appointment-service/setup.py /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 1883

CMD ["python", "./appointment-service/main.py"]
