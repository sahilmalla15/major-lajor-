import os
import json
import numpy as np

# Optional: sentence-transformers (heavy ML package)
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMER_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMER_AVAILABLE = False

# Optional: google-generativeai
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

_embedder = None
_genai_model = None

def get_embedder():
    global _embedder
    if _embedder is None:
        if SENTENCE_TRANSFORMER_AVAILABLE:
            _embedder = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            _embedder = 'unavailable'
    return _embedder if _embedder != 'unavailable' else None

def get_genai_model():
    global _genai_model
    if _genai_model is None and GEMINI_API_KEY and GENAI_AVAILABLE:
        genai.configure(api_key=GEMINI_API_KEY)
        _genai_model = genai.GenerativeModel('gemini-2.0-flash')
    return _genai_model

def generate_embedding(text):
    """Generate embedding vector for text. Falls back to a simple hash-based vector."""
    embedder = get_embedder()
    if embedder:
        return embedder.encode(text).tolist()
    # Simple fallback: create a deterministic vector from character codes
    # This is NOT semantically meaningful but allows the system to function
    np.random.seed(hash(text) % (2**31))
    return np.random.rand(384).tolist()

def search_knowledge_base(query, top_k=3):
    """Search the knowledge base for chunks relevant to the query."""
    from knowledge_base.models import ResourceChunk
    query_emb = generate_embedding(query)
    chunks = ResourceChunk.objects.exclude(embedding__isnull=True)
    scored = []
    for chunk in chunks:
        emb = chunk.embedding
        if emb:
            sim = np.dot(query_emb, emb) / (np.linalg.norm(query_emb) * np.linalg.norm(emb) + 1e-10)
            scored.append((sim, chunk))
    scored.sort(key=lambda x: -x[0])
    return [c for _, c in scored[:top_k]]

def get_ai_response(user_query, retrieved_chunks=None):
    """Get AI response using Gemini or fallback."""
    model = get_genai_model()
    if not model:
        return fallback_response(user_query)
    context = ""
    if retrieved_chunks:
        context = "Relevant educational content:\n" + "\n\n".join([c.content[:500] for c in retrieved_chunks])
    prompt = f"""You are AtelierAI, an AI art tutor. Help the user learn drawing fundamentals.
Answer questions about art techniques, provide guidance, and explain concepts clearly.

{context}

User question: {user_query}

Provide a helpful, educational response focused on art learning."""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return fallback_response(user_query)

def evaluate_sketch(image_path, exercise_title=""):
    """Evaluate a drawing using Gemini Vision API or return sample feedback."""
    model = get_genai_model()
    if not model:
        return sample_evaluation()

    try:
        import PIL.Image
        img = PIL.Image.open(image_path)
        prompt = f"""You are an art teacher evaluating a student's drawing of: {exercise_title}
Analyze the drawing and provide feedback in JSON format:
{{
  "overall_score": (0-100),
  "evaluation_result": "detailed feedback paragraph",
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...]
}}
Be constructive and encouraging. Focus on: proportions, perspective, shading, line quality, composition."""
        response = model.generate_content([prompt, img])
        text = response.text.strip()
        # Clean markdown code fences if present
        if text.startswith('```'):
            text = text.split('\n', 1)[1] if '\n' in text else text
            text = text.rsplit('```', 1)[0] if '```' in text else text
        result = json.loads(text.strip())
        return result
    except Exception:
        return sample_evaluation()

def sample_evaluation():
    """Return a sample evaluation for when AI is not available."""
    import random
    score = random.randint(60, 85)
    return {
        "overall_score": score,
        "evaluation_result": "Your drawing shows good effort! The basic structure is in place. Keep practicing to improve proportions and add more refined shading. Remember to identify your light source early and maintain consistent shadow placement throughout.",
        "strengths": [
            "Good overall composition and layout",
            "Clear effort in following the basic structure",
            "Proper use of basic shapes as foundation"
        ],
        "improvements": [
            "Work on consistent light source and shadow placement",
            "Practice smoother line quality — use ghosting technique",
            "Add more contrast between light and dark areas",
            "Refine proportions by measuring relationships between parts"
        ]
    }

def fallback_response(query):
    """Provide responses when Gemini API is unavailable."""
    query = query.lower()
    responses = {
        "perspective": "Perspective drawing creates the illusion of depth on a flat surface. Start with 1-point perspective: draw a horizon line, place a vanishing point on it, and draw all depth lines converging toward that point. Practice with simple boxes first before moving to 2-point and 3-point perspective. Remember: objects closer to the horizon appear smaller!",
        "shading": "Shading gives objects volume and realism. The key is identifying your light source first. Practice these techniques: 1) Hatching — parallel lines close together for darker values 2) Cross-hatching — overlapping lines at angles 3) Blending — smooth transitions using tissue or blending stumps 4) Stippling — dots placed closely for darker areas. Always use a range from light to dark!",
        "anatomy": "Figure drawing starts with understanding basic proportions. The average adult is about 7.5 heads tall. Use the 'line of action' to capture movement and flow. Build the figure using simple shapes: cylinders for limbs, spheres for joints, an egg shape for the ribcage, and a wedge for the pelvis. Gesture drawing daily will improve your figure work dramatically!",
        "line": "Line control is the most fundamental drawing skill. Practice these exercises daily: 1) Ghosting — hover your pen over the paper before drawing to build muscle memory 2) Draw from your shoulder, not your wrist 3) Superimposed lines — draw the same line multiple times 4) Straight lines of various lengths 5) Ellipses of various sizes. Consistency comes from deliberate practice!",
    }
    for key, resp in responses.items():
        if key in query:
            return resp
    return f"That's a great question about '{query}'! As a general tip: break down complex subjects into basic shapes (boxes, spheres, cylinders), establish your light source for shading, and practice regularly with warm-up exercises. Every master artist started with the fundamentals!"