# groq_ai.py

def get_recommended_courses_for_stream(stream_name: str) -> list:
    """
    Use Groq AI to recommend relevant courses for a given stream.
    Replace the mock logic below with actual Groq API integration.
    """
    # Example: Replace with Groq API call and parsing
    stream_to_courses = {
        "Journalism & Mass Communication": [
            "Mass Communication", "Media Studies", "Journalism", "Public Relations", "Advertising"
        ],
        "Computer Science & Engineering": [
            "Computer Science", "Information Technology", "Software Engineering"
        ],
        "Business Administration": [
            "Business Administration", "Management", "Finance", "Marketing"
        ],
        # Add more mappings or use Groq API dynamically
    }
    # Fallback: return all courses for unknown streams
    return stream_to_courses.get(stream_name, [])
