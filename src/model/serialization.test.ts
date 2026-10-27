import { describe, expect, it } from 'vitest';
import { DOCUMENT_BYTE_LIMIT } from './constants';
import { parseDocument, serializeDocument, validateDocument } from './serialization';
import { TEMPLATES } from './templates';

const sample = () => structuredClone(TEMPLATES[0].document);

describe('portable document validation', () => {
  it('round trips both furnished examples as plain versioned data', () => {
    for (const template of TEMPLATES) {
      expect(parseDocument(serializeDocument(template.document))).toEqual(template.document);
    }
  });

  it('rejects invalid versions, duplicate identifiers and unsupported fields', () => {
    expect(() => validateDocument({ ...sample(), version: 2 })).toThrow('version');
    const repeated = sample();
    repeated.items.push({ ...repeated.items[0] });
    expect(() => validateDocument(repeated)).toThrow('unique');
    expect(() => validateDocument({ ...sample(), script: 'alert(1)' })).toThrow(
      'unsupported property',
    );
  });

  it('rejects non-finite, wrong-type and rotated out-of-bounds geometry', () => {
    const invalid = sample();
    invalid.items[0].x = Infinity;
    expect(() => validateDocument(invalid)).toThrow('finite');
    invalid.items[0] = { ...sample().items[0], x: 25, rotation: 45 };
    expect(() => validateDocument(invalid)).toThrow('beyond the room');
    expect(() =>
      validateDocument({ ...sample(), room: { ...sample().room, width: '640' } }),
    ).toThrow('finite');
    invalid.items[0] = { ...sample().items[0], color: 'url(https://example.test)' };
    expect(() => validateDocument(invalid)).toThrow('hex color');
  });

  it('rejects excessive files and invalid JSON without touching an existing document', () => {
    const existing = sample();
    const before = structuredClone(existing);
    expect(() => parseDocument('{broken')).toThrow('valid JSON');
    expect(() => parseDocument(' '.repeat(DOCUMENT_BYTE_LIMIT + 1))).toThrow('too large');
    expect(existing).toEqual(before);
  });
});
