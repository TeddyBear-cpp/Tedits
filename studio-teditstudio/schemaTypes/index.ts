import {defineField, defineType} from 'sanity'
import {catalogues} from './catalogues'

const requiredText = (name: string, title: string, max: number) => defineField({
  name, title, type: 'string', validation: (rule) => rule.required().max(max),
})

const homepage = defineType({
  name: 'homepage', title: 'Homepage', type: 'document',
  groups: [{name: 'hero', title: 'Hero', default: true}, {name: 'seo', title: 'Search appearance'}],
  fields: [
    {...requiredText('heading', 'Headline — first line', 90), group: 'hero', initialValue: 'Thoughtful websites.'},
    {...requiredText('subheading', 'Headline — second line', 90), group: 'hero', initialValue: 'Designed for your business.'},
    defineField({name: 'intro', title: 'Introduction', type: 'text', rows: 3, group: 'hero',
      description: 'A short introduction beside the Explore selected work link.',
      validation: (rule) => rule.required().max(400)}),
    {...requiredText('seoTitle', 'Browser and search title', 90), group: 'seo'},
    defineField({name: 'seoDescription', title: 'Search description', type: 'text', rows: 3, group: 'seo',
      validation: (rule) => rule.required().max(300)}),
  ],
  preview: {prepare: () => ({title: 'Tedits Studio homepage'})},
})

const project = defineType({
  name: 'project', title: 'Portfolio project', type: 'document',
  groups: [{name: 'card', title: 'Project card', default: true}, {name: 'story', title: 'Behind the design'}],
  fields: [
    {...requiredText('title', 'Project name', 100), group: 'card'},
    defineField({name: 'concept', title: 'Concept page', type: 'string', group: 'card',
      description: 'Choose an existing built concept. Each concept should have one published project entry.',
      options: {list: [
        {title: 'Olive & Ember', value: 'catering'},
        {title: 'Rivet & Beam', value: 'rivet-beam'},
        {title: 'AFTERHOURS', value: 'afterhours'},
      ], layout: 'radio'}, validation: (rule) => rule.required()}),
    defineField({name: 'order', title: 'Display order', type: 'number', group: 'card', initialValue: 1,
      validation: (rule) => rule.required().integer().min(1).max(99)}),
    {...requiredText('category', 'Business category', 80), group: 'card'},
    defineField({name: 'description', title: 'Short description', type: 'text', rows: 3, group: 'card',
      validation: (rule) => rule.required().max(500)}),
    {...requiredText('scope', 'Services provided', 150), group: 'card'},
    defineField({name: 'image', title: 'Preview image', type: 'image', group: 'card', options: {hotspot: true},
      description: 'Optional. If empty, the existing local preview image is used.', fields: [
        defineField({name: 'alt', title: 'Image description', type: 'string',
          description: 'Describe the image for someone who cannot see it.', validation: (rule) => rule.required().max(250)}),
      ]}),
    defineField({name: 'idea', title: 'The idea', type: 'text', rows: 4, group: 'story',
      validation: (rule) => rule.required().max(1500)}),
    defineField({name: 'execution', title: 'How it took shape', type: 'text', rows: 4, group: 'story',
      validation: (rule) => rule.required().max(1500)}),
    defineField({name: 'disclaimer', title: 'Concept disclosure', type: 'text', rows: 3, group: 'story',
      description: 'Keep the fictional project disclosure and any image or music credits accurate.',
      validation: (rule) => rule.required().max(1200)}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrder', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'category', media: 'image'}},
})

export const schemaTypes = [homepage, project, ...catalogues]
