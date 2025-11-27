import { select } from 'surimi';

export const card = select('.card').style({
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
});

export const cardHeader = select('.card-header').style({
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #e5e7eb',
});

export const cardBody = select('.card-body').style({
  fontSize: '1rem',
  lineHeight: '1.5',
});

export const cardFooter = select('.card-footer').style({
  marginTop: '1rem',
  paddingTop: '1rem',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.5rem',
});

export const cardElevated = select('.card-elevated').style({
  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
});
