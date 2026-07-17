import re
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


_nlp_model = None


def get_nlp():
    global _nlp_model
    if _nlp_model is None:
        try:
            _nlp_model = spacy.load("en_core_web_sm")
        except OSError:
            spacy.cli.download("en_core_web_sm")
            _nlp_model = spacy.load("en_core_web_sm")
    return _nlp_model


def preprocess_text(text: str) -> Dict[str, Any]:
    nlp = get_nlp()
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
    sentences = [sent.text.strip() for sent in doc.sents]
    return {
        "tokens": tokens,
        "sentences": sentences,
        "num_tokens": len(tokens),
        "num_sentences": len(sentences),
    }


def extract_entities(text: str) -> List[Dict[str, str]]:
    nlp = get_nlp()
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char,
        })
    return entities


def extract_skills_nlp(text: str, skill_list: Optional[List[str]] = None) -> List[str]:
    from app.utils.constants import SKILL_CATEGORIES
    if skill_list is None:
        skill_list = []
        for skills in SKILL_CATEGORIES.values():
            skill_list.extend(skills)
    text_lower = text.lower()
    found = []
    for skill in skill_list:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            if skill not in found:
                found.append(skill)
    doc = get_nlp()(text_lower)
    for token in doc:
        if len(token.text) > 2 and token.pos_ in ("NOUN", "PROPN") and token.text in [s.lower() for s in skill_list]:
            original = next((s for s in skill_list if s.lower() == token.text), None)
            if original and original not in found:
                found.append(original)
    return found


def get_sentence_embeddings(texts: List[str]) -> np.ndarray:
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embeddings = model.encode(texts, show_progress_bar=False)
        return embeddings
    except Exception:
        vectorizer = TfidfVectorizer(max_features=384)
        tfidf_matrix = vectorizer.fit_transform(texts)
        return tfidf_matrix.toarray()


def calculate_text_similarity(text1: str, text2: str) -> float:
    try:
        embeddings = get_sentence_embeddings([text1, text2])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return float(similarity)
    except Exception:
        vectorizer = TfidfVectorizer()
        tfidf = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return float(similarity)


def calculate_batch_similarity(query: str, documents: List[str]) -> List[float]:
    if not documents:
        return []
    try:
        all_texts = [query] + documents
        embeddings = get_sentence_embeddings(all_texts)
        query_embedding = embeddings[0:1]
        doc_embeddings = embeddings[1:]
        similarities = cosine_similarity(query_embedding, doc_embeddings)[0]
        return [float(s) for s in similarities]
    except Exception:
        vectorizer = TfidfVectorizer()
        all_texts = [query] + documents
        tfidf = vectorizer.fit_transform(all_texts)
        similarities = cosine_similarity(tfidf[0:1], tfidf[1:])[0]
        return [float(s) for s in similarities]


def tfidf_vectorize(texts: List[str]) -> Tuple[Any, Any]:
    vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(texts)
    return tfidf_matrix, vectorizer


def extract_keywords_tfidf(text: str, top_n: int = 20) -> List[Tuple[str, float]]:
    vectorizer = TfidfVectorizer(max_features=100, stop_words="english")
    tfidf_matrix = vectorizer.fit_transform([text])
    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.toarray()[0]
    keyword_scores = list(zip(feature_names, scores))
    keyword_scores.sort(key=lambda x: x[1], reverse=True)
    return keyword_scores[:top_n]


def similarity_matrix(texts: List[str]) -> np.ndarray:
    if len(texts) < 2:
        return np.array([[1.0]])
    try:
        embeddings = get_sentence_embeddings(texts)
        return cosine_similarity(embeddings)
    except Exception:
        vectorizer = TfidfVectorizer()
        tfidf = vectorizer.fit_transform(texts)
        return cosine_similarity(tfidf)
