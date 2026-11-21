// Code highlighting themes drawn from the Graph State palette.
// Restrained on purpose: keywords in nitrogen, literals in oxygen, comments muted.
const make = (name, type, c) => ({
  name,
  type,
  colors: { 'editor.background': c.bg, 'editor.foreground': c.ink },
  tokenColors: [
    { settings: { foreground: c.ink } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.muted, fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new', 'keyword.operator.logical'], settings: { foreground: c.nitrogen } },
    { scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: c.oxygen } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'support.constant'], settings: { foreground: c.oxygen } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'], settings: { foreground: c.fn } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type'], settings: { foreground: c.nitrogen } },
    { scope: ['variable.parameter', 'meta.decorator', 'entity.name.function.decorator'], settings: { foreground: c.deco } },
    { scope: ['keyword.operator', 'punctuation'], settings: { foreground: c.punct } },
    { scope: ['markup.heading'], settings: { foreground: c.nitrogen } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    { scope: ['markup.inserted'], settings: { foreground: c.nitrogen } },
    { scope: ['markup.deleted'], settings: { foreground: c.oxygen } },
  ],
});

export const graphStateLight = make('graph-state-light', 'light', {
  bg: '#EEEEEA', ink: '#1A1B1F', muted: '#5B5E67', nitrogen: '#2E4BC6', oxygen: '#B8322A',
  fn: '#1F3590', deco: '#7A5600', punct: '#4A4D55',
});

export const graphStateDark = make('graph-state-dark', 'dark', {
  bg: '#0B0C0F', ink: '#ECECE7', muted: '#9A9DA6', nitrogen: '#8EA2FF', oxygen: '#FF7B6F',
  fn: '#C3CEFF', deco: '#F2C94C', punct: '#B4B7BF',
});
