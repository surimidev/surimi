import { select } from 'surimi';

select('.surimi-editor__view').style({
  flexShrink: '1 !important',
});

select('.surimi-editor__view-overlay').style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  // Move up slightly
  zIndex: 30,
});

const handleWidth = 3;
const handleMargin = handleWidth * 20;

select('.resizable-handle-right')
  .style({
    height: `calc(100% - ${handleMargin * 2}px) !important`,
    width: '100%',
    backgroundColor: '#cecece',
    transform: `translateX(${handleWidth * 2}px)`,
    top: `${handleMargin}px !important`,
  })
  .hover()
  .style({
    backgroundColor: '#bbb',
  });

select('.resizable-handle-bottom')
  .style({
    height: '100%',
    width: `calc(100% - ${handleMargin * 2}px) !important`,
    backgroundColor: '#cecece',
    transform: `translateY(${handleWidth * 2}px)`,
    left: `${handleMargin}px !important`,
  })
  .hover()
  .style({
    backgroundColor: '#bbb',
  });
