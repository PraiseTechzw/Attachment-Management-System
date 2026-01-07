import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // In a real application, you would use a powerful LLM here.
    // For this example, we'll use a simple template-based approach.
    const suggestion = `
**Activity:** ${prompt}

**Detailed Description:**
I engaged in [Action Verb] the [Noun Phrase] to [Objective]. This involved [Step 1], [Step 2], and [Step 3]. The primary goal was to [Overarching Goal].

**Skills & Knowledge Applied:**
- **[Skill Category 1]:** Utilized [Specific Skill 1] to [Action].
- **[Skill Category 2]:** Applied knowledge of [Specific Skill 2] to [Action].
- **[Skill Category 3]:** Demonstrated proficiency in [Specific Skill 3] by [Action].

**Challenges & Resolutions:**
- **Challenge:** Encountered a [Challenge Description].
- **Resolution:** Overcame this by [Solution Description]. This involved [Specific Action] and resulted in [Positive Outcome].

**Key Learnings & Takeaways:**
- Gained a deeper understanding of [Concept or Technology].
- Improved my ability to [Soft Skill].
- Realized the importance of [Key Insight].

**Impact:**
The successful completion of this task resulted in [Positive Impact on the Project or Team].
`

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json({ error: 'Failed to generate AI suggestion' }, { status: 500 })
  }
}
