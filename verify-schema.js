/* Verify survey schema + simulate renderer logic (no DOM needed for logic parts) */
const fs = require('fs');
const path = require('path');

const schemaSrc = fs.readFileSync(path.join(__dirname, 'survey-schema.js'), 'utf8');
const SURVEY = eval(schemaSrc.replace('if (typeof window !== \'undefined\') window.SURVEY = SURVEY;', '') + '\nSURVEY;');

let errors = [];
let warns = [];

/* 1. structure */
const ids = [];
SURVEY.sections.forEach((sec, si) => {
  if (!sec.id || !sec.name || !Array.isArray(sec.questions)) errors.push(`Section ${si} thiếu field`);
  sec.questions.forEach(q => {
    if (ids.includes(q.id)) errors.push(`Duplicate question id: ${q.id}`);
    ids.push(q.id);
    if (!q.type) errors.push(`${q.id}: thiếu type`);
    if (!q.text) errors.push(`${q.id}: thiếu text`);
    if (q.required === undefined) warns.push(`${q.id}: thiếu required`);
    /* type-specific */
    if (['single','checkbox','ranking'].includes(q.type) && !Array.isArray(q.options)) errors.push(`${q.id}: ${q.type} cần options`);
    if (['likert','nps'].includes(q.type) && !Array.isArray(q.scale)) errors.push(`${q.id}: ${q.type} cần scale`);
    if (q.type === 'matrix') {
      if (!Array.isArray(q.rows)) errors.push(`${q.id}: matrix cần rows`);
      if (!Array.isArray(q.scale)) errors.push(`${q.id}: matrix cần scale`);
    }
    /* exclusiveValues phải nằm trong options */
    if (q.exclusiveValues) {
      q.exclusiveValues.forEach(v => {
        if (!q.options.includes(v)) errors.push(`${q.id}: exclusiveValues "${v}" không có trong options`);
      });
    }
  });
});

/* 2. showIf targets must exist */
const allQ = {};
SURVEY.sections.forEach(s => s.questions.forEach(q => allQ[q.id] = q));
SURVEY.sections.forEach(s => s.questions.forEach(q => {
  if (q.showIf) {
    if (!allQ[q.showIf.q]) errors.push(`${q.id}: showIf trỏ tới câu không tồn tại (${q.showIf.q})`);
    else {
      const target = allQ[q.showIf.q];
      if (!Array.isArray(target.options)) errors.push(`${q.id}: showIf trỏ tới câu không có options`);
      else q.showIf.in.forEach(v => {
        if (!target.options.includes(v)) errors.push(`${q.id}: showIf.in "${v}" không khớp option của ${q.showIf.q}`);
      });
    }
  }
}));

/* 3. screener passIfAny must exist in Q1 options */
const q1 = allQ['Q1'];
if (q1 && q1.screener) {
  q1.screener.passIfAny.forEach(v => {
    if (!q1.options.includes(v)) errors.push(`Q1: screener passIfAny "${v}" không có trong options`);
  });
} else warns.push('Q1 không có screener config');

/* 4. branching coverage */
const branched = SURVEY.sections.flatMap(s => s.questions).filter(q => q.showIf).map(q => q.id);
const gates = SURVEY.sections.flatMap(s => s.questions).filter(q => q.gate).map(q => q.id);
console.log('═══ SCHEMA VERIFY ═══');
console.log('Sections:', SURVEY.sections.length);
console.log('Questions:', ids.length);
console.log('Gate questions:', gates.join(', '));
console.log('Branched questions:', branched.join(', '));
console.log('Required:', SURVEY.sections.flatMap(s=>s.questions).filter(q=>q.required).length);
console.log('Optional:', SURVEY.sections.flatMap(s=>s.questions).filter(q=>!q.required).length);

/* 5. simulate payload flatten for matrix */
const q19 = allQ['Q19'];
const sampleMatrix = {};
q19.rows.forEach(r => sampleMatrix[r.id] = '4');
const flatCols = [];
Object.keys(sampleMatrix).forEach(k => flatCols.push(`Q19_${k}`));
console.log('Q19 matrix expands to', flatCols.length, 'columns:', flatCols.join(', '));

/* 6. count total export columns */
let cols = 4; /* timestamp, duration_sec, version, source */
SURVEY.sections.forEach(s => s.questions.forEach(q => {
  if (q.type === 'matrix') cols += q.rows.length + 1;
  else cols += 1;
}));
console.log('Total Sheets columns:', cols);

console.log('\n═══ ERRORS ═══');
console.log(errors.length ? errors.join('\n') : '✓ none');
console.log('\n═══ WARNINGS ═══');
console.log(warns.length ? warns.join('\n') : '✓ none');
process.exit(errors.length ? 1 : 0);
