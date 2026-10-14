# Google Cloud Run Document Processing Worker Dockerfile
# Container with LibreOffice, Ghostscript, QPDF, and Tesseract OCR
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PORT=8080

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libreoffice \
    ghostscript \
    qpdf \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-deu \
    tesseract-ocr-fra \
    poppler-utils \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
COPY packages/ packages/
COPY services/pdf-worker/ services/pdf-worker/

EXPOSE 8080
CMD ["echo", "PDF Worker Container Ready"]
