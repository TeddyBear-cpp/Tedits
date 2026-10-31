import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'teditstudio',
  title: 'Tedits Studio · Content',
  projectId: 'yjcpyptx',
  dataset: 'production',
  plugins: [structureTool({
    structure: (S) => S.list().title('Website content').items([
      S.listItem().title('Homepage').child(
        S.document().schemaType('homepage').documentId('homepage')
      ),
      S.listItem().title('Portfolio projects').child(
        S.documentTypeList('project').title('Portfolio projects').defaultOrdering([
          {field: 'order', direction: 'asc'},
        ])
      ),
      ...[['menuCatalogue', 'Olive & Ember menus'], ['materialCatalogue', 'Rivet & Beam materials and promos'], ['trackCatalogue', 'AFTERHOURS tracks']].map(([type, title]) =>
        S.listItem().title(title).child(S.document().schemaType(type).documentId(type))
      ),
    ]),
  })],
  schema: {types: schemaTypes},
  document: {
    newDocumentOptions: (options) => options.filter((option) => !['homepage', 'menuCatalogue', 'materialCatalogue', 'trackCatalogue'].includes(option.templateId)),
    actions: (actions, context) => ['homepage', 'menuCatalogue', 'materialCatalogue', 'trackCatalogue'].includes(context.schemaType)
      ? actions.filter((action) => !['delete', 'duplicate', 'unpublish'].includes(action.action || ''))
      : actions,
  },
})
