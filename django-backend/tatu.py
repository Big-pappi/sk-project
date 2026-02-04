from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib import colors
from datetime import datetime

def create_tatu_research_pdf():
    filename = "TATU_Research_Proposal.pdf"
    doc = SimpleDocTemplate(filename, pagesize=A4,
                            topMargin=1*inch, bottomMargin=1*inch,
                            leftMargin=1.25*inch, rightMargin=1*inch)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.black,
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=6
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.black,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.black,
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        leading=14
    )
    
    # COVER PAGE
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("MBEYA UNIVERSITY OF SCIENCE AND TECHNOLOGY", title_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", subtitle_style))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph("RESEARCH PROPOSAL FOR AWARD OF BACHELOR OF SCIENCE IN COMPUTER SCIENCE", subtitle_style))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph("<b>TATU: AN AI-POWERED STUDENT SUPPORT SYSTEM FOR PERSONALIZED ACADEMIC AND CAREER GUIDANCE</b>", title_style))
    story.append(Spacer(1, 1.5*inch))
    
    story.append(Paragraph("<b>BY</b>", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("<b>STUDENT NAME</b>", subtitle_style))
    story.append(Paragraph("Registration Number: MUST/XXX/XXXX", subtitle_style))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph(f"<b>{datetime.now().strftime('%B %Y')}</b>", subtitle_style))
    story.append(PageBreak())
    
    # SUPERVISOR'S CERTIFICATION
    story.append(Paragraph("SUPERVISOR'S CERTIFICATION", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    cert_text = """I, the undersigned, certify that I have read and hereby recommend for acceptance by Mbeya University of Science and Technology a research proposal entitled "TATU: An AI-Powered Student Support System for Personalized Academic and Career Guidance" in fulfillment of the requirements for the award of Bachelor of Science in Computer Science of Mbeya University of Science and Technology."""
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph("_______________________________", body_style))
    story.append(Paragraph("<b>Supervisor Name</b>", body_style))
    story.append(Paragraph("Signature: ___________________ Date: ___________", body_style))
    story.append(PageBreak())
    
    # DECLARATION
    story.append(Paragraph("DECLARATION", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    decl_text = """I, [Student Name], do hereby declare to Mbeya University of Science and Technology that this research proposal is my original work and that it has not been submitted and will not be presented to any other University or Institution for a similar or any other degree award."""
    story.append(Paragraph(decl_text, body_style))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph("_______________________________", body_style))
    story.append(Paragraph("<b>Student Name</b>", body_style))
    story.append(Paragraph("Registration Number: MUST/XXX/XXXX", body_style))
    story.append(Paragraph("Signature: ___________________ Date: ___________", body_style))
    story.append(PageBreak())
    
    # ACKNOWLEDGEMENT
    story.append(Paragraph("ACKNOWLEDGEMENT", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    ack_text = """I would like to express my sincere gratitude to all those who contributed to the completion of this research proposal. Special thanks to my supervisor for their invaluable guidance, support, and constructive feedback throughout this research process. I am also grateful to the faculty members of the Department of Computer Science and Engineering at Mbeya University of Science and Technology for their encouragement and academic support. Finally, I thank my family and friends for their unwavering support and motivation during this academic journey."""
    story.append(Paragraph(ack_text, body_style))
    story.append(PageBreak())
    
    # DEDICATION
    story.append(Paragraph("DEDICATION", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    ded_text = """This research is dedicated to all students striving for academic excellence and to those who believe in the transformative power of technology in education."""
    story.append(Paragraph(ded_text, body_style))
    story.append(PageBreak())
    
    # ABSTRACT
    story.append(Paragraph("ABSTRACT", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    abstract_text = """The increasing complexity of academic curricula and diverse career pathways in higher education institutions presents significant challenges for students in making informed decisions about their academic progress and career choices. Students often lack personalized guidance tailored to their unique learning patterns, strengths, and aspirations. This research proposes the development of TATU, an AI-powered student support system designed to provide personalized academic and career guidance. The system leverages artificial intelligence, machine learning algorithms, and natural language processing to analyze student data, identify learning patterns, predict academic performance, and recommend tailored interventions and career pathways. The research will employ a mixed-methods approach, combining quantitative data analysis with qualitative user feedback to evaluate the system's effectiveness. Expected outcomes include improved student retention rates, enhanced academic performance, increased student satisfaction with academic advising, and better alignment between student skills and career opportunities. This research contributes to the growing body of knowledge on AI applications in education and demonstrates the potential of intelligent systems to transform student support services in higher education institutions."""
    story.append(Paragraph(abstract_text, body_style))
    story.append(PageBreak())
    
    # TABLE OF CONTENTS
    story.append(Paragraph("TABLE OF CONTENTS", heading1_style))
    story.append(Spacer(1, 0.2*inch))
    
    toc_data = [
        ["CHAPTER ONE: INTRODUCTION", "1"],
        ["1.1 Background of the Problem", "1"],
        ["1.2 Statement of the Problem", "3"],
        ["1.3 Objectives of the Study", "4"],
        ["1.3.1 General Objective", "4"],
        ["1.3.2 Specific Objectives", "4"],
        ["1.4 Research Questions", "5"],
        ["1.5 Significance of the Study", "5"],
        ["1.6 Scope and Limitations", "6"],
        ["CHAPTER TWO: LITERATURE REVIEW", "7"],
        ["2.1 Introduction", "7"],
        ["2.2 Theoretical Framework", "7"],
        ["2.3 Student Support Systems in Higher Education", "8"],
        ["2.4 Artificial Intelligence in Education", "9"],
        ["2.5 Related Systems and Applications", "11"],
        ["2.6 Research Gap", "13"],
        ["CHAPTER THREE: RESEARCH METHODOLOGY", "14"],
        ["3.1 Introduction", "14"],
        ["3.2 Research Design", "14"],
        ["3.3 System Design and Architecture", "15"],
        ["3.4 Data Collection Methods", "16"],
        ["3.5 System Development Methodology", "17"],
        ["3.6 Evaluation Framework", "18"],
        ["3.7 Ethical Considerations", "19"],
        ["REFERENCES", "20"],
        ["APPENDICES", "23"],
    ]
    
    toc_table = Table(toc_data, colWidths=[5*inch, 0.7*inch])
    toc_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(toc_table)
    story.append(PageBreak())
    
    # LIST OF ABBREVIATIONS
    story.append(Paragraph("LIST OF ABBREVIATIONS", heading1_style))
    story.append(Spacer(1, 0.2*inch))
    
    abbr_data = [
        ["AI", "Artificial Intelligence"],
        ["ML", "Machine Learning"],
        ["NLP", "Natural Language Processing"],
        ["GPA", "Grade Point Average"],
        ["API", "Application Programming Interface"],
        ["UI", "User Interface"],
        ["MUST", "Mbeya University of Science and Technology"],
        ["LMS", "Learning Management System"],
    ]
    
    abbr_table = Table(abbr_data, colWidths=[1*inch, 4.5*inch])
    abbr_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(abbr_table)
    story.append(PageBreak())
    
    # CHAPTER ONE: INTRODUCTION
    story.append(Paragraph("CHAPTER ONE", heading1_style))
    story.append(Paragraph("INTRODUCTION", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("1.1 Background of the Problem", heading2_style))
    bg_text = """The landscape of higher education has undergone significant transformation in recent decades, characterized by increasing student diversity, expanding curriculum offerings, and growing complexity in career pathways. Students in contemporary higher education institutions face numerous challenges in navigating their academic journey, from course selection and study planning to career preparation and skill development. Traditional academic advising systems, while valuable, often struggle to provide personalized, timely, and scalable support to meet the diverse needs of the modern student population.

Research indicates that effective student support services are crucial determinants of academic success, retention, and career readiness. However, many institutions face constraints in terms of advisor-to-student ratios, limited availability of personalized guidance, and challenges in tracking and analyzing student progress data comprehensively. These limitations can result in missed opportunities for early intervention, delayed detection of at-risk students, and suboptimal alignment between student capabilities and career opportunities.

The advent of artificial intelligence and machine learning technologies presents unprecedented opportunities to enhance student support services. AI-powered systems can process vast amounts of student data, identify patterns and trends, provide personalized recommendations, and scale support services to reach larger student populations. Recent advancements in natural language processing enable these systems to interact with students through conversational interfaces, making guidance more accessible and engaging."""
    story.append(Paragraph(bg_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("1.2 Statement of the Problem", heading2_style))
    prob_text = """Students at higher education institutions face significant challenges in accessing personalized academic and career guidance. The current advisory system is characterized by high advisor-to-student ratios, limited availability of one-on-one consultations, and reactive rather than proactive intervention approaches. Students often struggle to:

• Make informed decisions about course selection aligned with their career goals
• Identify their learning strengths and areas requiring additional support
• Access timely interventions when facing academic difficulties
• Understand career pathways and skill requirements in their fields of interest
• Receive personalized recommendations based on their unique academic profiles

These challenges contribute to suboptimal academic performance, higher dropout rates, career misalignment, and student dissatisfaction with support services. There is a critical need for an intelligent, scalable, and personalized student support system that can provide data-driven guidance, early intervention, and continuous support throughout the student's academic journey."""
    story.append(Paragraph(prob_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("1.3 Objectives of the Study", heading2_style))
    story.append(Paragraph("1.3.1 General Objective", heading2_style))
    gen_obj = """To develop an AI-powered student support system (TATU) that provides personalized academic and career guidance to enhance student success and career readiness."""
    story.append(Paragraph(gen_obj, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("1.3.2 Specific Objectives", heading2_style))
    spec_obj = """1. To design and implement a machine learning model that analyzes student academic data and predicts performance outcomes
2. To develop a personalized recommendation system for course selection and study planning
3. To create an intelligent chatbot interface for student-system interaction using natural language processing
4. To build a career guidance module that matches student profiles with suitable career pathways
5. To evaluate the system's effectiveness in improving student outcomes and satisfaction"""
    story.append(Paragraph(spec_obj, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("1.4 Research Questions", heading2_style))
    rq_text = """1. How can machine learning algorithms effectively predict student academic performance based on historical data?
2. What factors most significantly influence student success and should be prioritized in personalized recommendations?
3. How can natural language processing enhance student engagement with academic support systems?
4. What metrics effectively measure the impact of AI-powered guidance on student outcomes?
5. How can the system ensure fairness, transparency, and ethical use of student data?"""
    story.append(Paragraph(rq_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("1.5 Significance of the Study", heading2_style))
    sig_text = """This research holds significant value for multiple stakeholders in higher education. For students, the system will provide accessible, personalized guidance that enhances their academic experience and career preparation. Educational institutions will benefit from data-driven insights into student needs, enabling more effective resource allocation and intervention strategies. The research contributes to the academic field by demonstrating practical applications of AI in education and providing a framework for developing intelligent student support systems. Furthermore, the findings will inform policy discussions on technology integration in higher education and student services modernization."""
    story.append(Paragraph(sig_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("1.6 Scope and Limitations", heading2_style))
    scope_text = """This research will focus on developing and evaluating the TATU system within the context of undergraduate computer science students at Mbeya University of Science and Technology. The system will address academic guidance and career counseling, with initial implementation covering core academic functions. The study acknowledges limitations including the availability and quality of historical student data, the need for substantial computational resources, and potential challenges in user adoption. The research will not address financial aid counseling or personal counseling services, maintaining focus on academic and career guidance."""
    story.append(Paragraph(scope_text, body_style))
    story.append(PageBreak())
    
    # CHAPTER TWO: LITERATURE REVIEW
    story.append(Paragraph("CHAPTER TWO", heading1_style))
    story.append(Paragraph("LITERATURE REVIEW", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("2.1 Introduction", heading2_style))
    lit_intro = """This chapter provides a comprehensive review of existing literature related to student support systems, artificial intelligence in education, and personalized learning technologies. It examines theoretical frameworks guiding this research, explores current practices in academic advising, reviews AI applications in educational contexts, and identifies gaps in existing research that this study addresses."""
    story.append(Paragraph(lit_intro, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("2.2 Theoretical Framework", heading2_style))
    theory_text = """This research is grounded in several theoretical frameworks. The Theory of Self-Regulated Learning (Zimmerman, 2002) emphasizes the importance of learners taking control of their learning process, which aligns with the system's goal of empowering students through personalized guidance. The Technology Acceptance Model (Davis, 1989) provides a framework for understanding factors influencing user adoption of the AI-powered system. Additionally, the Theory of Planned Behavior (Ajzen, 1991) helps explain how personalized recommendations can influence student decision-making and behavior regarding academic choices."""
    story.append(Paragraph(theory_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("2.3 Student Support Systems in Higher Education", heading2_style))
    support_text = """Traditional student support systems in higher education have relied on human advisors providing guidance through scheduled appointments and group sessions. Research by Kuhn (2008) highlights the positive impact of effective academic advising on student retention and success. However, studies also reveal significant challenges including limited advisor availability, inconsistent advice quality, and scalability issues. Tinto's (2012) work on student retention emphasizes the critical role of timely intervention and personalized support, which traditional systems often struggle to provide at scale."""
    story.append(Paragraph(support_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("2.4 Artificial Intelligence in Education", heading2_style))
    ai_edu_text = """AI applications in education have gained significant traction in recent years. Luckin et al. (2016) provide a comprehensive overview of AI's potential in education, highlighting personalization, automation, and intelligent tutoring as key application areas. Baker and Inventado (2014) discuss the use of educational data mining and learning analytics to understand student behavior and improve educational outcomes. Recent work by Zawacki-Richter et al. (2019) systematically reviews AI applications in higher education, identifying student and learning services as a major application area with significant growth potential."""
    story.append(Paragraph(ai_edu_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("2.5 Related Systems and Applications", heading2_style))
    related_text = """Several institutions and organizations have developed AI-powered student support systems with varying capabilities. Georgia State University's Pounce chatbot (Page & Gehlbach, 2017) demonstrated success in improving student engagement and reducing summer melt. Arizona State University's adaptive learning platform showed improvements in course completion rates (Essa & Ayad, 2012). Commercial systems like Degree Compass (developed by Austin Peay State University) use predictive analytics to recommend courses. However, many existing systems focus on specific aspects of student support rather than providing comprehensive academic and career guidance in an integrated platform."""
    story.append(Paragraph(related_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("2.6 Research Gap", heading2_style))
    gap_text = """While existing literature demonstrates the potential of AI in education, several gaps remain. Most current systems focus on single aspects of student support (e.g., course recommendations or chatbot interactions) rather than providing integrated academic and career guidance. There is limited research on systems specifically designed for the African higher education context, where resource constraints and unique challenges exist. Furthermore, few studies comprehensively evaluate both the technical effectiveness and user experience of AI-powered student support systems. This research addresses these gaps by developing and evaluating an integrated, context-appropriate system for comprehensive student support."""
    story.append(Paragraph(gap_text, body_style))
    story.append(PageBreak())
    
    # CHAPTER THREE: METHODOLOGY
    story.append(Paragraph("CHAPTER THREE", heading1_style))
    story.append(Paragraph("RESEARCH METHODOLOGY", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("3.1 Introduction", heading2_style))
    method_intro = """This chapter outlines the research methodology for developing and evaluating the TATU system. It describes the research design, system architecture, data collection methods, development methodology, and evaluation framework that will guide the implementation and assessment of the proposed system."""
    story.append(Paragraph(method_intro, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("3.2 Research Design", heading2_style))
    design_text = """This research employs a mixed-methods approach combining design science research methodology with experimental evaluation. The design science component focuses on creating an innovative artifact (the TATU system) that addresses identified problems in student support services. The experimental evaluation assesses the system's effectiveness through quantitative metrics and qualitative user feedback. The research will be conducted in phases: requirements analysis, system design and development, pilot testing, full implementation, and evaluation."""
    story.append(Paragraph(design_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("3.3 System Design and Architecture", heading2_style))
    arch_text = """The TATU system will follow a modular architecture comprising five main components:

1. Data Collection and Integration Layer: Interfaces with existing institutional systems (LMS, student information systems) to gather relevant student data
2. Data Processing and Analytics Engine: Implements machine learning models for performance prediction, pattern recognition, and recommendation generation
3. Natural Language Processing Module: Enables conversational interaction through an intelligent chatbot interface
4. Career Guidance Module: Matches student profiles with career pathways using knowledge graphs and matching algorithms
5. User Interface Layer: Provides web and mobile interfaces for student and advisor access

The system will be built using modern technologies including Python for backend services, TensorFlow for machine learning models, and React for frontend development."""
    story.append(Paragraph(arch_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("3.4 Data Collection Methods", heading2_style))
    data_text = """Data will be collected from multiple sources:

• Historical academic records (grades, course enrollments, attendance) from institutional databases
• Student demographic and background information (with appropriate privacy protections)
• User interaction data with the system (queries, recommendations accepted, time spent)
• Surveys and questionnaires to gather user feedback and satisfaction measures
• Focus group discussions with students and advisors to gather qualitative insights
• Interviews with domain experts (academic advisors, career counselors) for system validation

All data collection will follow ethical guidelines and institutional policies, with informed consent obtained from participants."""
    story.append(Paragraph(data_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("3.5 System Development Methodology", heading2_style))
    dev_text = """The system will be developed using an Agile methodology with iterative sprints. Each sprint will focus on specific system components, allowing for continuous testing, feedback incorporation, and refinement. The development process includes:

Phase 1: Requirements gathering and system design (2 months)
Phase 2: Backend infrastructure and database setup (1 month)
Phase 3: Machine learning model development and training (2 months)
Phase 4: NLP chatbot development (1.5 months)
Phase 5: Career guidance module implementation (1.5 months)
Phase 6: Frontend interface development (2 months)
Phase 7: Integration testing and refinement (1 month)
Phase 8: Pilot deployment and evaluation (2 months)

Regular stakeholder reviews will ensure alignment with user needs and institutional requirements."""
    story.append(Paragraph(dev_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("3.6 Evaluation Framework", heading2_style))
    eval_text = """System evaluation will employ multiple metrics across different dimensions:

Technical Performance Metrics:
• Prediction accuracy for academic performance models
• Recommendation relevance scores
• System response time and reliability
• NLP chatbot accuracy in understanding user queries

User Experience Metrics:
• User satisfaction ratings (measured through surveys)
• System usability scores (using standardized instruments like SUS)
• User engagement metrics (frequency of use, session duration)

Impact Metrics:
• Student academic performance improvements (GPA changes)
• Retention rate changes among system users vs. non-users
• Student confidence in academic and career decisions
• Advisor time efficiency gains

Evaluation will include A/B testing comparing outcomes for students using the system versus those receiving traditional support, controlling for relevant variables."""
    story.append(Paragraph(eval_text, body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("3.7 Ethical Considerations", heading2_style))
    ethics_text = """This research adheres to strict ethical guidelines:

• Informed consent will be obtained from all participants before data collection
• Student data will be anonymized and securely stored with appropriate access controls
• The research will undergo institutional review board approval
• Transparency in AI decision-making will be maintained, allowing students to understand recommendation rationale
• Bias mitigation strategies will be implemented in machine learning models to ensure fairness across student demographics
• Students will retain autonomy in decision-making, with the system providing guidance rather than mandating choices
• Data retention and deletion policies will comply with institutional and legal requirements"""
    story.append(Paragraph(ethics_text, body_style))
    story.append(PageBreak())
    
    # REFERENCES
    story.append(Paragraph("REFERENCES", heading1_style))
    story.append(Spacer(1, 0.2*inch))
    
    refs = [
        "Ajzen, I. (1991). The theory of planned behavior. <i>Organizational Behavior and Human Decision Processes, 50</i>(2), 179-211.",
        "",
        "Baker, R. S., & Inventado, P. S. (2014). Educational data mining and learning analytics. In <i>Learning Analytics</i> (pp. 61-75). Springer.",
        "",
        "Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. <i>MIS Quarterly, 13</i>(3), 319-340.",
        "",
        "Essa, A., & Ayad, H. (2012). Improving student success using predictive models and data visualizations. <i>Research in Learning Technology, 20</i>(1).",
        "",
        "Kuhn, T. L. (2008). Historical foundations of academic advising. In <i>Academic Advising: A Comprehensive Handbook</i> (2nd ed., pp. 3-16). Jossey-Bass.",
        "",
        "Luckin, R., Holmes, W., Griffiths, M., & Forcier, L. B. (2016). <i>Intelligence Unleashed: An Argument for AI in Education</i>. Pearson Education.",
        "",
        "Page, L. C., & Gehlbach, H. (2017). How an artificially intelligent virtual assistant helps students navigate the road to college. <i>AERA Open, 3</i>(4).",
        "",
        "Tinto, V. (2012). <i>Completing College: Rethinking Institutional Action</i>. University of Chicago Press.",
        "",
        "Zawacki-Richter, O., Marín, V. I., Bond, M., & Gouverneur, F. (2019). Systematic review of research on artificial intelligence applications in higher education. <i>International Journal of Educational Technology in Higher Education, 16</i>(1), 39.",
        "",
        "Zimmerman, B. J. (2002). Becoming a self-regulated learner: An overview. <i>Theory Into Practice, 41</i>(2), 64-70.",
    ]
    
    for ref in refs:
        if ref:
            story.append(Paragraph(ref, body_style))
        else:
            story.append(Spacer(1, 0.1*inch))
    
    story.append(PageBreak())
    
    # APPENDICES
    story.append(Paragraph("APPENDICES", heading1_style))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("APPENDIX A: PROJECT BUDGET", heading2_style))
    story.append(Spacer(1, 0.2*inch))
    
    budget_data = [
        ["Item", "Description", "Cost (TZS)"],
        ["Hardware", "Development laptop/workstation", "1,500,000"],
        ["Software Licenses", "Development tools and cloud services", "500,000"],
        ["Internet & Data", "Research and development connectivity", "300,000"],
        ["Cloud Services", "AWS/Azure for hosting and testing", "800,000"],
        ["Stationery", "Printing, binding, documentation", "200,000"],
        ["Transportation", "Data collection and meetings", "400,000"],
        ["Miscellaneous", "Contingency and unforeseen expenses", "300,000"],
        ["<b>Total</b>", "", "<b>4,000,000</b>"],
    ]
    
    budget_table = Table(budget_data, colWidths=[1.5*inch, 2.5*inch, 1.5*inch])
    budget_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(budget_table)
    story.append(Spacer(1, 0.5*inch))
    
    story.append(Paragraph("APPENDIX B: WORK PLAN", heading2_style))
    story.append(Spacer(1, 0.2*inch))
    
    workplan_data = [
        ["Activity", "Month 1-2", "Month 3-4", "Month 5-6", "Month 7-8", "Month 9-10"],
        ["Literature Review", "X", "", "", "", ""],
        ["Requirements Analysis", "X", "", "", "", ""],
        ["System Design", "", "X", "", "", ""],
        ["ML Model Development", "", "X", "X", "", ""],
        ["NLP Development", "", "", "X", "", ""],
        ["Frontend Development", "", "", "X", "X", ""],
        ["Integration & Testing", "", "", "", "X", ""],
        ["Deployment & Evaluation", "", "", "", "X", "X"],
        ["Documentation", "", "", "", "", "X"],
    ]
    
    workplan_table = Table(workplan_data, colWidths=[1.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.9*inch])
    workplan_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(workplan_table)
    
    # Build PDF
    doc.build(story)
    print(f"[v0] PDF successfully generated: {filename}")
    return filename

# Execute the function
if __name__ == "__main__":
    create_tatu_research_pdf()
