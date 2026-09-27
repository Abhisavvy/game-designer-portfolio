// Renders the resume HTML document (same visual design as the original
// hand-written career-content/resume/resume.html) from resume.json data.
//
// Used by build-resume-pdf.mjs to (1) write the generated preview HTML to
// career-content/resume/resume.html and (2) print it to PDF with Playwright.
//
// Keep this the ONLY place that owns the resume's inline CSS/structure —
// content itself always comes from the `data` argument.

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Wraps the first verbatim occurrence of each linked tool's name (e.g.
 * "Kinoa.io", "Data.ai") inside `escapedText` with an inline link, so a
 * prose sentence that mentions a tool links out the same way the Skills &
 * Tools line does. `escapedText` must already be HTML-escaped; tool names
 * contain no characters `esc` would change.
 */
function linkifyTools(escapedText, linkedTools) {
  let result = escapedText;
  for (const tool of linkedTools) {
    if (result.includes(tool.name)) {
      result = result.replace(
        tool.name,
        `<a class="inline-link" href="${esc(tool.href)}">${tool.name}</a>`,
      );
    }
  }
  return result;
}

const RESUME_STYLE = `
  @page {
    size: A4;
    margin: 0.35in 0.5in;
  }

  :root {
    --accent: #1a5276;
    --text: #1a1a1a;
    --muted: #4a4a4a;
    --rule: #c9c9c9;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: Calibri, "Segoe UI", Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.16;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: var(--accent);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  a.inline-link {
    color: inherit;
  }

  header.resume-header {
    text-align: center;
    margin-bottom: 8pt;
  }

  header.resume-header h1 {
    margin: 0 0 2pt 0;
    font-size: 20pt;
    letter-spacing: 0.5pt;
    color: var(--text);
  }

  .title-line {
    font-size: 11pt;
    color: var(--accent);
    font-weight: bold;
    margin-bottom: 3pt;
  }

  .contact-line {
    font-size: 9pt;
    color: var(--muted);
  }

  .contact-line span.sep {
    margin: 0 5pt;
    color: var(--rule);
  }

  section {
    margin-bottom: 4pt;
  }

  h2.section-title {
    font-size: 11.5pt;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.4pt;
    margin: 0 0 3pt 0;
    padding-bottom: 2pt;
    border-bottom: 1pt solid var(--rule);
    break-after: avoid;
    page-break-after: avoid;
  }

  p.summary {
    margin: 0;
    text-align: justify;
  }

  ul.plain-list {
    margin: 0;
    padding-left: 15pt;
  }

  ul.plain-list li {
    margin-bottom: 2pt;
    break-inside: avoid;
  }

  ul.plain-list li strong {
    color: var(--text);
  }

  .nowrap {
    white-space: nowrap;
  }

  ul.achievements {
    margin: 0;
    padding-left: 15pt;
  }

  ul.achievements > li {
    margin-bottom: 4pt;
    break-inside: avoid;
  }

  ul.achievements > li > span.achv-title {
    font-weight: bold;
  }

  ul.achievements ul {
    margin: 2pt 0 0 0;
    padding-left: 14pt;
  }

  ul.achievements ul li {
    margin-bottom: 1pt;
  }

  .job {
    break-inside: avoid;
    margin-bottom: 4pt;
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-bottom: 2pt;
  }

  .job ul {
    margin: 0;
    padding-left: 15pt;
  }

  .job ul li {
    margin-bottom: 2pt;
    break-inside: avoid;
  }

  .edu-item {
    margin-bottom: 3pt;
    break-inside: avoid;
  }

  .edu-item .degree {
    font-weight: bold;
  }
`;

function renderHeader(data) {
  const { basics } = data;
  return `<header class="resume-header">
  <h1>${esc(basics.name)}</h1>
  <div class="title-line">${esc(basics.title)}</div>
  <div class="contact-line">
    Email: <a href="mailto:${esc(basics.email)}">${esc(basics.email)}</a>
    <span class="sep">|</span>
    Phone: ${esc(basics.phone)}
    <span class="sep">|</span>
    LinkedIn: <a href="${esc(basics.linkedin.href)}">${esc(basics.linkedin.label)}</a>
    <span class="sep">|</span>
    <a href="${esc(basics.portfolioUrl.href)}">${esc(basics.portfolioUrl.label)}</a>
    <span class="sep">|</span>
    Location: ${esc(basics.location)}
  </div>
</header>`;
}

function renderSummary(data) {
  return `<section>
  <h2 class="section-title">Professional Summary</h2>
  <p class="summary">
    ${esc(data.summary)}
  </p>
</section>`;
}

/**
 * Shared renderer for any "label: text" list section — What I Focus On,
 * Skills & Tools, Additional Strengths. Each item's text is passed through
 * `linkifyTools` so an exact tool-name mention (Kinoa.io, Data.ai) links out.
 */
function renderLabeledSection(heading, items, linkedTools) {
  if (!items || items.length === 0) return "";
  const rows = items
    .map(
      (item) =>
        `    <li><strong>${esc(item.label)}:</strong> ${linkifyTools(esc(item.text), linkedTools)}</li>`,
    )
    .join("\n");
  return `<section>
  <h2 class="section-title">${esc(heading)}</h2>
  <ul class="plain-list">
${rows}
  </ul>
</section>`;
}

/**
 * Renders each achievement as a bold name (+ year, when known) followed by
 * its 2-4 bullets (the problem, what I did, and the results). A whole entry
 * is kept on one page (`break-inside: avoid` on the outer <li>).
 */
function renderAchievements(data, linkedTools) {
  const items = data.achievements
    .map((achievement) => {
      const bullets = achievement.bullets
        .map((bullet) => `        <li>${linkifyTools(esc(bullet), linkedTools)}</li>`)
        .join("\n");
      return `    <li>
      <span class="achv-title">${esc(achievement.title)}${achievement.year ? ` ${esc(achievement.year)}` : ""}</span>
      <ul>
${bullets}
      </ul>
    </li>`;
    })
    .join("\n");
  return `<section>
  <h2 class="section-title">Key Achievements</h2>
  <ul class="achievements">
${items}
  </ul>
</section>`;
}

/**
 * Renders Personal Projects the same way as Key Achievements (title + year,
 * then description), plus a clickable inline link to the project's external
 * URL (GitHub repo or live playtest). Returns "" when there are none, so an
 * empty/absent section never leaves a stray heading on the page.
 */
function renderPersonalProjects(data, linkedTools) {
  const projects = data.personalProjects;
  if (!projects || projects.length === 0) return "";

  const items = projects
    .map(
      (project) => `    <li>
      <span class="achv-title">${esc(project.title)}${project.year ? ` ${esc(project.year)}` : ""}</span>
      <ul>
        <li>${linkifyTools(esc(project.text), linkedTools)} <a href="${esc(project.link.href)}">${esc(project.link.label)}</a></li>
      </ul>
    </li>`,
    )
    .join("\n");
  return `<section>
  <h2 class="section-title">Personal Projects</h2>
  <ul class="achievements">
${items}
  </ul>
</section>`;
}

function renderExperience(data, linkedTools) {
  const jobs = data.experience
    .map((job) => {
      const bullets = job.bullets
        .map((bullet) => `      <li>${linkifyTools(esc(bullet), linkedTools)}</li>`)
        .join("\n");
      return `  <div class="job">
    <div class="job-header">
      <span>${esc(job.role)} | ${esc(job.company)} | ${esc(job.dates)} (${esc(job.duration)})</span>
    </div>
    <ul>
${bullets}
    </ul>
  </div>`;
    })
    .join("\n");
  return `<section>
  <h2 class="section-title">Professional Experience</h2>
${jobs}
</section>`;
}

function renderEducation(data) {
  const items = data.education
    .map(
      (edu) => `  <div class="edu-item">
    <span class="degree">${esc(edu.degree)}</span> | ${esc(edu.institution)} | ${esc(edu.years)}
  </div>`,
    )
    .join("\n");
  return `<section>
  <h2 class="section-title">Education</h2>
${items}
</section>`;
}

/**
 * Renders the full resume HTML document from typed resume data. Produces
 * the same visual document as the original hand-written resume.html: same
 * inline CSS, same structure/classes, same links.
 */
export function renderResumeHtml(data) {
  const linkedTools = data.technicalProficiency.filter((tool) => tool.href);

  const body = [
    renderHeader(data),
    renderSummary(data),
    renderLabeledSection("What I Focus On", data.focus, linkedTools),
    renderAchievements(data, linkedTools),
    renderExperience(data, linkedTools),
    renderPersonalProjects(data, linkedTools),
    renderLabeledSection("Skills & Tools", data.skills, linkedTools),
    renderLabeledSection("Additional Strengths", data.additionalStrengths, linkedTools),
    renderEducation(data),
  ]
    .filter(Boolean)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${esc(data.basics.name)} - Resume</title>
<style>
${RESUME_STYLE}</style>
</head>
<body>

${body}

</body>
</html>`;
}
