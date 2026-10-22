import {defineField, defineType} from 'sanity'

const point = defineType({
  name: 'servicePoint', title: 'Content point', type: 'object',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: rule => rule.required().max(100)}),
    defineField({name: 'body', title: 'Description', type: 'text', rows: 3, validation: rule => rule.required().max(450)}),
  ],
  preview: {select: {title: 'title', subtitle: 'body'}},
})

const step = defineType({
  name: 'serviceStep', title: 'Process step', type: 'object',
  fields: [
    defineField({name: 'label', title: 'Small label', type: 'string', validation: rule => rule.required().max(60)}),
    defineField({name: 'title', title: 'Title', type: 'string', validation: rule => rule.required().max(100)}),
    defineField({name: 'body', title: 'Description', type: 'text', rows: 3, validation: rule => rule.required().max(450)}),
  ],
  preview: {select: {title: 'title', subtitle: 'label'}},
})

const whyPage = defineType({
  name: 'whyPage', title: 'Why Teditstudio page', type: 'document',
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'story', title: 'Story and offer'},
    {name: 'search', title: 'Search appearance'},
  ],
  fields: [
    defineField({name: 'businessExamples', title: 'Rotating business examples', type: 'array', of: [{type: 'string'}], group: 'hero',
      description: 'Include the article in each example, such as “a caterer” or “an engineering firm”.',
      validation: rule => rule.required().min(2).max(15)}),
    defineField({name: 'heroDescription', title: 'Hero introduction', type: 'text', rows: 3, group: 'hero',
      validation: rule => rule.required().max(500)}),
    defineField({name: 'problemIntro', title: 'Problem introduction', type: 'text', rows: 2, group: 'story',
      validation: rule => rule.required().max(350)}),
    defineField({name: 'problems', title: 'Problems to solve', type: 'array', of: [{type: 'servicePoint'}], group: 'story',
      validation: rule => rule.required().min(2).max(6)}),
    defineField({name: 'outcomes', title: 'What clients get', type: 'array', of: [{type: 'string'}], group: 'story',
      validation: rule => rule.required().min(3).max(9)}),
    defineField({name: 'reasons', title: 'Why work with me', type: 'array', of: [{type: 'servicePoint'}], group: 'story',
      validation: rule => rule.required().min(2).max(6)}),
    defineField({name: 'steps', title: 'How it works', type: 'array', of: [{type: 'serviceStep'}], group: 'story',
      validation: rule => rule.required().min(2).max(5)}),
    defineField({name: 'startingPrice', title: 'Basic 1–2 page site starting price in GBP', type: 'number', group: 'story',
      validation: rule => rule.required().min(0)}),
    defineField({name: 'includedRevisions', title: 'Included revision rounds', type: 'number', group: 'story',
      validation: rule => rule.required().integer().min(0)}),
    defineField({name: 'standardTimeline', title: 'Standard site time aim', type: 'string', group: 'story',
      description: 'For example: 3–5 days', validation: rule => rule.required().max(50)}),
    defineField({name: 'seoTitle', title: 'Browser and search title', type: 'string', group: 'search',
      validation: rule => rule.required().max(90)}),
    defineField({name: 'seoDescription', title: 'Search description', type: 'text', rows: 3, group: 'search',
      validation: rule => rule.required().max(300)}),
  ],
  preview: {prepare: () => ({title: 'Why Teditstudio'})},
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

export const servicePages = [whyPage, enquiryPage, point, step]
