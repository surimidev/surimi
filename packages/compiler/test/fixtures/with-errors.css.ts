import { select } from 'surimi';

// This file will cause a runtime error
select('.error').style({
  display: 'flex',
});

// Reference to undefined variable
const undefinedVariable = nonExistentVariable;
