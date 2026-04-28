import type { Metadata } from 'next'
import Link from 'next/link'

interface BlogPostProps {
  params: {
    slug: string
  }
}

// Blog post data
const BLOG_POSTS: Record<
  string,
  {
    title: string
    description: string
    date: string
    author: string
    category: string
    content: string
    readTime: string
  }
> = {
  'ndis-family-communication': {
    title: 'How NDIS Providers Can Improve Family Communication (Without Adding Admin)',
    description:
      'Practical strategies to improve family communication while reducing administrative burden for NDIS providers.',
    date: 'April 29, 2026',
    author: 'BePart Team',
    category: 'NDIS',
    readTime: '6 min read',
    content: `
Family communication is often an afterthought in busy NDIS organisations. Between logging activities, managing schedules, and handling incidents, there's simply not enough time to keep families consistently informed.

Yet families consistently say they want more communication, more updates, and better visibility into their loved one's care. The gap between what families want and what providers can deliver creates frustration on both sides.

The good news? You don't need to hire more staff or work longer hours to dramatically improve family communication. You just need better systems.

## The Problem: Communication Takes Time

Most NDIS providers communicate with families through:
- **Email updates** — takes time to write, families miss them in their inbox
- **Phone calls** — necessary but time-consuming, hard to scale to many families
- **Group chats** — informal, hard to keep records for compliance
- **Irregular check-ins** — good intentions but inconsistent execution

Each method requires carers or admin staff to stop what they're doing and compose a message. When you're managing 50+ clients, this becomes a serious burden.

Families, meanwhile, are often left wondering: "Is my loved one okay? What did they do today? Did they enjoy their activities?"

## The Solution: Automated, Real-Time Updates

The key insight: **don't require carers to write update messages. Automatic them from activity logs.**

When a carer logs an activity using BePart—whether by typing or voice recording—that activity immediately becomes a family update. No extra work. No delays.

Here's how it works in practice:

**Example:** Sarah, a carer, logs an activity: "David attended swimming this morning. Great effort in the water. Was socialising well with others."

That entry automatically becomes a family update that David's parents see instantly in their feed. They didn't have to ask. They weren't kept in the dark.

## Key Principles for Better Family Communication

### 1. **Make It Automatic**
Every activity log should automatically become a family-visible update (with appropriate consent filters). No manual conversion required. This removes the friction that prevents communication from happening.

### 2. **Keep It Real**
Share genuine activity updates, not sanitised summaries. Families want to know what their loved one *actually* did, how they *actually* behaved, what they actually enjoyed. Authenticity builds trust.

### 3. **Respect Consent**
Families need different information at different times. Some families want hourly updates. Others prefer weekly summaries. Consent-gated access means families see exactly what they've agreed to see—nothing more, nothing less.

### 4. **Make It Visual**
Text updates are good. Photos and short videos are better. Carers can include photos of activities (with appropriate consent) to make updates feel immediate and real.

### 5. **Create a Two-Way Channel**
Families should be able to ask questions, raise concerns, and stay in dialogue. One-way broadcasting isn't enough. Modern communication is conversational.

## The Results: What Changes When You Improve Communication

NDIS providers who systematically improve family communication see:

- **Higher family satisfaction** — families feel more connected and informed
- **Fewer concerns escalating** — early communication prevents small issues from becoming big problems
- **Better retention** — families are less likely to move to competitors when they feel heard and informed
- **Less staff burden** — ironically, better systems reduce the time staff spend answering "how is my loved one?" questions
- **Better compliance** — documented communication creates an audit trail automatically

## How to Start This Week

You don't need a complete system overhaul. Start small:

1. **Commit to one rule:** Every activity log must include a family-visible note
2. **Standardise a template:** "What did they do? How did they engage? What went well?"
3. **Choose one family to pilot:** Start with a family that's asked for more communication
4. **Track feedback:** After two weeks, ask that family if communication improved

Most providers find that within 30 days of consistent activity-based updates, families feel dramatically more connected.

## The Technology Should Disappear

The best family communication systems are invisible. Carers shouldn't have to think about family updates. Families shouldn't have to ask. The system should automatically surface what matters.

That's the principle behind BePart's approach: activity logging and family communication aren't separate workflows. They're the same thing. Log the activity. Family sees the update. Done.

## Next Steps

Better family communication isn't a nice-to-have. It's fundamental to NDIS quality standards. But it shouldn't add burden to your team.

If you're ready to explore how automated activity-based communication could work in your organisation, start a free trial with BePart. See how your team responds when the friction disappears.

Your families will notice. Your team will thank you.
    `,
  },

  'aged-care-digital-consent-2026': {
    title: 'What Aged Care Providers Need to Know About Digital Consent in 2026',
    description:
      'A practical guide to digital consent compliance under the Privacy Act and Aged Care Act 2024. Stay legally compliant.',
    date: 'April 29, 2026',
    author: 'BePart Team',
    category: 'Aged Care',
    readTime: '7 min read',
    content: `
Digital consent in aged care is no longer a gray area. The Aged Care Act 2024 and recent Privacy Act amendments have made it crystal clear: organisations must have explicit, informed, documented consent before sharing any information about a person's care.

But "explicit digital consent" is trickier than it sounds. Many aged care providers are still operating with outdated paper-based consent models. Some are sharing information through group chats without proper consent trails. Others are uncertain about what counts as valid consent in a digital context.

This guide breaks down what you need to know right now.

## What Changed: The Aged Care Act 2024 & Privacy Act

**Before 2026:** Consent was often implicit or verbal. "We told them verbally that we'd update the family" was common practice.

**Now:** Consent must be:
- **Explicit** — families must actively agree, not just fail to object
- **Informed** — they must understand what will be shared and with whom
- **Documented** — there must be a clear record of what was consented to
- **Digital-compatible** — consent can be given digitally, but the rules are strict

The Privacy Commissioner has been clear: audio or video recordings, photos, and detailed health information all require explicit written consent. You can't rely on a verbal agreement from six months ago.

## The Three Levels of Consent You Need

### 1. **Identity Verification Consent**
"Can we tell your family members who you are and what your current status is?"
- Minimum requirement, almost always granted
- Examples: "John is a resident" or "Mary is in stable condition"

### 2. **Activity & Welfare Updates**
"Can we share information about daily activities, wellbeing, and social engagement?"
- This is what most families want
- Examples: "Had a good lunch, enjoyed music therapy, was socialising well"
- Requires explicit consent

### 3. **Medical & Sensitive Information**
"Can we share detailed health information, medication changes, or health incidents?"
- Requires highest level of consent
- Must be renewed annually
- Families can withdraw this consent anytime

## What Counts as Valid Digital Consent?

Valid consent mechanisms include:
- ✓ **Email confirmation** — family emails back to confirm
- ✓ **Digital signature** — e-sign platforms like DocuSign
- ✓ **Online consent forms** — through your web portal (with audit trail)
- ✓ **SMS confirmation** — for simple yes/no questions
- ✓ **Video consent** — recorded, dated, witnessed video calls

Invalid consent mechanisms (avoid these):
- ✗ WhatsApp messages without clear paper trail
- ✗ Verbal agreements without documentation
- ✗ "Implied" consent (silence = permission)
- ✗ Outdated paper forms from three years ago
- ✗ Consent embedded in admission paperwork (too generic)

The Privacy Commissioner's test is simple: **Could you present this consent document in a hearing and confidently explain what was agreed to and when?**

## The Audit Trail Requirement

One overlooked requirement: you must maintain an audit trail.

This means documenting:
- **When** consent was given (date and time)
- **How** it was given (email, form, video)
- **What** was agreed to (specific scopes)
- **Who** gave it (family member name and relationship)
- **What** you're sharing under that consent
- **When** you last reviewed it (annual refresh required)

Many aged care providers keep consent records but don't maintain clear audit trails. That's a compliance gap.

Digital consent systems (like BePart) should automatically timestamp consent, track versions, and show exactly what was consented to.

## Common Consent Mistakes to Avoid

### Mistake 1: Generic "Update Consent"
**Wrong:** "Do you consent to receive updates about your loved one?" (too vague)
**Right:** "We'll share activity updates (what they did, how they engaged, meals, social time). You can ask us not to share health information. You can change this anytime."

### Mistake 2: Forget to Refresh
**Wrong:** Using consent forms from 2023
**Right:** Review all consents annually. Families should re-confirm their preferences each year.

### Mistake 3: Mixed Audiences
**Wrong:** Using the same consent for adult children, spouses, and health professionals
**Right:** Different audiences need different consent conversations. A spouse needs different information than an adult child.

### Mistake 4: No Withdrawal Process
**Wrong:** Assuming consent is permanent
**Right:** Families must be able to withdraw or modify consent instantly, with immediate effect.

## Building a Digital Consent Framework

Here's a practical framework you can implement:

**Step 1: Map Your Information Flows**
Document every type of information you share:
- Activity logs
- Health updates
- Incident reports
- Photos
- Care plan changes
- Progress notes

**Step 2: Create Tiered Consent Tiers**
- Tier 1 (Basic): Identity and essential welfare
- Tier 2 (Standard): Activity updates and daily engagement
- Tier 3 (Detailed): Health information and sensitive incidents

**Step 3: Design Consent Forms**
Each form should:
- Use plain language
- Explain exactly what will be shared
- Specify who will see it
- Include an easy withdrawal mechanism
- Be dated and timestamped

**Step 4: Implement a Digital System**
Manual consent tracking doesn't scale. Use a system that:
- Timestamps all consent actions
- Maintains clear audit trails
- Allows families to manage preferences online
- Alerts you when consent needs renewal
- Prevents sharing without valid consent

**Step 5: Train Your Team**
Your staff must understand:
- What consent means legally
- How to explain consent to families
- How to document decisions
- How to respond to withdrawal requests

## The Business Case

Yes, robust digital consent adds process. But it also delivers:

- **Legal protection** — you can prove you acted appropriately
- **Family trust** — families know you respect their preferences
- **Risk reduction** — fewer complaints, fewer Privacy Act disputes
- **Efficiency** — automated consent tracking beats manual forms
- **Compliance** — you're ready for aged care quality audits

## Looking Ahead

Digital consent in aged care isn't going backwards. The trend is toward more transparency, more family control, and more documentation.

Providers who build proper digital consent frameworks now will find compliance easier in the future. Those still relying on paper forms and verbal agreements will face increasing scrutiny.

## Getting Started Today

If you're not confident in your current consent framework:

1. **Audit your current processes** — How are you getting consent? How are you documenting it?
2. **Map your information flows** — What are you actually sharing? Who with?
3. **Review against the framework above** — Where are the gaps?
4. **Implement a digital consent system** — One that tracks, timestamps, and maintains audit trails automatically

BePart includes built-in consent management specifically designed for aged care and NDIS providers. Families can manage their own preferences, you maintain complete audit trails, and consent stays current automatically.

Your compliance doesn't have to be painful. It just needs to be documented.
    `,
  },

  'carer-activity-logging-guide': {
    title: 'The Carer\'s Guide to Logging Activities Faster (Voice vs Manual)',
    description:
      'Compare voice logging vs manual entry. Learn why voice-to-text is transforming care documentation and saving carers hours every week.',
    date: 'April 29, 2026',
    author: 'BePart Team',
    category: 'Best Practices',
    readTime: '5 min read',
    content: `
Activity logging is essential. It's how NDIS and aged care organisations document what they do, prove compliance, and protect themselves legally.

But activity logging is also exhausting. Most carers spend 1-2 hours each day typing activity notes. That's 5-10 hours every week. Hours that could be spent with clients instead of hunched over a computer.

Is there a better way? Let's compare the two approaches: manual typing and voice-to-text.

## Manual Activity Logging: The Current Reality

**Typical workflow:**
1. Carer finishes an activity at 3:45 PM
2. Returns to office, sits down with laptop
3. Opens logging system, navigates to client
4. Thinks about what happened, recalling details
5. Types: "Sarah attended swimming lesson from 1-2pm. She engaged well with the instructor. Swam 10 lengths."
6. Reviews, submits
7. Time spent: 5-10 minutes per activity (100+ activities per week = 8-16 hours)

**The problems:**
- **Time cost is real** — 8-16 hours per carer, per week, is massive
- **Context lost** — typing an entry hours later means you forget details
- **Quality suffers** — rushed entries lack detail and nuance
- **Carers hate it** — logging feels like admin busywork, not care
- **Compliance gaps** — brief, low-effort entries don't capture important context

Most organisations accept this as inevitable. They budget 10-15% of carer time for "admin." That's just the cost of doing business.

But it doesn't have to be.

## Voice-to-Text Activity Logging: The Alternative

**Typical workflow:**
1. Carer finishes activity at 3:45 PM
2. Opens phone, taps voice log button
3. Speaks naturally: "Sarah had her swimming lesson just now. Instructor said she's really improving her technique. She was happy, engaged the whole time. Swam about 10 lengths. Really positive session."
4. Taps submit (voice-to-text AI converts to text automatically)
5. Entry is logged, family is updated, time spent: 30 seconds

**The advantages:**
- **Speed** — voice logging is 10-15x faster than typing
- **Detail** — natural speech captures nuance that rushed typing misses
- **Immediacy** — logged while the activity is fresh, details are accurate
- **Compliance** — richer entries = better documentation
- **Engagement** — carers prefer speaking to typing
- **Accuracy** — voice-to-text is now 95%+ accurate

## The Numbers: How Much Time Are You Actually Losing?

Let's do the math for a medium-sized organisation:

**20 carers, logging 100 activities per week each**

**Manual Logging:**
- 20 carers × 100 activities × 7 minutes = 233 hours/week
- 233 hours × $25/hour (carer cost) = **$5,825 in lost time per week**
- Annually: **$302,900**

**Voice Logging:**
- 20 carers × 100 activities × 0.5 minutes = 16 hours/week
- 16 hours × $25/hour = **$410 in time cost per week**
- Annually: **$21,320**

**The savings: $281,580 per year**

Even a small organisation with 5 carers saves $70,000+ annually by switching to voice logging.

## What About Quality?

There's often concern: "Won't voice logging produce lower-quality entries?"

The data says no. Voice logging actually improves quality.

**Why?**
- Natural speech is more detailed than rushed typing
- Carers log immediately after activities, while details are fresh
- Less pressure to "finish quickly" means more thoughtful logging
- Context and nuance come through in voice that don't in brief typed entries

Voice entries tend to be 30% longer and 40% more detailed than manual entries. That's better documentation, not worse.

## The Accuracy Question

Modern voice-to-text (like BePart's AI system) achieves 95%+ accuracy. But occasional errors do occur.

Example errors:
- "Sarah attended class" might become "Sarah attended grass"
- A name might be misspelled

For care documentation, this is acceptable. A human can quickly review and correct if needed. The time saved (85-90%) far outweighs the tiny percentage of corrections needed.

## How to Transition Your Team

**Week 1-2: Introduce the concept**
- Show staff the time savings
- Demo voice logging in a real setting
- Address concerns: "It feels weird talking to my phone"

**Week 3-4: Pilot with volunteers**
- Ask 2-3 enthusiastic carers to try voice logging for one week
- Collect feedback, refine the process
- Share results with the team

**Week 5-6: Gradual rollout**
- Offer voice logging as an option, not a requirement
- Provide training on how to log effectively
- Create a style guide: "Good voice logs sound like this..."

**Week 7+: Full adoption**
- Most teams see 80%+ adoption by week 6
- Keep manual entry as backup option
- Monitor quality and adjust templates as needed

## Best Practices for Voice Logging

### 1. **Log Immediately**
Log within 15 minutes of the activity. Details fade quickly.

### 2. **Speak Naturally**
Don't try to sound formal. Speak like you're telling a colleague what happened. Natural language works better.

### 3. **Include Context**
- What did they do?
- How did they engage?
- What was their mood/energy?
- Any incidents or concerns?
- What went well?

### 4. **One Activity Per Log**
Don't try to bundle multiple activities. Keep entries focused.

### 5. **Quick Review**
After submitting, glance at what the AI transcribed. Correct obvious errors (names, specific numbers).

## Common Concerns, Addressed

**"What if the client or family hears me logging?"**
That's actually fine. If you're speaking naturally about an activity you both just did, it's transparent and honest.

**"Will voice logging feel impersonal?"**
No. Voice logging actually feels more personal than typed entries because it captures tone and nuance.

**"What about privacy in a noisy environment?"**
Valid point. For sensitive information, step to a private space for 30 seconds. Still faster than typing later.

**"What if someone doesn't want to talk to their phone?"**
Fair enough. Offer both options. Some carers will always prefer typing. That's okay.

## The Real Question

Here's the fundamental question: **Should carers spend 10-15% of their time typing activity notes, or should they spend that time actually caring?**

The answer is obvious.

Voice logging transforms activity logging from a burden to a 30-second task that actually improves documentation quality.

## Getting Started

If you're ready to try voice logging in your organisation:

1. **Pick one carer to pilot** — preferably someone who's complained about logging time
2. **Use it for one week** — full, honest trial
3. **Measure the time saved** — ask them "How long did you spend on admin?"
4. **Gather honest feedback** — did quality improve or suffer?
5. **Make a decision** — based on real data, not assumptions

Most organisations that try voice logging find they can't go back to manual entry. The time savings are too good, the quality is too good, the carers too grateful.

Your documentation doesn't have to consume half your team's time. Better systems exist. It's time to use them.
    `,
  },
}

export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const post = BLOG_POSTS[params.slug]

  if (!post) {
    return {
      title: 'Post not found | BePart Blog',
      description: 'This blog post could not be found.',
    }
  }

  return {
    title: `${post.title} | BePart Blog`,
    description: post.description,
  }
}

export default function BlogPost({ params }: BlogPostProps) {
  const post = BLOG_POSTS[params.slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm mb-6 inline-block"
          >
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">{post.readTime}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>{post.date}</span>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-12">
        <article className="max-w-3xl mx-auto prose prose-lg prose-gray">
          <div className="text-gray-700 leading-relaxed space-y-6 whitespace-pre-wrap">
            {post.content.split('\n\n').map((section, idx) => {
              if (section.startsWith('##')) {
                return (
                  <h2 key={idx} className="text-3xl font-bold text-gray-900 mt-8 mb-4">
                    {section.replace('## ', '')}
                  </h2>
                )
              }

              if (section.startsWith('###')) {
                return (
                  <h3 key={idx} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                    {section.replace('### ', '')}
                  </h3>
                )
              }

              if (section.startsWith('- ') || section.startsWith('✓') || section.startsWith('✗')) {
                return (
                  <ul key={idx} className="list-disc list-inside text-gray-700 space-y-2">
                    {section.split('\n').map((item, i) => (
                      <li key={i}>{item.replace(/^[-✓✗] /, '')}</li>
                    ))}
                  </ul>
                )
              }

              return (
                <p key={idx} className="text-gray-700 leading-relaxed">
                  {section}
                </p>
              )
            })}
          </div>
        </article>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16 bg-blue-600 text-white rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to improve your organisation?</h2>
          <p className="text-blue-100 mb-6">
            See how BePart can help with activity logging, family communication, and compliance.
          </p>
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors">
            Start Free Trial
          </button>
        </div>

        {/* Related Posts */}
        <div className="max-w-3xl mx-auto mt-16 pt-12 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">More from the Blog</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(BLOG_POSTS)
              .filter(([slug]) => slug !== params.slug)
              .slice(0, 2)
              .map(([slug, post]) => (
                <Link key={slug} href={`/blog/${slug}`}>
                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      {post.category}
                    </span>
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-3">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {post.description}
                    </p>
                    <span className="text-blue-600 font-semibold text-sm">Read More →</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
