"""
Comprehensive Career Streams Database for AI-Powered Matching
Contains detailed information about career streams, requirements, and opportunities
Specifically tailored for Indian students, with J&K context
"""

COMPREHENSIVE_STREAMS_DATABASE = {
    "engineering_technology": {
        "computer_science_engineering": {
            "name": "Computer Science & Engineering",
            "category": "Engineering & Technology",
            "description": "Focus on software development, algorithms, data structures, and computer systems",
            "personality_requirements": {
                "analytical_thinking": 0.75,
                "technical_aptitude": 0.80,
                "creativity": 0.60,
                "research_orientation": 0.65
            },
            "academic_requirements": {
                "mathematics": 75,
                "physics": 70,
                "chemistry": 65,
                "english": 60
            },
            "entrance_exams": ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEEE"],
            "duration": "4 years (B.Tech)",
            "career_paths": [
                "Software Engineer", "Data Scientist", "AI/ML Engineer", "Cybersecurity Analyst",
                "Full Stack Developer", "DevOps Engineer", "Product Manager", "Tech Entrepreneur",
                "Research Scientist", "System Architect", "Mobile App Developer", "Game Developer"
            ],
            "salary_range": {
                "entry_level": "₹4-12 LPA",
                "mid_level": "₹12-25 LPA",
                "senior_level": "₹25-50+ LPA"
            },
            "growth_prospects": "Excellent",
            "jk_opportunities": [
                "IT companies in Srinagar and Jammu",
                "Government digitization projects",
                "Remote work for global companies",
                "Startup ecosystem development",
                "E-governance initiatives"
            ],
            "top_colleges": [
                "IIT Delhi", "IIT Bombay", "NIT Srinagar", "IIIT Hyderabad", 
                "University of Kashmir", "Jammu University"
            ],
            "skills_required": [
                "Programming Languages", "Problem Solving", "Data Structures",
                "Algorithms", "Database Management", "Software Engineering"
            ],
            "future_trends": [
                "Artificial Intelligence", "Machine Learning", "Blockchain",
                "IoT", "Cloud Computing", "Quantum Computing"
            ]
        },
        
        "electrical_engineering": {
            "name": "Electrical Engineering",
            "category": "Engineering & Technology",
            "description": "Focus on electrical systems, power generation, electronics, and automation",
            "personality_requirements": {
                "analytical_thinking": 0.80,
                "technical_aptitude": 0.85,
                "research_orientation": 0.70,
                "creativity": 0.55
            },
            "academic_requirements": {
                "mathematics": 80,
                "physics": 85,
                "chemistry": 70,
                "english": 60
            },
            "entrance_exams": ["JEE Main", "JEE Advanced", "GATE"],
            "duration": "4 years (B.Tech)",
            "career_paths": [
                "Power Systems Engineer", "Electronics Engineer", "Control Systems Engineer",
                "Renewable Energy Engineer", "Automation Engineer", "Electrical Design Engineer",
                "Power Plant Engineer", "Transmission Engineer", "Research Engineer"
            ],
            "salary_range": {
                "entry_level": "₹3-8 LPA",
                "mid_level": "₹8-18 LPA",
                "senior_level": "₹18-35 LPA"
            },
            "growth_prospects": "Very Good",
            "jk_opportunities": [
                "NHPC power projects", "Renewable energy initiatives",
                "Electrical infrastructure development", "Smart grid projects",
                "Rural electrification programs"
            ],
            "top_colleges": [
                "IIT Roorkee", "IIT Kanpur", "NIT Srinagar", "Jammu University",
                "BITS Pilani", "Delhi Technological University"
            ],
            "skills_required": [
                "Circuit Analysis", "Power Systems", "Control Theory",
                "Electronics", "Programming", "Project Management"
            ],
            "future_trends": [
                "Smart Grids", "Electric Vehicles", "Renewable Energy",
                "IoT in Power Systems", "Energy Storage"
            ]
        },
        
        "civil_engineering": {
            "name": "Civil Engineering",
            "category": "Engineering & Technology",
            "description": "Focus on infrastructure development, construction, and urban planning",
            "personality_requirements": {
                "analytical_thinking": 0.75,
                "technical_aptitude": 0.70,
                "leadership": 0.65,
                "research_orientation": 0.60
            },
            "academic_requirements": {
                "mathematics": 75,
                "physics": 80,
                "chemistry": 65,
                "english": 60
            },
            "entrance_exams": ["JEE Main", "JEE Advanced", "GATE"],
            "duration": "4 years (B.Tech)",
            "career_paths": [
                "Structural Engineer", "Construction Manager", "Urban Planner",
                "Transportation Engineer", "Environmental Engineer", "Geotechnical Engineer",
                "Project Manager", "Infrastructure Consultant", "Government Engineer"
            ],
            "salary_range": {
                "entry_level": "₹3-7 LPA",
                "mid_level": "₹7-15 LPA",
                "senior_level": "₹15-30 LPA"
            },
            "growth_prospects": "Good",
            "jk_opportunities": [
                "Infrastructure development projects", "Smart city initiatives",
                "Earthquake-resistant construction", "Tourism infrastructure",
                "Border area development", "Sustainable construction"
            ],
            "top_colleges": [
                "IIT Madras", "IIT Delhi", "NIT Srinagar", "Jammu University",
                "Delhi Technological University", "Thapar Institute"
            ],
            "skills_required": [
                "Structural Analysis", "Construction Management", "AutoCAD",
                "Project Planning", "Material Science", "Surveying"
            ],
            "future_trends": [
                "Green Building", "Smart Infrastructure", "3D Printing in Construction",
                "Sustainable Materials", "BIM Technology"
            ]
        }
    },
    
    "medical_health": {
        "medicine_mbbs": {
            "name": "Medicine (MBBS)",
            "category": "Medical & Health Sciences",
            "description": "Comprehensive medical education leading to becoming a doctor",
            "personality_requirements": {
                "helping_others": 0.85,
                "analytical_thinking": 0.80,
                "research_orientation": 0.70,
                "social_skills": 0.75
            },
            "academic_requirements": {
                "biology": 85,
                "chemistry": 80,
                "physics": 75,
                "english": 70
            },
            "entrance_exams": ["NEET UG", "AIIMS", "JIPMER"],
            "duration": "5.5 years (MBBS + Internship)",
            "career_paths": [
                "General Physician", "Specialist Doctor", "Surgeon", "Medical Researcher",
                "Public Health Officer", "Medical Administrator", "Emergency Medicine",
                "Rural Health Practitioner", "Medical Consultant", "Healthcare Entrepreneur"
            ],
            "salary_range": {
                "entry_level": "₹6-15 LPA",
                "mid_level": "₹15-40 LPA",
                "senior_level": "₹40-100+ LPA"
            },
            "growth_prospects": "Excellent",
            "jk_opportunities": [
                "Government medical colleges", "District hospitals",
                "Rural healthcare centers", "Telemedicine initiatives",
                "Medical tourism", "Specialized high-altitude medicine"
            ],
            "top_colleges": [
                "AIIMS Delhi", "AIIMS Jammu", "Government Medical College Srinagar",
                "Government Medical College Jammu", "JIPMER", "MAMC Delhi"
            ],
            "skills_required": [
                "Medical Knowledge", "Patient Care", "Diagnostic Skills",
                "Communication", "Empathy", "Critical Thinking"
            ],
            "future_trends": [
                "Telemedicine", "AI in Diagnostics", "Personalized Medicine",
                "Robotic Surgery", "Digital Health Records"
            ]
        },
        
        "nursing": {
            "name": "Nursing",
            "category": "Medical & Health Sciences",
            "description": "Healthcare profession focused on patient care and health promotion",
            "personality_requirements": {
                "helping_others": 0.90,
                "social_skills": 0.80,
                "analytical_thinking": 0.65,
                "leadership": 0.60
            },
            "academic_requirements": {
                "biology": 70,
                "chemistry": 65,
                "physics": 60,
                "english": 70
            },
            "entrance_exams": ["State Nursing Entrance", "AIIMS Nursing", "JIPMER Nursing"],
            "duration": "4 years (B.Sc Nursing)",
            "career_paths": [
                "Staff Nurse", "Nurse Practitioner", "Nursing Supervisor",
                "Community Health Nurse", "Critical Care Nurse", "Nursing Educator",
                "Nursing Administrator", "Public Health Nurse", "International Nursing"
            ],
            "salary_range": {
                "entry_level": "₹2-5 LPA",
                "mid_level": "₹5-12 LPA",
                "senior_level": "₹12-25 LPA"
            },
            "growth_prospects": "Very Good",
            "jk_opportunities": [
                "Government hospitals", "Private healthcare facilities",
                "Community health centers", "NGO health programs",
                "International opportunities", "Home healthcare services"
            ],
            "top_colleges": [
                "AIIMS Nursing Colleges", "Government Nursing Colleges",
                "Jammu University", "University of Kashmir"
            ],
            "skills_required": [
                "Patient Care", "Medical Procedures", "Communication",
                "Empathy", "Time Management", "Emergency Response"
            ],
            "future_trends": [
                "Advanced Practice Nursing", "Telehealth", "Geriatric Care",
                "Mental Health Nursing", "Technology Integration"
            ]
        }
    },
    
    "business_management": {
        "business_administration": {
            "name": "Business Administration (BBA/MBA)",
            "category": "Business & Management",
            "description": "Comprehensive business education covering management, finance, and operations",
            "personality_requirements": {
                "leadership": 0.75,
                "entrepreneurial_spirit": 0.70,
                "social_skills": 0.70,
                "analytical_thinking": 0.65
            },
            "academic_requirements": {
                "mathematics": 70,
                "english": 75,
                "economics": 70,
                "any_subject": 65
            },
            "entrance_exams": ["CAT", "XAT", "GMAT", "MAT", "CMAT", "SNAP"],
            "duration": "3 years (BBA) + 2 years (MBA)",
            "career_paths": [
                "Business Manager", "Management Consultant", "Financial Analyst",
                "Marketing Manager", "Operations Manager", "HR Manager",
                "Business Analyst", "Entrepreneur", "Project Manager", "Investment Banker"
            ],
            "salary_range": {
                "entry_level": "₹4-10 LPA",
                "mid_level": "₹10-25 LPA",
                "senior_level": "₹25-60+ LPA"
            },
            "growth_prospects": "Excellent",
            "jk_opportunities": [
                "Tourism industry management", "Handicraft business development",
                "Government administration", "Banking sector", "Startup ecosystem",
                "Export-import business", "Hospitality management"
            ],
            "top_colleges": [
                "IIM Ahmedabad", "IIM Bangalore", "University of Kashmir",
                "Jammu University", "XLRI", "FMS Delhi"
            ],
            "skills_required": [
                "Leadership", "Strategic Thinking", "Communication",
                "Financial Analysis", "Team Management", "Problem Solving"
            ],
            "future_trends": [
                "Digital Business", "Sustainable Business", "Data Analytics",
                "E-commerce", "Social Entrepreneurship"
            ]
        },
        
        "chartered_accountancy": {
            "name": "Chartered Accountancy (CA)",
            "category": "Business & Finance",
            "description": "Professional accounting and financial management qualification",
            "personality_requirements": {
                "analytical_thinking": 0.85,
                "research_orientation": 0.75,
                "technical_aptitude": 0.70,
                "entrepreneurial_spirit": 0.60
            },
            "academic_requirements": {
                "mathematics": 80,
                "accountancy": 85,
                "economics": 75,
                "english": 70
            },
            "entrance_exams": ["CA Foundation", "CA Intermediate", "CA Final"],
            "duration": "3-5 years (depending on route)",
            "career_paths": [
                "Chartered Accountant", "Financial Advisor", "Tax Consultant",
                "Audit Manager", "CFO", "Investment Analyst", "Financial Controller",
                "Business Consultant", "Forensic Accountant", "Independent Practice"
            ],
            "salary_range": {
                "entry_level": "₹6-12 LPA",
                "mid_level": "₹12-30 LPA",
                "senior_level": "₹30-80+ LPA"
            },
            "growth_prospects": "Excellent",
            "jk_opportunities": [
                "CA firms in major cities", "Corporate finance roles",
                "Government financial positions", "Banking sector",
                "Independent practice", "Business consulting"
            ],
            "top_institutes": [
                "ICAI (Institute of Chartered Accountants of India)",
                "Various coaching institutes across India"
            ],
            "skills_required": [
                "Accounting", "Financial Analysis", "Taxation",
                "Auditing", "Business Law", "Excel Proficiency"
            ],
            "future_trends": [
                "Digital Accounting", "Data Analytics", "Blockchain in Finance",
                "ESG Reporting", "Fintech Integration"
            ]
        }
    },
    
    "liberal_arts": {
        "psychology": {
            "name": "Psychology",
            "category": "Liberal Arts & Social Sciences",
            "description": "Study of human behavior, mental processes, and psychological well-being",
            "personality_requirements": {
                "helping_others": 0.80,
                "social_skills": 0.75,
                "research_orientation": 0.70,
                "analytical_thinking": 0.65
            },
            "academic_requirements": {
                "english": 75,
                "psychology": 80,
                "sociology": 70,
                "any_subject": 65
            },
            "entrance_exams": ["CUET", "BHU UET", "DU Entrance", "State University Exams"],
            "duration": "3 years (BA) + 2 years (MA) + PhD (optional)",
            "career_paths": [
                "Clinical Psychologist", "Counseling Psychologist", "School Psychologist",
                "Industrial Psychologist", "Research Psychologist", "Therapist",
                "Mental Health Counselor", "Educational Consultant", "HR Specialist"
            ],
            "salary_range": {
                "entry_level": "₹3-8 LPA",
                "mid_level": "₹8-18 LPA",
                "senior_level": "₹18-40 LPA"
            },
            "growth_prospects": "Very Good",
            "jk_opportunities": [
                "Mental health centers", "Educational institutions",
                "NGOs working on social issues", "Government counseling services",
                "Private practice", "Corporate wellness programs"
            ],
            "top_colleges": [
                "University of Delhi", "Jamia Millia Islamia", "University of Kashmir",
                "Jammu University", "Christ University", "Fergusson College"
            ],
            "skills_required": [
                "Empathy", "Active Listening", "Research Methods",
                "Statistical Analysis", "Communication", "Ethical Practice"
            ],
            "future_trends": [
                "Digital Mental Health", "Neuropsychology", "Positive Psychology",
                "Cross-cultural Psychology", "AI in Mental Health"
            ]
        },
        
        "journalism_mass_communication": {
            "name": "Journalism & Mass Communication",
            "category": "Liberal Arts & Media",
            "description": "Study of media, communication, and information dissemination",
            "personality_requirements": {
                "creativity": 0.80,
                "social_skills": 0.75,
                "research_orientation": 0.70,
                "leadership": 0.60
            },
            "academic_requirements": {
                "english": 80,
                "general_knowledge": 75,
                "any_subject": 65,
                "communication_skills": 80
            },
            "entrance_exams": ["IIMC Entrance", "JMI Mass Comm", "CUET", "IPU CET"],
            "duration": "3 years (BA) + 2 years (MA)",
            "career_paths": [
                "Journalist", "News Anchor", "Content Writer", "Digital Marketer",
                "Public Relations Officer", "Social Media Manager", "Documentary Filmmaker",
                "Radio Jockey", "Editor", "Media Researcher", "Communication Consultant"
            ],
            "salary_range": {
                "entry_level": "₹2-6 LPA",
                "mid_level": "₹6-15 LPA",
                "senior_level": "₹15-35 LPA"
            },
            "growth_prospects": "Good",
            "jk_opportunities": [
                "Local news channels", "Digital media startups",
                "Government communication roles", "Tourism promotion",
                "Cultural documentation", "Freelance journalism"
            ],
            "top_colleges": [
                "IIMC Delhi", "Jamia Millia Islamia", "University of Kashmir",
                "Jammu University", "SIMC Pune", "Xavier Institute"
            ],
            "skills_required": [
                "Writing", "Research", "Communication", "Digital Media",
                "Video Editing", "Social Media", "Critical Thinking"
            ],
            "future_trends": [
                "Digital Journalism", "Data Journalism", "Podcasting",
                "Social Media Journalism", "AI in Media"
            ]
        }
    },
    
    "pure_sciences": {
        "physics": {
            "name": "Physics",
            "category": "Pure Sciences",
            "description": "Study of matter, energy, and the fundamental laws of nature",
            "personality_requirements": {
                "analytical_thinking": 0.85,
                "research_orientation": 0.80,
                "technical_aptitude": 0.75,
                "creativity": 0.60
            },
            "academic_requirements": {
                "physics": 85,
                "mathematics": 85,
                "chemistry": 75,
                "english": 65
            },
            "entrance_exams": ["CUET", "IIT JAM", "GATE", "NET", "University Specific"],
            "duration": "3 years (BSc) + 2 years (MSc) + PhD",
            "career_paths": [
                "Research Scientist", "Physics Professor", "Data Scientist",
                "Quantum Computing Researcher", "Astrophysicist", "Medical Physicist",
                "Nuclear Physicist", "Optical Engineer", "Scientific Consultant"
            ],
            "salary_range": {
                "entry_level": "₹3-8 LPA",
                "mid_level": "₹8-20 LPA",
                "senior_level": "₹20-50+ LPA"
            },
            "growth_prospects": "Good",
            "jk_opportunities": [
                "Research institutions", "Universities", "DRDO labs",
                "Space research centers", "Nuclear facilities",
                "Renewable energy research", "High-altitude physics research"
            ],
            "top_colleges": [
                "IISc Bangalore", "University of Kashmir", "Jammu University",
                "Delhi University", "JNU", "IIT Physics Departments"
            ],
            "skills_required": [
                "Mathematical Modeling", "Experimental Design", "Data Analysis",
                "Programming", "Scientific Writing", "Critical Thinking"
            ],
            "future_trends": [
                "Quantum Computing", "Renewable Energy", "Space Technology",
                "Nanotechnology", "Artificial Intelligence Applications"
            ]
        }
    },
    
    "agriculture_environment": {
        "agriculture": {
            "name": "Agriculture & Agricultural Engineering",
            "category": "Agriculture & Environment",
            "description": "Study of crop production, soil science, and sustainable farming",
            "personality_requirements": {
                "research_orientation": 0.75,
                "helping_others": 0.70,
                "analytical_thinking": 0.65,
                "entrepreneurial_spirit": 0.60
            },
            "academic_requirements": {
                "biology": 75,
                "chemistry": 70,
                "physics": 65,
                "mathematics": 65
            },
            "entrance_exams": ["ICAR AIEEA", "State Agriculture Entrance", "JEE Main (for Agri Engg)"],
            "duration": "4 years (B.Sc Agriculture/B.Tech Agri Engg)",
            "career_paths": [
                "Agricultural Scientist", "Farm Manager", "Agricultural Engineer",
                "Soil Scientist", "Crop Consultant", "Agricultural Officer",
                "Agribusiness Manager", "Food Technologist", "Rural Development Officer"
            ],
            "salary_range": {
                "entry_level": "₹3-7 LPA",
                "mid_level": "₹7-15 LPA",
                "senior_level": "₹15-30 LPA"
            },
            "growth_prospects": "Very Good",
            "jk_opportunities": [
                "Saffron cultivation research", "Apple farming technology",
                "Organic farming initiatives", "Agricultural cooperatives",
                "Government agricultural departments", "Agri-tech startups"
            ],
            "top_colleges": [
                "IARI Delhi", "SKUAST Kashmir", "SKUAST Jammu",
                "Punjab Agricultural University", "Tamil Nadu Agricultural University"
            ],
            "skills_required": [
                "Crop Science", "Soil Management", "Farm Technology",
                "Data Analysis", "Project Management", "Sustainable Practices"
            ],
            "future_trends": [
                "Precision Agriculture", "Drone Technology", "Organic Farming",
                "Climate-Smart Agriculture", "Agri-Tech Innovation"
            ]
        }
    },
    
    "creative_arts": {
        "fine_arts": {
            "name": "Fine Arts & Design",
            "category": "Creative Arts",
            "description": "Study of visual arts, design, and creative expression",
            "personality_requirements": {
                "creativity": 0.90,
                "artistic_ability": 0.85,
                "social_skills": 0.60,
                "entrepreneurial_spirit": 0.55
            },
            "academic_requirements": {
                "art": 80,
                "english": 70,
                "any_subject": 60,
                "portfolio": 85
            },
            "entrance_exams": ["NID Entrance", "NIFT Entrance", "CEED", "UCEED", "University Specific"],
            "duration": "3-4 years (BFA/B.Des)",
            "career_paths": [
                "Graphic Designer", "UI/UX Designer", "Art Director",
                "Illustrator", "Animator", "Interior Designer", "Fashion Designer",
                "Product Designer", "Art Teacher", "Freelance Artist"
            ],
            "salary_range": {
                "entry_level": "₹2-6 LPA",
                "mid_level": "₹6-15 LPA",
                "senior_level": "₹15-40+ LPA"
            },
            "growth_prospects": "Good",
            "jk_opportunities": [
                "Handicraft design", "Tourism promotion materials",
                "Cultural preservation projects", "Digital design agencies",
                "Film and media industry", "Art galleries and museums"
            ],
            "top_colleges": [
                "NID Ahmedabad", "NIFT Delhi", "University of Kashmir (Fine Arts)",
                "Jammu University", "Srishti Institute", "Pearl Academy"
            ],
            "skills_required": [
                "Drawing", "Digital Design Tools", "Color Theory",
                "Typography", "Creative Thinking", "Portfolio Development"
            ],
            "future_trends": [
                "Digital Art", "VR/AR Design", "Sustainable Design",
                "Motion Graphics", "Interactive Media"
            ]
        }
    }
}

def get_stream_by_category(category):
    """Get all streams in a specific category"""
    streams = []
    for cat_key, cat_data in COMPREHENSIVE_STREAMS_DATABASE.items():
        if cat_key == category:
            for stream_key, stream_data in cat_data.items():
                streams.append(stream_data)
    return streams

def get_all_streams():
    """Get all streams from the database"""
    all_streams = []
    for category in COMPREHENSIVE_STREAMS_DATABASE.values():
        for stream in category.values():
            all_streams.append(stream)
    return all_streams

def search_streams_by_requirements(trait_scores, academic_performance, threshold=0.6):
    """Search streams that match given requirements"""
    matching_streams = []
    all_streams = get_all_streams()
    
    for stream in all_streams:
        # Calculate personality match
        personality_match = 0
        personality_count = 0
        
        for trait, required_score in stream["personality_requirements"].items():
            if trait in trait_scores:
                user_score = trait_scores[trait]
                if user_score >= required_score * threshold:
                    personality_match += min(1.0, user_score / required_score)
                else:
                    personality_match += (user_score / required_score) * 0.7
                personality_count += 1
        
        if personality_count > 0:
            personality_match /= personality_count
        
        # Calculate academic match
        academic_match = 0
        academic_count = 0
        
        for subject, required_score in stream["academic_requirements"].items():
            if subject in academic_performance or subject == "any_subject":
                if subject == "any_subject":
                    # Use average of all subjects
                    user_score = sum(academic_performance.values()) / len(academic_performance)
                else:
                    user_score = academic_performance.get(subject, 0)
                
                if user_score >= required_score * threshold:
                    academic_match += min(1.0, user_score / required_score)
                else:
                    academic_match += (user_score / required_score) * 0.8
                academic_count += 1
        
        if academic_count > 0:
            academic_match /= academic_count
        
        # Overall match (70% personality, 30% academic)
        overall_match = personality_match * 0.7 + academic_match * 0.3
        
        if overall_match >= threshold:
            matching_streams.append({
                "stream_data": stream,
                "match_score": overall_match,
                "personality_match": personality_match,
                "academic_match": academic_match
            })
    
    # Sort by match score
    matching_streams.sort(key=lambda x: x["match_score"], reverse=True)
    return matching_streams