// Test fixture with complex export scenarios
import { select } from 'surimi';

select('.theme').style({
  fontFamily: 'system-ui',
});

// Various export types
export const stringValue = 'hello';
export const numberValue = 42;
export const booleanValue = true;
export const nullValue = null;
export const arrayValue = [1, 2, 3];
export const objectValue = { a: 1, b: 'test' };
export const nestedObject = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
  },
  spacing: [0, 4, 8, 16, 32],
};
