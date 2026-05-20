import { type MouseEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import styles from "./About.module.css";

const NAV_OFFSET = 88;

const SECTIONS = [
  { id: "about-tool", label: "Tool" },
  { id: "audience", label: "Audience" },
  { id: "objectives", label: "Objectives" },
  { id: "rationale", label: "Design" },
  { id: "related-work", label: "Grounding" },
  { id: "team", label: "Team" },
  { id: "faq", label: "FAQ" },
];

const TEAM_MEMBERS = ["Wanglei Shen", "Zihan Li", "Ines Araujo", "Sophia Kacem", "Rui Wang"];

const OBJECTIVES = [
  "Explain how sampling bias can make a model look accurate on a narrow dataset while failing the wider population.",
  "Compare competing definitions of algorithmic fairness and recognize why they can conflict in recidivism prediction.",
  "Identify how human feedback and majority preference can shape LLM behavior, including whose values are amplified or ignored.",
  "Practice auditing an AI system as a chain of design decisions instead of treating bias as a single technical bug.",
];

const RELATED_WORKS = [
  {
    title: "ProPublica COMPAS reporting and the Northpointe response",
    body: "Grounds Chapter 2 in the public debate over recidivism risk scores, calibration, and error-rate disparities.",
  },
  {
    title: "Chouldechova (2017) and fairness impossibility results",
    body: "Supports the lesson that different statistical fairness criteria cannot always be satisfied at the same time.",
  },
  {
    title: "Situated, game-based AI literacy experiences such as AI Quests",
    body: "Informs the no-code, story-led format where learners act inside a concrete problem instead of reading definitions first.",
  },
  {
    title: "RLHF and alignment-bias discussions",
    body: "Grounds Chapter 3's focus on how rater pools, preference data, and helpfulness pressure can steer model behavior.",
  },
  {
    title: "Additional citations",
    body: "Placeholder: add course readings, papers, or design precedents that directly informed the final submission.",
    placeholder: true,
  },
];

const FAQS = [
  {
    question: "Do learners need to know how to code?",
    answer: "No. The prototype is designed as a no-code investigation where learners make choices, inspect outcomes, and reflect on trade-offs.",
  },
  {
    question: "How long does the activity take?",
    answer: "Placeholder: add the tested session length after classroom or user testing is complete.",
    placeholder: true,
  },
  {
    question: "Can this be used in class?",
    answer: "Yes, it is intended for guided AI fairness teaching. Placeholder: add facilitator notes, timing, and reflection prompts.",
    placeholder: true,
  },
  {
    question: "What data does the tool collect?",
    answer: "Placeholder: document whether the deployed version stores gameplay choices, analytics, or no user data.",
    placeholder: true,
  },
];

export default function About() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    [FAQS[0].question]: true,
  });

  useEffect(() => {
    document.documentElement.classList.add("aboutHideScrollbar");
    return () => document.documentElement.classList.remove("aboutHideScrollbar");
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const current = SECTIONS.reduce((best, section) => {
        const target = document.getElementById(section.id);
        if (!target) return best;

        const distance = Math.abs(target.getBoundingClientRect().top - NAV_OFFSET);
        return distance < best.distance ? { id: section.id, distance } : best;
      }, { id: SECTIONS[0].id, distance: Number.POSITIVE_INFINITY });

      setActiveSection(current.id);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  const scrollToSection = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();

    const target = document.getElementById(id);
    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    window.history.pushState(null, "", `#${id}`);
    setActiveSection(id);
  };

  const expandAllFaqs = (open: boolean) => {
    setOpenFaqs(
      FAQS.reduce<Record<string, boolean>>((next, faq) => {
        next[faq.question] = open;
        return next;
      }, {}),
    );
  };

  return (
    <>
      <Nav />
      <main className={styles.page}>
        <nav className={styles.progressDots} aria-label="About page sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.progressDot} ${activeSection === section.id ? styles.progressDotActive : ""}`}
              onClick={(event) => scrollToSection(event, section.id)}
              aria-label={`Go to ${section.label}`}
              aria-current={activeSection === section.id ? "step" : undefined}
            >
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <section id="about-tool" className={`${styles.hero} ${styles.pageSection}`}>
          <p className="eyebrow">About the project</p>
          <h1 className={styles.title}>A time-travel case file for AI fairness.</h1>
          <p className={styles.lede}>
            Θmen is an interactive teaching prototype about how AI bias enters a system before anyone sees
            the final verdict. Players investigate the fictional city of Novus by tracing bias through data
            collection, algorithmic fairness choices, and human feedback used to guide AI behavior.
          </p>
          <div className={styles.summaryGrid}>
            <InfoCard label="Format" value="Three-chapter interactive investigation" />
            <InfoCard label="Core Topic" value="AI fairness, bias, and accountable model design" />
            <InfoCard label="Current Status" value="Prototype for coursework and critique" />
          </div>
          <Link to="/chapters" className={styles.back}>
            Open the chapters
          </Link>
        </section>

        <section id="audience" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Who it is for"
            title="Built for first encounters with AI fairness."
            body="The tool is intended for non-CS students and mixed-background learners who are meeting AI fairness concepts for the first time. It can also support educators who want a discussion starter for ethics, data literacy, or introductory AI courses."
          />
          <div className={styles.callout}>
            <strong>Placeholder:</strong> add the exact course, age range, deployment context, and accessibility requirements for the final version.
          </div>
        </section>

        <section id="objectives" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Learning objectives"
            title="Learners should leave with a working mental model, not just vocabulary."
          />
          <ol className={styles.objectiveList}>
            {OBJECTIVES.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </section>

        <section id="rationale" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Design rationale"
            title="The design turns abstract fairness failures into decisions learners can feel."
          />
          <div className={styles.rationaleGrid}>
            <InfoCard
              label="Narrative Frame"
              value="The time-travel case structure makes each chapter feel like an investigation into a prior design decision."
            />
            <InfoCard
              label="Interactive Trade-offs"
              value="Learners choose samples, fairness definitions, and model responses so the consequences emerge from their own actions."
            />
            <InfoCard
              label="No-Code Access"
              value="The activities avoid programming prerequisites and foreground conceptual reasoning, evidence, and reflection."
            />
            <InfoCard
              label="Visual System"
              value="Case-file materials, chapter states, and audit-like feedback make invisible model assumptions more inspectable."
            />
          </div>
        </section>

        <section id="related-work" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Related works"
            title="Grounded in fairness research and playable AI literacy precedents."
            body="These references are the current grounding set. Replace placeholders with complete citations before submission."
          />
          <div className={styles.relatedList}>
            {RELATED_WORKS.map((work) => (
              <article key={work.title} className={`${styles.relatedItem} ${work.placeholder ? styles.placeholder : ""}`}>
                <h3>{work.title}</h3>
                <p>{work.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="team" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader eyebrow="Team" title="Project team members" />
          <div className={styles.teamGrid}>
            {TEAM_MEMBERS.map((member) => (
              <article key={member} className={styles.teamCard}>
                <span>{member}</span>
                <p>Placeholder: add role, contribution, affiliation, or contact details.</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className={`${styles.section} ${styles.pageSection}`}>
          <div className={styles.faqHeader}>
            <SectionHeader eyebrow="Optional FAQ" title="Frequently asked questions" />
            <div className={styles.faqControls}>
              <button type="button" onClick={() => expandAllFaqs(true)}>Expand All</button>
              <button type="button" onClick={() => expandAllFaqs(false)}>Collapse</button>
            </div>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq) => {
              const isOpen = Boolean(openFaqs[faq.question]);
              const answerId = `faq-answer-${faq.question.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <article key={faq.question} className={`${styles.faqItem} ${faq.placeholder ? styles.placeholder : ""}`}>
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaqs((prev) => ({ ...prev, [faq.question]: !prev[faq.question] }))}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span className={styles.faqQuestionText}>{faq.question}</span>
                    <span
                      className={`${styles.faqToggleIcon} ${isOpen ? styles.faqToggleIconOpen : ""}`}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={answerId}
                    className={`${styles.faqAnswerWrapper} ${isOpen ? styles.faqAnswerWrapperOpen : ""}`}
                    role="region"
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.faqAnswerInner}>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.infoCard}>
      <span>{label}</span>
      <p>{value}</p>
    </article>
  );
}
