import re


class InterviewAnalyzer:
    POSITIVE_WORDS = {
        "achieved", "improved", "led", "developed", "implemented", "managed",
        "created", "designed", "optimized", "increased", "reduced", "delivered",
        "solved", "innovated", "collaborated", "mentored", "launched", "built",
        "streamlined", "automated", "successfully", "excellent", "outstanding",
        "results", "growth", "efficiency", "profit", "revenue", "savings",
        "team", "leadership", "initiative", "passionate", "dedicated", "motivated",
        "confident", "creative", "analytical", "strategic", "proactive", "adaptable",
        "detail", "communication", "problem-solving", "experience", "skill",
        "strength", "opportunity", "learn", "develop", "improve", "contribute",
        "value", "goal", "mission", "vision", "success", "impact",
    }

    NEGATIVE_WORDS = {
        "failed", "unable", "difficult", "problem", "issue", "error",
        "mistake", "weakness", "struggle", "lack", "shortcoming", "never",
        "always", "terrible", "awful", "worst", "hate", "boring",
        "quit", "fired", "complaint", "conflict", "stress", "overwhelmed",
        "hesitate", "doubt", "uncertain", "reluctant", "unfortunately",
    }

    FILLER_WORDS = {
        "um", "uh", "like", "you know", "basically", "actually",
        "literally", "sort of", "kind of", "i mean", "right", "so",
        "well", "ah", "hmm", "er", "ahh", "umm", "uhh",
    }

    STRONG_ACTION_VERBS = {
        "led", "managed", "directed", "oversaw", "supervised", "coordinated",
        "implemented", "developed", "designed", "created", "built", "launched",
        "established", "founded", "initiated", "pioneered", "spearheaded",
        "optimized", "streamlined", "automated", "improved", "enhanced",
        "increased", "boosted", "accelerated", "expanded", "grew",
        "achieved", "accomplished", "delivered", "completed", "resolved",
        "analyzed", "evaluated", "assessed", "researched", "investigated",
        "collaborated", "partnered", "negotiated", "influenced", "persuaded",
        "mentored", "trained", "coached", "guided", "supported",
    }

    INDUSTRY_KEYWORDS = {
        "technology": ["software", "developer", "engineer", "programming", "api",
                       "database", "cloud", "devops", "agile", "scrum", "tech",
                       "system", "architecture", "microservices", "kubernetes", "docker"],
        "management": ["project", "manager", "leadership", "strategy", "planning",
                       "budget", "stakeholder", "timeline", "milestone", "resources",
                       "risk", "governance", "compliance", "process", "optimization"],
        "data": ["data", "analytics", "machine learning", "ai", "statistics",
                 "python", "sql", "visualization", "model", "algorithm",
                 "prediction", "insights", "metrics", "reporting", "dashboard"],
        "marketing": ["campaign", "brand", "marketing", "seo", "social media",
                      "content", "strategy", "engagement", "conversion", "analytics",
                      "audience", "segment", "funnel", "acquisition", "retention"],
        "finance": ["financial", "accounting", "budget", "revenue", "forecast",
                    "audit", "compliance", "investment", "portfolio", "risk",
                    "analysis", "reporting", "valuation", "profit", "loss"],
    }

    def analyze(self, text: str) -> dict:
        if not text or not text.strip():
            return self._empty_result()

        cleaned = self._clean_text(text)
        sentences = self._split_sentences(cleaned)
        words = self._tokenize(cleaned)
        word_count = len(words)

        return {
            "overall_score": self._compute_overall_score(cleaned, words, sentences),
            "communication": self._score_communication(words, sentences, word_count),
            "confidence": self._score_confidence(words, cleaned),
            "vocabulary": self._score_vocabulary(words),
            "clarity": self._score_clarity(sentences, words),
            "sentiment": self._analyze_sentiment(words),
            "filler_words": self._count_filler_words(cleaned),
            "strengths": self._identify_strengths(cleaned, words),
            "improvements": self._identify_improvements(cleaned, words, sentences),
            "keywords_found": self._find_keywords(cleaned),
            "word_count": word_count,
            "sentence_count": len(sentences),
            "avg_sentence_length": round(word_count / max(len(sentences), 1), 1),
            "action_verbs_used": self._find_action_verbs(words),
            "questions_detected": self._detect_questions(text),
        }

    def _clean_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s\.\!\?]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _split_sentences(self, text: str) -> list:
        sentences = re.split(r"[\.!\?]+", text)
        return [s.strip() for s in sentences if s.strip()]

    def _tokenize(self, text: str) -> list:
        return text.split()

    def _compute_overall_score(self, text: str, words: list, sentences: list) -> int:
        comm = self._score_communication(words, sentences, len(words))
        conf = self._score_confidence(words, text)
        vocab = self._score_vocabulary(words)
        clar = self._score_clarity(sentences, words)
        scores = [comm["score"], conf["score"], vocab["score"], clar["score"]]
        return round(sum(scores) / len(scores))

    def _score_communication(self, words: list, sentences: list, word_count: int) -> dict:
        score = 50
        if word_count > 50:
            score += 10
        if word_count > 150:
            score += 10
        if len(sentences) > 3:
            score += 10
        avg_len = word_count / max(len(sentences), 1)
        if 10 <= avg_len <= 25:
            score += 10
        elif avg_len > 35:
            score -= 5
        positive_count = sum(1 for w in words if w in self.POSITIVE_WORDS)
        score += min(positive_count * 2, 10)
        score = max(10, min(100, score))
        return {
            "score": score,
            "label": self._score_label(score),
            "detail": f"Based on {word_count} words across {len(sentences)} sentences",
        }

    def _score_confidence(self, words: list, text: str) -> dict:
        score = 50
        hedging = ["maybe", "perhaps", "possibly", "might", "could", "sort of", "kind of"]
        hedge_count = sum(1 for h in hedging if h in text)
        score -= hedge_count * 3
        intensifiers = ["very", "extremely", "highly", "absolutely", "definitely", "certainly"]
        intensifier_count = sum(1 for i in intensifiers if i in text)
        score += intensifier_count * 3
        first_person = len(re.findall(r"\bi\b", text))
        if first_person > len(words) * 0.08:
            score -= 5
        action_count = sum(1 for w in words if w in self.STRONG_ACTION_VERBS)
        score += min(action_count * 3, 15)
        score = max(10, min(100, score))
        return {
            "score": score,
            "label": self._score_label(score),
            "detail": f"Found {action_count} strong action verbs, {hedge_count} hedging phrases",
        }

    def _score_vocabulary(self, words: list) -> dict:
        score = 50
        unique_ratio = len(set(words)) / max(len(words), 1)
        score += round(unique_ratio * 30)
        avg_word_len = sum(len(w) for w in words) / max(len(words), 1)
        if avg_word_len > 4.5:
            score += 10
        complex_words = [w for w in words if len(w) > 8]
        score += min(len(set(complex_words)) * 2, 10)
        score = max(10, min(100, score))
        return {
            "score": score,
            "label": self._score_label(score),
            "detail": f"Vocabulary diversity: {round(unique_ratio * 100, 1)}%",
        }

    def _score_clarity(self, sentences: list, words: list) -> dict:
        score = 50
        if not sentences:
            return {"score": 20, "label": "Poor", "detail": "No complete sentences found"}
        lengths = [len(s.split()) for s in sentences]
        if lengths:
            variance = sum((l - sum(lengths) / len(lengths)) ** 2 for l in lengths) / len(lengths)
            if variance < 50:
                score += 15
            elif variance > 200:
                score -= 10
        transition_words = [
            "first", "second", "third", "next", "then", "finally",
            "however", "moreover", "furthermore", "additionally", "also",
            "therefore", "consequently", "for example", "in addition",
        ]
        text = " ".join(sentences)
        transition_count = sum(1 for t in transition_words if t in text)
        score += min(transition_count * 3, 15)
        if len(sentences) >= 3:
            score += 10
        score = max(10, min(100, score))
        return {
            "score": score,
            "label": self._score_label(score),
            "detail": f"Used {transition_count} transition words across {len(sentences)} sentences",
        }

    def _analyze_sentiment(self, words: list) -> dict:
        pos = sum(1 for w in words if w in self.POSITIVE_WORDS)
        neg = sum(1 for w in words if w in self.NEGATIVE_WORDS)
        total = pos + neg
        if total == 0:
            polarity = 0.0
        else:
            polarity = (pos - neg) / total
        if polarity > 0.3:
            label = "Positive"
        elif polarity > 0:
            label = "Slightly Positive"
        elif polarity > -0.3:
            label = "Neutral"
        else:
            label = "Negative"
        return {
            "polarity": round(polarity, 2),
            "label": label,
            "positive_words": pos,
            "negative_words": neg,
        }

    def _count_filler_words(self, text: str) -> dict:
        found = {}
        for filler in self.FILLER_WORDS:
            count = len(re.findall(r"\b" + re.escape(filler) + r"\b", text))
            if count > 0:
                found[filler] = count
        total = sum(found.values())
        return {
            "total": total,
            "words": found,
            "rating": "Excellent" if total == 0 else "Good" if total <= 3 else "Needs Improvement",
        }

    def _identify_strengths(self, text: str, words: list) -> list:
        strengths = []
        unique_ratio = len(set(words)) / max(len(words), 1)
        if unique_ratio > 0.6:
            strengths.append("Strong vocabulary diversity")
        action_verbs = [w for w in words if w in self.STRONG_ACTION_VERBS]
        if len(action_verbs) >= 3:
            strengths.append(f"Effective use of action verbs ({len(action_verbs)} found)")
        pos_count = sum(1 for w in words if w in self.POSITIVE_WORDS)
        if pos_count >= 3:
            strengths.append("Positive and professional tone")
        sentences = self._split_sentences(text)
        avg_len = len(words) / max(len(sentences), 1)
        if 10 <= avg_len <= 25:
            strengths.append("Well-structured sentence length")
        if len(sentences) >= 5:
            strengths.append("Detailed and comprehensive responses")
        if not strengths:
            strengths.append("Attempted to provide structured responses")
        return strengths

    def _identify_improvements(self, text: str, words: list, sentences: list) -> list:
        improvements = []
        filler_count = sum(1 for w in words if w in self.FILLER_WORDS)
        if filler_count > 3:
            improvements.append(f"Reduce filler words ({filler_count} detected)")
        hedging = ["maybe", "perhaps", "possibly", "might", "could"]
        hedge_count = sum(1 for h in hedging if h in text)
        if hedge_count > 2:
            improvements.append("Reduce hedging language to sound more confident")
        if len(words) < 50:
            improvements.append("Provide more detailed responses")
        neg_count = sum(1 for w in words if w in self.NEGATIVE_WORDS)
        if neg_count > 3:
            improvements.append("Focus on positive framing and language")
        avg_len = len(words) / max(len(sentences), 1)
        if avg_len > 30:
            improvements.append("Break long sentences into shorter, clearer ones")
        if len(sentences) < 3:
            improvements.append("Elaborate more on your experiences")
        if not improvements:
            improvements.append("Continue practicing to maintain strong performance")
        return improvements

    def _find_keywords(self, text: str) -> dict:
        found = {}
        for category, keywords in self.INDUSTRY_KEYWORDS.items():
            matches = [k for k in keywords if k in text]
            if matches:
                found[category] = matches
        return found

    def _find_action_verbs(self, words: list) -> list:
        return list(set(w for w in words if w in self.STRONG_ACTION_VERBS))

    def _detect_questions(self, text: str) -> list:
        questions = re.findall(r"[^.!]*\?", text)
        return [q.strip() for q in questions if q.strip()]

    def _score_label(self, score: int) -> str:
        if score >= 85:
            return "Excellent"
        elif score >= 70:
            return "Good"
        elif score >= 50:
            return "Average"
        elif score >= 30:
            return "Below Average"
        return "Needs Significant Improvement"

    def _empty_result(self) -> dict:
        return {
            "overall_score": 0,
            "communication": {"score": 0, "label": "N/A", "detail": "No content to analyze"},
            "confidence": {"score": 0, "label": "N/A", "detail": "No content to analyze"},
            "vocabulary": {"score": 0, "label": "N/A", "detail": "No content to analyze"},
            "clarity": {"score": 0, "label": "N/A", "detail": "No content to analyze"},
            "sentiment": {"polarity": 0, "label": "N/A", "positive_words": 0, "negative_words": 0},
            "filler_words": {"total": 0, "words": {}, "rating": "N/A"},
            "strengths": ["Provide content for analysis"],
            "improvements": ["Share your interview responses for feedback"],
            "keywords_found": {},
            "word_count": 0,
            "sentence_count": 0,
            "avg_sentence_length": 0,
            "action_verbs_used": [],
            "questions_detected": [],
        }
