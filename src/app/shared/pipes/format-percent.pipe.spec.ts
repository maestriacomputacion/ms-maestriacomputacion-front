import { FormatPercentPipe } from './format-percent.pipe';

describe('FormatPercentPipe', () => {
  let pipe: FormatPercentPipe;
  beforeEach(() => { pipe = new FormatPercentPipe(); });

  it('shouldFormatNumberWithTwoDecimalsWhenNoDecimalsSpecified', () => {
    expect(pipe.transform(25.5)).toBe('25.50 %');
  });

  it('shouldFormatNumberWithZeroDecimalsWhenDecimalsIsZero', () => {
    expect(pipe.transform(25.5, 0)).toBe('26 %');
  });

  it('shouldFormatNumberWithOneDecimalWhenDecimalsIsOne', () => {
    expect(pipe.transform(25.5, 1)).toBe('25.5 %');
  });

  it('shouldReturnDashWhenValueIsNull', () => {
    expect(pipe.transform(null)).toBe('–');
  });

  it('shouldReturnDashWhenValueIsUndefined', () => {
    expect(pipe.transform(undefined)).toBe('–');
  });

  it('shouldFormatZeroCorrectlyWhenValueIsZero', () => {
    expect(pipe.transform(0)).toBe('0.00 %');
  });
});
