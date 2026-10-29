// Apply published Sanity offer facts to the homepage and enquiry page.
const fs = require('node:fs')
const path = require('node:path')

const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

function requiredText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Sanity service page: missing ${field}`)
  return escape(value.trim())
}
function requiredRawText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Sanity service page: missing ${field}`)
  return value.trim()
}
function requiredArray(value, field, min = 1) {
  if (!Array.isArray(value) || value.length < min) throw new Error(`Sanity service page: missing ${field}`)
  return value
}
function replaceChecked(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Service page markup changed: ${label}`)
  return html.replace(pattern, replacement)
}
function replaceMarkers(html, name, content) {
  return replaceChecked(html, new RegExp(`(<!-- cms:${name}:start -->)[\\s\\S]*?(<!-- cms:${name}:end -->)`),
    (_match, start, end) => `${start}\n${content}\n${end}`, name)
}
function replaceMeta(html, document) {
  html = replaceChecked(html, /<title>[\s\S]*?<\/title>/, `<title>${requiredText(document.seoTitle, 'seoTitle')}</title>`, 'title')
  return replaceChecked(html, /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${requiredText(document.seoDescription, 'seoDescription')}">`, 'description')
}
function replaceFact(html, name, value) {
  const pattern = new RegExp(`(<([a-z][a-z0-9]*)\\b[^>]*\\sdata-cms-${name}(?=[\\s=>])[^>]*>)[\\s\\S]*?(<\\/\\2>)`, 'g')
  if (!pattern.test(html)) throw new Error(`Service page markup changed: ${name}`)
  pattern.lastIndex = 0
  return html.replace(pattern, (_match, start, _tag, end) => `${start}${escape(value)}${end}`)
}
function validateOffer(document) {
  if (!Number.isFinite(document.startingPrice) || document.startingPrice < 0) throw new Error('Sanity service page: invalid startingPrice')
  if (!Number.isInteger(document.includedRevisions) || document.includedRevisions < 0) throw new Error('Sanity service page: invalid includedRevisions')
  if (!['EUR', 'GBP'].includes(document.currency ?? 'EUR')) throw new Error('Sanity service page: invalid currency')
  if (!Number.isInteger(document.offerClientLimit ?? 5) || (document.offerClientLimit ?? 5) < 1) throw new Error('Sanity service page: invalid offerClientLimit')
  requiredRawText(document.standardTimeline, 'standardTimeline')
}
function offerPrice(document) {
  // Older published documents lack currency; the current offer is in euros.
  return `${(document.currency ?? 'EUR') === 'EUR' ? '€' : '£'}${document.startingPrice}`
}
function replaceBusinessExamples(html, document) {
  const examples = requiredArray(document.businessExamples, 'businessExamples', 2)
    .map((example, index) => requiredText(example, `businessExamples[${index}]`))
  if (examples.some(example => example.includes('|'))) throw new Error('Sanity business examples cannot contain |')
  return replaceChecked(html, /(<span class="business-rotation"[^>]*data-examples=")[^"]*(">)[\s\S]*?(<\/span>)/,
    (_match, start, middle, end) => `${start}${examples.join('|')}${middle}${examples[0]}${end}`, 'business rotation')
}
function applyHomepageOffer(html, document) {
  if (!document) return html
  validateOffer(document)
  html = replaceBusinessExamples(html, document)
  html = replaceFact(html, 'price', offerPrice(document))
  html = replaceFact(html, 'offer-limit', document.offerClientLimit ?? 5)
  html = replaceFact(html, 'revisions', document.includedRevisions)
  return replaceFact(html, 'timeline', document.standardTimeline.trim())
}
function applyWhyPage(html, document) {
  if (!document) return html
  // Retain support for older fixtures without rendering content into the redirect.
  if (/http-equiv="refresh"[^>]*index\.html#why/i.test(html)) return html
  html = replaceMeta(html, document)
  html = replaceBusinessExamples(html, document)
  html = replaceChecked(html, /(<div class="service-hero-bottom"><p>)[\s\S]*?(<\/p>)/,
    (_match, start, end) => `${start}${requiredText(document.heroDescription, 'heroDescription')}${end}`, 'hero description')
  html = replaceChecked(html, /(<h2 id="problem-title">[\s\S]*?<\/h2><p>)[\s\S]*?(<\/p>)/,
    (_match, start, end) => `${start}${requiredText(document.problemIntro, 'problemIntro')}${end}`, 'problem introduction')

  const renderPoints = (points, field) => requiredArray(points, field, 2).map((point, index) =>
    `<article><span>${String(index + 1).padStart(2, '0')}</span><h3>${requiredText(point.title, field + '.title')}</h3><p>${requiredText(point.body, field + '.body')}</p></article>`
  ).join('\n')
  html = replaceMarkers(html, 'problems', renderPoints(document.problems, 'problems'))
  html = replaceMarkers(html, 'outcomes', requiredArray(document.outcomes, 'outcomes', 3)
    .map((outcome, index) => `<li>${requiredText(outcome, `outcomes[${index}]`)}</li>`).join('\n'))
  html = replaceMarkers(html, 'reasons', renderPoints(document.reasons, 'reasons'))
  html = replaceMarkers(html, 'steps', requiredArray(document.steps, 'steps', 2).map(step =>
    `<article><span>${requiredText(step.label, 'steps.label')}</span><h3>${requiredText(step.title, 'steps.title')}</h3><p>${requiredText(step.body, 'steps.body')}</p></article>`
  ).join('\n'))
  validateOffer(document)
  html = replaceFact(html, 'price', offerPrice(document))
  html = replaceFact(html, 'revisions', document.includedRevisions)
  html = replaceFact(html, 'timeline', requiredRawText(document.standardTimeline, 'standardTimeline'))
  return html
}
function applyEnquiryPage(html, document, offer) {
  if (document) {
    html = replaceMeta(html, document)
    html = replaceChecked(html, /(<div class="enquiry-intro-bottom"><p>)[\s\S]*?(<\/p>)/,
      (_match, start, end) => `${start}${requiredText(document.intro, 'enquiryPage.intro')}${end}`, 'enquiry introduction')
  }
  if (offer) {
    validateOffer(offer)
    html = replaceFact(html, 'price', offerPrice(offer))
    html = replaceFact(html, 'offer-limit', offer.offerClientLimit ?? 5)
    html = replaceFact(html, 'revisions', offer.includedRevisions)
    html = replaceFact(html, 'timeline', requiredRawText(offer.standardTimeline, 'standardTimeline'))
  }
  return html
}
function applyServicePages(root, documents) {
  const homeFile = path.join(root, 'studio/index.html')
  const enquiryFile = path.join(root, 'studio/enquire.html')
  fs.writeFileSync(homeFile, applyHomepageOffer(fs.readFileSync(homeFile, 'utf8'), documents.whyPage))
  fs.writeFileSync(enquiryFile, applyEnquiryPage(fs.readFileSync(enquiryFile, 'utf8'), documents.enquiryPage, documents.whyPage))
}

module.exports = {applyWhyPage, applyHomepageOffer, applyEnquiryPage, applyServicePages}
