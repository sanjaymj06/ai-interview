import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from backend.analyzer import InterviewAnalyzer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

app = Flask(__name__)
CORS(app)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024

ALLOWED_EXTENSIONS = {"txt", "pdf", "docx"}
analyzer = InterviewAnalyzer()
analyses_db = {}


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


@app.route("/api/analyze/text", methods=["POST"])
def analyze_text():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Empty text provided"}), 400

    result = analyzer.analyze(text)
    analysis_id = str(uuid.uuid4())[:8]
    analyses_db[analysis_id] = {
        "id": analysis_id,
        "input_type": "text",
        "text_preview": text[:200] + "..." if len(text) > 200 else text,
        "result": result,
        "created_at": datetime.utcnow().isoformat(),
    }

    return jsonify({"analysis_id": analysis_id, "result": result})


@app.route("/api/analyze/file", methods=["POST"])
def analyze_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": f"File type '{ext}' not supported. Use: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    filename = secure_filename(f"{uuid.uuid4().hex[:8]}_{file.filename}")
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        text = _extract_text(filepath, ext)
    except Exception as e:
        return jsonify({"error": f"Failed to read file: {str(e)}"}), 500

    result = analyzer.analyze(text)
    analysis_id = str(uuid.uuid4())[:8]
    analyses_db[analysis_id] = {
        "id": analysis_id,
        "input_type": "file",
        "filename": file.filename,
        "text_preview": text[:200] + "..." if len(text) > 200 else text,
        "result": result,
        "created_at": datetime.utcnow().isoformat(),
    }

    return jsonify({"analysis_id": analysis_id, "result": result})


@app.route("/api/history", methods=["GET"])
def get_history():
    items = sorted(analyses_db.values(), key=lambda x: x["created_at"], reverse=True)
    return jsonify({"analyses": items[:20]})


@app.route("/api/history/<analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    if analysis_id not in analyses_db:
        return jsonify({"error": "Analysis not found"}), 404
    return jsonify(analyses_db[analysis_id])


@app.route("/api/compare", methods=["POST"])
def compare_analyses():
    data = request.get_json()
    if not data or "ids" not in data:
        return jsonify({"error": "Provide analysis IDs to compare"}), 400

    ids = data["ids"]
    results = []
    for aid in ids:
        if aid in analyses_db:
            results.append(analyses_db[aid])

    if len(results) < 2:
        return jsonify({"error": "Need at least 2 valid analyses to compare"}), 400

    return jsonify({"comparisons": results})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    if path:
        file_path = os.path.join(FRONTEND_DIR, path)
        if os.path.isfile(file_path):
            return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")


def _extract_text(filepath: str, ext: str) -> str:
    if ext == "txt":
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    elif ext == "pdf":
        try:
            import PyPDF2
            with open(filepath, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                return " ".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
    elif ext == "docx":
        try:
            import docx
            doc = docx.Document(filepath)
            return "\n".join(p.text for p in doc.paragraphs)
        except ImportError:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
    return ""


if __name__ == "__main__":
    print("=" * 60)
    print("  AI InterviewAI")
    print("  Server running at http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host="0.0.0.0", port=5000)
