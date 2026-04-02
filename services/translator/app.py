import os

from flask import Flask
from flask import jsonify
from flask import request

from src.translator import translate_content

app = Flask(__name__)


@app.route("/")
def translator():
    content = request.args.get("content", default="", type=str)
    title = request.args.get("title", default="", type=str)
    is_english, translated_content = translate_content(content, title)
    return jsonify({
        "is_english": is_english,
        "translated_content": translated_content,
    })


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
