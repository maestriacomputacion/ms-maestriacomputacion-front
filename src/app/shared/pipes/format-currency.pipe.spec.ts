import { FormatCurrencyPipe } from './format-currency.pipe';

describe('FormatCurrencyPipe', () => {
  let pipe: FormatCurrencyPipe;
  beforeEach(() => { pipe = new FormatCurrencyPipe(); });

  it('shouldFormatPositiveNumberAsCOPCurrencyWhenValueIsValid', () => {
    const result = pipe.transform(1000000);
    expect(result).toContain('1.000.000');
  });

  it('shouldReturnDashWhenValueIsNull', () => {
    expect(pipe.transform(null)).toBe('–');
  });

  it('shouldReturnDashWhenValueIsUndefined', () => {
    expect(pipe.transform(undefined)).toBe('–');
  });

  it('shouldFormatZeroCorrectlyWhenValueIsZero', () => {
    const result = pipe.transform(0);
    expect(result).toContain('0');
  });
});
