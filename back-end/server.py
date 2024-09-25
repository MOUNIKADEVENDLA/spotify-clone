from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# Serve the songs.json file from the static folder
@app.route('/songs', methods=['GET'])
def get_songs():
    # Get the path to the static folder
    static_folder = os.path.join(app.root_path, 'static')
    
    # Load songs.json from static folder
    with open(os.path.join(static_folder, 'songs.json'), 'r') as f:
        songs = json.load(f)
    return jsonify(songs)

# Optional: Serve audio files (if required by front-end)
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True)
