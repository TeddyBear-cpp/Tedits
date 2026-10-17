import {defineField, defineType, type FieldDefinition} from 'sanity'

const text = (name: string, title: string, required = true) => defineField({name, title, type: 'string', validation: r => required ? r.required().max(300) : r.max(300)})
const image = defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}, fields: [text('alt', 'Image description')]})
const choice = (name: string, title: string, values: string[]) => defineField({name, title, type: 'string', options: {list: values}, validation: r => r.required()})
function catalogue(name: string, title: string, item: string, fields: FieldDefinition[], max: number) {
  return defineType({name, title, type: 'document', fields: [defineField({name: 'items', title: 'Catalogue items', type: 'array', description: 'Drag to change display order. Publish, then rebuild the website to show changes.', validation: r => r.required().min(1).max(max), of: [{type: 'object', name: item, fields, preview: {select: {title: 'title', media: 'image'}}}]})], preview: {prepare: () => ({title})}})
}
export const catalogues = [
  catalogue('menuCatalogue', 'Olive & Ember menus', 'menu', [
    text('title', 'Tab label'), text('eyebrow', 'Short introduction'), text('heading', 'Heading'), text('accent', 'Heading accent'),
    choice('occasion', 'Enquiry occasion', ['Weddings & celebrations', 'Breakfast & brunch', 'Weekly meal prep']),
    choice('localImage', 'Fallback photo', ['assets/seasonal-meals.jpg', 'assets/brunch.jpg', 'assets/salad.jpg']), image,
    text('alt', 'Fallback photo description'),
    defineField({name: 'dishes', title: 'Dishes', type: 'array', validation: r => r.required().min(1).max(20), of: [{type: 'object', name: 'dish', fields: [text('title', 'Dish name'), text('description', 'Description'), text('dietary', 'Dietary labels (optional)', false)], preview: {select: {title: 'title'}}}]}),
  ], 8),
  catalogue('materialCatalogue', 'Rivet & Beam materials and promos', 'material', [
    text('title', 'Product or service name'), text('description', 'Description and specifications'), text('promo', 'Promo label (optional)', false),
    choice('enquiry', 'Enquiry category', ['structural', 'tubes', 'custom']),
    choice('localImage', 'Fallback photo', ['concept-assets/steel-beams.jpg', 'concept-assets/metal-tubes.jpg', 'concept-assets/welder-hero.jpg']), image, text('alt', 'Fallback photo description'),
  ], 24),
  catalogue('trackCatalogue', 'AFTERHOURS tracks', 'track', [
    text('title', 'Track title'), text('artist', 'Artist'), text('genre', 'Genre'), text('tag', 'Track label'), text('note', 'Sample or credit note (optional)', false),
    defineField({name: 'localAudio', title: 'Existing audio', type: 'string', options: {list: ['assets/audio/do-this-often-teddybear.mp3', 'assets/audio/the-lead-teddybear.mp3']}}),
    defineField({name: 'audio', title: 'Upload audio (overrides existing audio)', type: 'file', options: {accept: 'audio/mpeg'}, validation: r => r.custom((value, context) => value || (context.parent as {localAudio?: string})?.localAudio ? true : 'Choose existing audio or upload an MP3.')}),
    defineField({name: 'spotify', title: 'Spotify track URL (optional)', type: 'url', validation: r => r.custom(value => !value || /^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/.test(value) ? true : 'Use https://open.spotify.com/track/ followed by the track ID.')}),
  ], 30),
]
