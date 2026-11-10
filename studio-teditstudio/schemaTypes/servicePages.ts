import {defineField, defineType} from 'sanity'

const benefitChapter = defineType({
  name: 'benefitChapter', title: 'Website benefit', type: 'object',
  fields: [
    defineField({name: 'tabLabel', title: 'Short chapter label', type: 'string',
      description: 'Shown in the desktop chapter navigation.', validation: rule => rule.required().max(30)}),
    defineField({name: 'heading', title: 'Animated headline', type: 'string',
      validation: rule => rule.required().max(90)}),
    defineField({name: 'body', title: 'Explanation', type: 'text', rows: 3,
      validation: rule => rule.required().max(450)}),
    defineField({name: 'video', title: 'Replacement chapter video (optional)', type: 'file',
      options: {accept: 'video/mp4'}, description: 'If empty, the built-in motion study remains.'}),
    defineField({name: 'poster', title: 'Replacement video poster (optional)', type: 'image',
      description: 'Shown before playback. If empty, the built-in poster remains.'}),
  ],
  preview: {select: {title: 'heading', subtitle: 'tabLabel', media: 'poster'}},
})

const whyPage = defineType({
  name: 'whyPage', title: 'Why a website & offer', type: 'document',
  groups: [
    {name: 'intro', title: 'Why a website', default: true},
    {name: 'benefits', title: 'Benefits and media'},
    {name: 'offer', title: 'Offer'},
  ],
  fields: [
    defineField({name: 'businessExamples', title: 'Rotating business examples', type: 'array', of: [{type: 'string'}], group: 'intro',
      description: 'Use a phrase that follows “looking for”, such as “a caterer”, “an engineering firm”, or “accommodation”.',
      validation: rule => rule.required().min(2).max(24)}),
    defineField({name: 'introQuestion', title: 'Question below the rotating examples', type: 'text', rows: 2, group: 'intro',
      description: 'Two short lines work best on mobile.', validation: rule => rule.max(180)}),
    defineField({name: 'benefitChapters', title: 'Three website benefits', type: 'array', group: 'benefits',
      description: 'Keep three chapters. Drag to change their order; each can use its built-in media or an uploaded replacement.',
      of: [{type: 'benefitChapter'}], validation: rule => rule.custom(value => value == null || (Array.isArray(value) && value.length === 3) || 'Add exactly three chapters.')}),
    defineField({name: 'answerHeading', title: 'Closing headline', type: 'string', group: 'benefits',
      validation: rule => rule.max(90)}),
    defineField({name: 'answerBody', title: 'Closing explanation', type: 'text', rows: 3, group: 'benefits',
      validation: rule => rule.max(450)}),
    defineField({name: 'startingPrice', title: 'Basic 1–2 page website offer price', type: 'number', group: 'offer',
      description: 'Once-off design and development payment, excluding domain and hosting charges.',
      validation: rule => rule.required().min(0)}),
    defineField({name: 'currency', title: 'Offer currency', type: 'string', group: 'offer', initialValue: 'EUR',
      options: {list: [{title: 'Euro (EUR)', value: 'EUR'}, {title: 'Pound sterling (GBP)', value: 'GBP'}]},
      validation: rule => rule.custom(value => value === undefined || ['EUR', 'GBP'].includes(value) ? true : 'Choose EUR or GBP.')}),
    defineField({name: 'offerClientLimit', title: 'Offer client limit', type: 'number', group: 'offer', initialValue: 5,
      description: 'The offer applies to this many upcoming clients.', validation: rule => rule.integer().min(1)}),
    defineField({name: 'includedRevisions', title: 'Included revision rounds', type: 'number', group: 'offer',
      validation: rule => rule.required().integer().min(0)}),
    defineField({name: 'standardTimeline', title: 'Standard site time aim', type: 'string', group: 'offer',
      description: 'For example: 3–5 days', validation: rule => rule.required().max(50)}),
  ],
  preview: {prepare: () => ({title: 'Why a website & offer'})},
})

const enquiryPage = defineType({
  name: 'enquiryPage', title: 'Enquiry page', type: 'document',
  fields: [
    defineField({name: 'intro', title: 'Introduction', type: 'text', rows: 3,
      validation: rule => rule.required().max(500)}),
    defineField({name: 'seoTitle', title: 'Browser and search title', type: 'string',
      validation: rule => rule.required().max(90)}),
    defineField({name: 'seoDescription', title: 'Search description', type: 'text', rows: 3,
      validation: rule => rule.required().max(300)}),
  ],
  preview: {prepare: () => ({title: 'Enquiry page'})},
})

export const servicePages = [whyPage, enquiryPage, benefitChapter]
